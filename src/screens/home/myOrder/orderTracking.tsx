import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../../../constant';
import { TextView } from '../../../components';
import ApiService from '../../../service/apiService';
import styles from './myOrder.styles';
import Geolocation from 'react-native-geolocation-service';
import { Platform } from 'react-native';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface Props {
  route: any;
  navigation: any;
}

const OrderTracking: React.FC<Props> = ({ route, navigation }) => {
  const { orderId, order: passedOrder } = route.params || {};
  const [order, setOrder] = useState<any>(passedOrder || null);
  const [loading, setLoading] = useState(!passedOrder);
  const [addressText, setAddressText] = useState<string>('Loading address...');
  const [mapCoords, setMapCoords] = useState<{ lat: number; long: number }>({ lat: 28.6139, long: 77.209 });
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; long: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; long: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Dynamic status steps based on current order status
  const getStatusSteps = (currentStatus: string) => {
    const status = currentStatus?.toLowerCase() || 'pending';
    
    // Define all possible status flows
    const statusFlows: { [key: string]: string[] } = {
      'pending': ['pending'],
      'accepted': ['pending', 'accepted'],
      'packed': ['pending', 'accepted', 'packed'],
      'delivered': ['pending', 'accepted', 'packed', 'delivered'],
      'return': ['pending', 'accepted', 'packed', 'delivered', 'return'],
      'cancelled': ['pending', 'cancelled'],
      'out_for_delivery': ['pending', 'accepted', 'packed', 'out_for_delivery'],
    };

    // Return the appropriate flow based on current status
    return statusFlows[status] || ['pending'];
  };

  const formatAddress = (addrObj: any) => {
    if (!addrObj) return '';
    if (typeof addrObj === 'string') return addrObj;

    const lat = addrObj?.lat || addrObj?.latitude || addrObj?.latLong?.lat || addrObj?.location?.lat;
    const long = addrObj?.long || addrObj?.longitude || addrObj?.latLong?.long || addrObj?.location?.long;
    if (lat && long) {
      setMapCoords({ lat: Number(lat), long: Number(long) });
    }

    const parts = [
      addrObj.houseNoOrFlatNo,
      addrObj.floor ? `Floor ${addrObj.floor}` : '',
      addrObj.landmark,
      addrObj.city,
      addrObj.pincode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  // WebSocket connection for real-time tracking
  const connectWebSocket = () => {
    if (!orderId || !shouldReconnectRef.current) return;
    
    try {
      // WebSocket connection - using same server as API
      const wsUrl = `ws://159.89.146.245:5010/ws/order/${orderId}`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected for order tracking');
        setWsConnected(true);
      };
      
      wsRef.current.onmessage = (event: any) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket data received:', data);
          
          // Handle different event types
          if (data.type === 'driver_location') {
            setDriverLocation({
              lat: data.location.lat,
              long: data.location.lng
            });
            setDistance(data.distance);
            setEta(data.eta);
            setLastUpdate(new Date());
          }
          
          if (data.type === 'driver_info') {
            setDriverInfo(data.driver);
          }
          
          if (data.type === 'order_status') {
            setOrder((prev: any) => ({
              ...prev,
              status: data.status
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        if (!shouldReconnectRef.current) {
          return;
        }

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };
      
      wsRef.current.onerror = (error: any) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };
  
  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Format distance display
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!orderId) return;
      try {
        // First try to get order details
        const detailsRes = await ApiService.getOrderDetails(orderId);
        const orderData = detailsRes?.data?.data || (detailsRes as any)?.data?.order || (detailsRes as any)?.data?.orders?.[0] || (detailsRes as any)?.data;
        if (orderData) setOrder(orderData);

        // Then try to get tracking data
        try {
          console.log('Fetching tracking data for order:', orderId);
          const trackingRes = await ApiService.trackOrder(orderId);
          const trackingData = trackingRes?.data?.data;
          if (trackingData) {
            console.log('Tracking data received:', trackingData);
            // Update order with tracking information
            setOrder((prev: any) => ({
              ...prev,
              ...trackingData,
              driver: trackingData.driver,
              status: trackingData.status || prev?.status
            }));
            
            // Set driver info if available
            if (trackingData.driver) {
              setDriverInfo(trackingData.driver);
            }
            
            // Set driver location if available
            if (trackingData.driverLocation) {
              setDriverLocation({
                lat: trackingData.driverLocation.latitude,
                long: trackingData.driverLocation.longitude
              });
            }
          }
        } catch (trackingError: any) {
          console.log('Tracking API not available or failed:', trackingError?.response?.data || trackingError?.message);
          // Continue with order details even if tracking fails
        }
      } catch (err: any) {
        console.log('Order detail fetch error:', err?.response?.data || err?.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (!passedOrder) {
      fetchDetail();
    }
    
    // Connect WebSocket for real-time updates
    connectWebSocket();
    
    // Cleanup WebSocket on unmount
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [orderId, passedOrder]);

  useEffect(() => {
    const resolveAddress = async () => {
      const o = order || passedOrder;
      if (!o) return;

      const directAddr =
        formatAddress(o.address) ||
        formatAddress(o.deliveryAddress) ||
        formatAddress(o.shippingAddress) ||
        formatAddress(o.addressLine) ||
        formatAddress(o.addressText) ||
        formatAddress(o.deliveryAddressText);

      if (directAddr) {
        setAddressText(directAddr);
        return;
      }

      if (o.addressId) {
        try {
          const res = await ApiService.getAddresses();
          const list = res?.data?.address?.[0]?.addresses || res?.data?.addresses || res?.data?.data?.addresses || [];
          const found = list.find((addr: any) => addr?._id === o.addressId);
          if (found) {
            const text = formatAddress(found);
            setAddressText(text || 'Address available');
            return;
          }
        } catch (err: any) {
          console.log('Address lookup failed:', err?.response?.data || err?.message);
        }
      }

      setAddressText('Address not available');
    };

    resolveAddress();
  }, [order, passedOrder]);

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      let permissionStatus;
      if (Platform.OS === 'ios') {
        permissionStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else {
        const current = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (current === RESULTS.BLOCKED) {
          setLocationLoading(false);
          return;
        }
        permissionStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }

      if (permissionStatus === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          (position: any) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, long: longitude });
            setLocationLoading(false);
          },
          (error: any) => {
            console.log('Error getting location:', error);
            setLocationLoading(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 10000,
            ...(Platform.OS === 'android' && { forceLocationManager: true }),
          }
        );
      } else {
        setLocationLoading(false);
      }
    } catch (error) {
      console.log('Error requesting location permission:', error);
      setLocationLoading(false);
    }
  };

  const currentStatus = (order?.status || order?.orderStatus || 'pending').toLowerCase();
  const statusSteps = getStatusSteps(currentStatus);
  const statusIndex = statusSteps.findIndex((s: string) => currentStatus.includes(s)) ?? 0;

  const generateMapHTML = () => {
    const deliveryLat = mapCoords.lat;
    const deliveryLon = mapCoords.long;
    const currentLat = currentLocation?.lat ?? 'null';
    const currentLon = currentLocation?.long ?? 'null';
    const driverLat = driverLocation?.lat ?? 'null';
    const driverLon = driverLocation?.long ?? 'null';
    const currentDistance = distance || 2.5;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body { margin: 0; padding: 0; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            #map { width: 100%; height: 100vh; }
            .info-box {
              position: absolute;
              top: 10px;
              left: 10px;
              background: white;
              padding: 12px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              z-index: 1000;
              min-width: 200px;
            }
            .info-title {
              font-weight: 600;
              color: #333;
              margin-bottom: 4px;
            }
            .info-text {
              font-size: 14px;
              color: #666;
              margin: 2px 0;
            }
            .live-indicator {
              display: inline-block;
              width: 8px;
              height: 8px;
              background: #4CAF50;
              border-radius: 50%;
              margin-right: 6px;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
            
            /* Blinkit-style animations */
            .driver-marker {
              animation: bounce 1.5s ease-in-out infinite;
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }
            
            .route-line {
              stroke-dasharray: 10, 5;
              animation: dash 20s linear infinite;
            }
            @keyframes dash {
              to { stroke-dashoffset: -1000; }
            }
            
            .delivery-marker {
              animation: pulse-scale 2s ease-in-out infinite;
            }
            @keyframes pulse-scale {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            
            .distance-label {
              background: rgba(76, 175, 80, 0.9);
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              position: absolute;
              transform: translate(-50%, -150%);
              white-space: nowrap;
            }
          </style>
        </head>
        <body>
          <div class="info-box">
            <div class="info-title">
              <span class="live-indicator"></span>
              Live Tracking
            </div>
            ${driverInfo ? `
              <div class="info-text">Driver: ${driverInfo.name}</div>
              <div class="info-text">Vehicle: ${driverInfo.vehicle?.model || 'N/A'}</div>
            ` : ''}
            ${distance ? `<div class="info-text">Distance: ${formatDistance(distance)}</div>` : ''}
            ${eta ? `<div class="info-text">ETA: ${eta}</div>` : ''}
            ${lastUpdate ? `<div class="info-text">Updated: ${lastUpdate.toLocaleTimeString()}</div>` : ''}
          </div>
          <div id="map"></div>
          <script>
            let driverMarker, routeLine, distanceLabel;
            let map;
            
            function initMap() {
              const bounds = new google.maps.LatLngBounds();
              
              map = new google.maps.Map(document.getElementById("map"), {
                zoom: 14,
                styles: [
                  {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                  },
                  {
                    featureType: "transit",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                  }
                ]
              });

              // Delivery location marker with animation
              const deliveryMarker = new google.maps.Marker({
                position: { lat: ${deliveryLat}, lng: ${deliveryLon} },
                map: map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 15,
                  fillColor: '#ff4444',
                  fillOpacity: 0.9,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                  className: 'delivery-marker'
                },
                title: "Delivery Address",
                label: {
                  text: "🏠",
                  fontSize: "20px"
                },
                animation: google.maps.Animation.DROP
              });
              bounds.extend({ lat: ${deliveryLat}, lng: ${deliveryLon} });

              ${currentLocation ? `
              // Your location marker
              const yourMarker = new google.maps.Marker({
                position: { lat: ${currentLat}, lng: ${currentLon} },
                map: map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#4444ff',
                  fillOpacity: 0.8,
                  strokeColor: '#ffffff',
                  strokeWeight: 2
                },
                title: "Your Location",
                label: {
                  text: "📍",
                  fontSize: "16px"
                }
              });
              bounds.extend({ lat: ${currentLat}, lng: ${currentLon} });
              ` : ''}

              ${driverLocation ? `
              // Driver location marker (Blinkit-style scooter)
              driverMarker = new google.maps.Marker({
                position: { lat: ${driverLat}, lng: ${driverLon} },
                map: map,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="#4CAF50" opacity="0.9"/><text x="20" y="28" text-anchor="middle" font-size="20" fill="white">🛵</text></svg>'),
                  scaledSize: new google.maps.Size(40, 40),
                  anchor: new google.maps.Point(20, 20)
                },
                title: "Driver Location",
                animation: google.maps.Animation.DROP
              });
              bounds.extend({ lat: ${driverLat}, lng: ${driverLon} });

              // Distance label on driver marker
              distanceLabel = new google.maps.Marker({
                position: { lat: ${driverLat}, lng: ${driverLon} },
                map: map,
                label: {
                  text: '${distance ? formatDistance(distance) : ""}',
                  className: 'distance-label',
                  color: 'white'
                },
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 0.001
                },
                zIndex: 1000
              });

              // Animated route line from driver to delivery
              const directionsService = new google.maps.DirectionsService();
              const directionsRenderer = new google.maps.DirectionsRenderer({
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#4CAF50',
                  strokeWeight: 6,
                  strokeOpacity: 0.8,
                  geodesic: true,
                  className: 'route-line'
                }
              });
              
              directionsRenderer.setMap(map);
              
              directionsService.route({
                origin: { lat: ${driverLat}, lng: ${driverLon} },
                destination: { lat: ${deliveryLat}, lng: ${deliveryLon} },
                travelMode: google.maps.TravelMode.DRIVING
              }, function(response, status) {
                if (status === 'OK') {
                  directionsRenderer.setDirections(response);
                  // Animate driver along route
                  animateDriver(response.routes[0].overview_path);
                }
              });
              ` : ''}

              // Fit map to show all markers
              if (!bounds.isEmpty()) {
                map.fitBounds(bounds);
              }
            }
            
            // Animate driver movement along route
            function animateDriver(path) {
              if (!driverMarker || path.length < 2) return;
              
              let step = 0;
              const totalSteps = path.length;
              
              function moveDriver() {
                if (step >= totalSteps - 1) {
                  // Driver reached destination
                  driverMarker.setAnimation(google.maps.Animation.BOUNCE);
                  if (distanceLabel) distanceLabel.setMap(null);
                  return;
                }
                
                const current = path[step];
                const next = path[step + 1];
                
                // Smooth animation between points
                const lat = current.lat();
                const lng = current.lng();
                
                driverMarker.setPosition({ lat: lat, lng: lng });
                
                if (distanceLabel) {
                  distanceLabel.setPosition({ lat: lat, lng: lng });
                  // Update distance label based on remaining distance
                  const remainingDistance = calculateRemainingDistance(step, totalSteps);
                  distanceLabel.setLabel({
                    text: formatDistance(remainingDistance),
                    className: 'distance-label',
                    color: 'white'
                  });
                }
                
                step++;
                
                // Continue animation
                setTimeout(moveDriver, 1000);
              }
              
              moveDriver();
            }
            
            // Calculate remaining distance
            function calculateRemainingDistance(currentStep, totalSteps) {
              const progress = currentStep / totalSteps;
              const totalDistance = ${currentDistance};
              return totalDistance * (1 - progress);
            }
            
            // Format distance for display
            function formatDistance(distance) {
              if (distance < 1) {
                return Math.round(distance * 1000) + 'm away';
              }
              return distance.toFixed(1) + 'km away';
            }
          </script>
          <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAVnkWhVaQ3Sj4XjlNi65oCMiBoh0BzuFA&callback=initMap"></script>
        </body>
      </html>
    `;
  };

  if (!order && !loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <TextView style={{ color: '#000', fontWeight: '700', fontSize: 16, marginBottom: 8 }}>
          Order not available
        </TextView>
        <TextView style={{ color: '#666', textAlign: 'center' }}>
          Please go back and open tracking again.
        </TextView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={{ position: 'relative', height: 260, backgroundColor: '#f0f0f0' }}>
          {mapFailed ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <Icon name="map-pin" size={48} color={Colors.PRIMARY[100]} />
              <TextView style={{ marginTop: 8, color: '#000', fontWeight: '700' }}>Map unavailable</TextView>
              <TextView style={{ marginTop: 4, color: '#666', textAlign: 'center' }}>
                {addressText || 'Address not available'}
              </TextView>
            </View>
          ) : (
            <WebView
              originWhitelist={['*']}
              source={{ html: generateMapHTML() }}
              style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              mixedContentMode="always"
              onError={() => setMapFailed(true)}
              onHttpError={() => setMapFailed(true)}
            />
          )}
          
          {/* Back Button on Map */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
              zIndex: 10,
            }}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="#333" />
          </TouchableOpacity>
          
          {/* Live Tracking Indicator */}
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
              zIndex: 10,
              flexDirection: 'row',
            }}
          >
            <View style={{
              width: 8,
              height: 8,
              backgroundColor: wsConnected ? '#4CAF50' : '#FF9800',
              borderRadius: 4,
              marginRight: 6,
            }} />
            <TextView style={{ color: '#333', fontSize: 12, fontWeight: '600' }}>
              {wsConnected ? 'Live' : 'Connecting...'}
            </TextView>
          </View>
          
          {locationLoading && (
            <View style={{ 
              position: 'absolute', 
              top: 60, 
              right: 10, 
              backgroundColor: 'rgba(255,255,255,0.9)', 
              padding: 8, 
              borderRadius: 8,
              zIndex: 10,
            }}>
              <ActivityIndicator size="small" color={Colors.PRIMARY[100]} />
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <TextView style={{ color: '#000', fontWeight: '700', fontSize: 18 }}>
              Order Tracking
            </TextView>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 8,
                height: 8,
                backgroundColor: wsConnected ? '#4CAF50' : '#FF9800',
                borderRadius: 4,
                marginRight: 6,
              }} />
              <TextView style={{ color: '#666', fontSize: 12 }}>
                {wsConnected ? 'Live' : 'Connecting...'}
              </TextView>
            </View>
          </View>

          {/* Driver Info Card */}
          {(driverInfo || driverLocation) && (
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#eee',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: '#E8F5E8',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <MaterialIcons name="delivery-dining" size={28} color="#4CAF50" />
                </View>
                <View style={{ flex: 1 }}>
                  <TextView style={{ color: '#000', fontWeight: '700', fontSize: 16 }}>
                    {driverInfo?.name || 'Delivery Partner'}
                  </TextView>
                  <TextView style={{ color: '#666', fontSize: 12 }}>
                    {driverInfo?.vehicle?.model || 'Delivery Vehicle'}
                  </TextView>
                </View>
                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#E8F5E8',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    if (driverInfo?.phone) {
                      // Handle phone call
                      console.log('Calling driver:', driverInfo.phone);
                    }
                  }}
                >
                  <Icon name="phone" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>

              {/* Distance and ETA */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <TextView style={{ color: '#666', fontSize: 12 }}>Distance</TextView>
                  <TextView style={{ color: '#000', fontWeight: '700', fontSize: 16 }}>
                    {distance ? formatDistance(distance) : 'Calculating...'}
                  </TextView>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <TextView style={{ color: '#666', fontSize: 12 }}>ETA</TextView>
                  <TextView style={{ color: '#000', fontWeight: '700', fontSize: 16 }}>
                    {eta || 'Calculating...'}
                  </TextView>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <TextView style={{ color: '#666', fontSize: 12 }}>Status</TextView>
                  <TextView style={{ color: '#4CAF50', fontWeight: '700', fontSize: 12 }}>
                    On the way
                  </TextView>
                </View>
              </View>
            </View>
          )}

          <View style={{ backgroundColor: '#F4F7F2', borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <TextView style={{ color: '#000', fontWeight: '700' }}>Status: {currentStatus.toUpperCase()}</TextView>
            <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center', justifyContent: 'space-between' }}>
              {statusSteps.map((step: string, idx: number) => {
                const reached = idx <= statusIndex;
                return (
                  <View key={step} style={{ alignItems: 'center', flex: 1 }}>
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: reached ? '#1B743E' : '#D1D1D1',
                      }}
                    />
                    <TextView style={{ fontSize: 11, color: '#444', marginTop: 6 }}>{step}</TextView>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2, marginBottom: 16, borderWidth: 1, borderColor: '#eee' }}>
            <TextView style={{ color: '#000', fontWeight: '700', marginBottom: 6 }}>Delivery Address</TextView>
            <TextView style={{ color: '#444' }}>{addressText}</TextView>
          </View>

          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2, borderWidth: 1, borderColor: '#eee' }}>
            <TextView style={{ color: '#000', fontWeight: '700', marginBottom: 8 }}>Order Summary</TextView>

            {(order?.products || order?.items || []).map((product: any, idx: number) => {
              const productObj = product.productId || product.product || product;
              const price = Number(product.price || product.amount || productObj?.price || 0);
              return (
                <View
                  key={`${order?._id}-summary-${idx}`}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}
                >
                  <TextView style={{ color: '#000', flex: 1 }} numberOfLines={2}>
                    {productObj?.name || 'Item'}
                  </TextView>
                  <TextView style={{ color: '#444' }}>Qty: {product.quantity || 1}</TextView>
                  <TextView style={{ color: '#000', fontWeight: '700' }}>₹{price}</TextView>
                </View>
              );
            })}

            <View style={{ borderTopWidth: 1, borderColor: '#eee', marginTop: 8, paddingTop: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <TextView style={{ color: '#000' }}>Payment</TextView>
                <TextView style={{ color: '#000', fontWeight: '700' }}>
                  {(order?.paymentMethod || '').toUpperCase()}
                </TextView>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TextView style={{ color: '#000', fontWeight: '700' }}>Grand Total</TextView>
                <TextView style={{ color: '#000', fontWeight: '700' }}>
                  ₹{order?.grandTotal || order?.totalAmount || order?.total || 0}
                </TextView>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16, alignItems: 'center', paddingVertical: 12 }}
          >
            <TextView style={{ color: Colors.PRIMARY[100], fontWeight: '700' }}>Close</TextView>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)' }}>
          <ActivityIndicator size="large" color={Colors.PRIMARY[100]} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default OrderTracking;
