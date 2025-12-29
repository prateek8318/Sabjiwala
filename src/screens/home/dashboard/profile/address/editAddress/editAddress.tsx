import React, { FC, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Pressable,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import styles from './editAddress.styles';
import { HomeStackProps } from '../../../../../../@types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LinearButton, TextView } from '../../../../../../components';
import { Colors, Icon, Images } from '../../../../../../constant';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import { reverseGeocode } from '../../../../../../helpers/geocoding';
import Toast from 'react-native-toast-message';

type EditAddressScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'EditAddress'
>;

const EditAddress: FC = () => {
  const navigation = useNavigation<EditAddressScreenNavigationType>();
  const route = useRoute<any>();

  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const initialAddress = route.params?.address || {
    city: 'Noida',
    fullAddress: 'B Block Rd, B Block, Sector 63, Noida, Uttar Pradesh 201301, India',
    addressType: 'Office',
    lat: 28.6218,
    long: 77.3649,
  };

  useEffect(() => {
    if (initialAddress.lat && initialAddress.long) {
      setSelectedLocation({ latitude: initialAddress.lat, longitude: initialAddress.long });
    }
  }, []);

 const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error),
      { 
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
};

  const handleUseCurrentLocation = async () => {
    try {
      let status = Platform.OS === 'ios' 
        ? await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        : await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

      if (status === RESULTS.GRANTED) {
        setLocationLoading(true);
        const loc = await getLocation();
        setSelectedLocation(loc);
        const geo = await reverseGeocode(loc.latitude, loc.longitude);
        setResolvedAddress(geo);
        setLocationLoading(false);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Location failed' });
    }
  };

  const generateMapHTML = () => {
    const lat = selectedLocation?.latitude ?? initialAddress.lat ?? 28.6218;
    const lon = selectedLocation?.longitude ?? initialAddress.long ?? 77.3649;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body { margin:0; padding:0; overflow:hidden; }
            #map { width:100%; height:100vh; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            let marker;
            function initMap() {
              const map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: ${lat}, lng: ${lon} },
                zoom: 17,
              });

              marker = new google.maps.Marker({
                position: { lat: ${lat}, lng: ${lon} },
                map: map,
                draggable: true,
              });

              map.addListener('click', (e) => {
                marker.setPosition(e.latLng);
                window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latLng.lat(), lng: e.latLng.lng() }));
              });

              marker.addListener('dragend', (e) => {
                window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latLng.lat(), lng: e.latLng.lng() }));
              });
            }
          </script>
          <script async src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAsQryHkf5N7-bx_ZBMJ-X7yFMa9WTqwt0&callback=initMap"></script>
        </body>
      </html>
    `;
  };

  const onMapMessage = async (event: any) => {
    try {
      const { lat, lng } = JSON.parse(event.nativeEvent.data);
      setSelectedLocation({ latitude: lat, longitude: lng });
      const geo = await reverseGeocode(lat, lng);
      setResolvedAddress(geo);
    } catch (e) {}
  };

  const handleUpdatePin = () => {
    if (!selectedLocation) return Toast.show({ type: 'error', text1: 'Select location' });
    Toast.show({ type: 'success', text1: 'Pin updated!' });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Address" />

      <View style={styles.viewContainer}>
        <Pressable style={styles.imgMapView} onPress={() => setShowMapModal(true)}>
          <Image source={Images.img_map} style={styles.imgMap} resizeMode="cover" />
        </Pressable>

        <Pressable
          style={[styles.inputContainer, { borderColor: Colors.PRIMARY[100], borderWidth: 0.5 }]}
          onPress={handleUseCurrentLocation}
        >
          <View style={styles.iconView}>
            <Icon family="MaterialIcons" name="gps-fixed" size={30} color={Colors.PRIMARY[100]} />
          </View>
          <TextView style={styles.txtLocation}>Use My Current Location</TextView>
        </Pressable>

        <TextView style={styles.txtOrderInfo}>Your order will be delivering to</TextView>
        <View style={styles.lineDivider} />

        <View style={styles.addressView}>
          <Icon name="location-pin" family="Entypo" color={Colors.ERROR[300]} size={22} />
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextView style={styles.txtAddress}>
                {resolvedAddress?.city || initialAddress.city || 'B Block Rd'}
              </TextView>
              <View style={styles.addressType}>
                <TextView style={styles.addressTypeTxt}>{initialAddress.addressType || 'Office'}</TextView>
              </View>
            </View>
            <TextView style={styles.txtFullAddress}>
              {resolvedAddress?.formattedAddress || initialAddress.fullAddress}
            </TextView>
          </View>
        </View>

        <View style={styles.lineDivider} />
      </View>

      <View style={styles.actionButtonView}>
        <LinearButton
          title="Update the pin & Proceed"
          showIcon
          icon="chevron-right"
          iconFamily="Entypo"
          titleStyle={{ color: Colors.PRIMARY[300] }}
          style={styles.btnView}
          onPress={handleUpdatePin}
        />
      </View>

      {/* Full-screen Map Modal */}
      <Modal visible={showMapModal} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' }}>
            <TextView style={{ fontSize: 18, fontWeight: 'bold' }}>Move pin to exact location</TextView>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Icon family="Entypo" name="cross" size={28} color={Colors.PRIMARY[100]} />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ html: generateMapHTML() }}
            style={{ flex: 1 }}
            javaScriptEnabled
            onMessage={onMapMessage}
          />
          {locationLoading && (
            <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, alignItems: 'center' }}>
              <TextView style={{ color: '#fff', backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 8 }}>
                Fetching location...
              </TextView>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default EditAddress;