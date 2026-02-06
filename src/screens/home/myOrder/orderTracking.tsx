import React, { useEffect, useState } from 'react';
import { View, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../../../constant';
import { TextView } from '../../../components';
import ApiService from '../../../service/apiService';
import styles from './myOrder.styles';
import Geolocation from 'react-native-geolocation-service';
import { Platform } from 'react-native';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/Feather';

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

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body { margin: 0; padding: 0; overflow: hidden; }
            #map { width: 100%; height: 100vh; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            function initMap() {
              const map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: ${deliveryLat}, lng: ${deliveryLon} },
                zoom: ${currentLocation ? 13 : 15},
              });

              new google.maps.Marker({
                position: { lat: ${deliveryLat}, lng: ${deliveryLon} },
                map: map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#ff4444',
                  fillOpacity: 0.8,
                  strokeColor: '#ffffff',
                  strokeWeight: 2
                },
                title: "Delivery Address"
              });

              ${currentLocation ? `
              new google.maps.Marker({
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
                title: "Your Location"
              });

              const bounds = new google.maps.LatLngBounds();
              bounds.extend({ lat: ${deliveryLat}, lng: ${deliveryLon} });
              bounds.extend({ lat: ${currentLat}, lng: ${currentLon} });
              map.fitBounds(bounds);
              ` : ''}
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
          {locationLoading && (
            <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 8 }}>
              <ActivityIndicator size="small" color={Colors.PRIMARY[100]} />
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <TextView style={{ color: '#000', fontWeight: '700', fontSize: 18, marginBottom: 12 }}>
            Order Tracking
          </TextView>

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