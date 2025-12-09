import React, { FC } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import styles from './locationPermission.styles';
import { AuthStackProps } from '../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextView, LinearButton, BorderButton, CommonLoader } from '../../../components';
import { Images } from '../../../constant';
import { widthPercentageToDP as wp } from '../../../constant/dimentions';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import Toast from 'react-native-toast-message';
import ApiService from '../../../service/apiService';
import { reverseGeocode } from '../../../helpers/geocoding';

type LocationPermissionScreenNavigationType = NativeStackNavigationProp<
  AuthStackProps,
  'LocationPermission'
>;

const LocationPermission: FC = () => {
  const navigation = useNavigation<LocationPermissionScreenNavigationType>();
  const { showLoader, hideLoader } = CommonLoader();

  const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      const options: any = {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 60000,
        distanceFilter: 10,
      };

      if (Platform.OS === 'android') {
        options.forceLocationManager = true;
      }

      Geolocation.getCurrentPosition(
        (position: any) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error: any) => {
          let errorMessage = 'Failed to get location';
          if (error.code === 1) {
            errorMessage = 'Location permission denied';
          } else if (error.code === 2) {
            errorMessage = 'Location unavailable';
          } else if (error.code === 3) {
            errorMessage = 'Location request timeout';
          }
          reject({ code: error.code, message: errorMessage });
        },
        options
      );
    });
  };

  const requestLocationPermission = async () => {
    console.log('[LocationPermission] requestLocationPermission called');
    try {
      let permissionStatus;
      if (Platform.OS === 'ios') {
        console.log('[LocationPermission] Requesting iOS location permission');
        permissionStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else {
        console.log('[LocationPermission] Requesting Android location permission');
        const current = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (current === RESULTS.BLOCKED) {
          Toast.show({
            type: 'error',
            text1: 'Location permission blocked',
            text2: 'Enable it from settings to continue', 
          });
          return;
        }
        permissionStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }

      console.log('[LocationPermission] Permission status:', permissionStatus);

      if (permissionStatus === RESULTS.GRANTED) {
        try {
          showLoader();
          console.log('[LocationPermission] Getting current location...');

          const { latitude, longitude } = await getLocation();
          console.log('[LocationPermission] Location obtained:', latitude, longitude);

          let geo;
          try {
            geo = await reverseGeocode(latitude, longitude);
          } catch (geoErr) {
            console.log('[LocationPermission] Reverse geocode failed:', geoErr);
          }

          if (!geo?.city || !geo?.pincode) {
            hideLoader();
            Toast.show({
              type: 'error',
              text1: 'Could not resolve city and pincode from location',
            });
            return;
          }

          try {
            await ApiService.sendCurrentLoc(latitude.toString(), longitude.toString());
          } catch (err) {
            console.log('[LocationPermission] sendCurrentLoc failed, continuing:', err);
          }

          hideLoader();
          (navigation as any).navigate('AddAddress', {
            prefillAddress: {
              pincode: geo.pincode,
              city: geo.city,
              landmark: geo.formattedAddress || geo.landmark || '',
              floor: 'Ground',
              houseNoOrFlatNo: geo.houseNumber || '',
              lat: latitude,
              long: longitude,
            },
          });
        } catch (locationError: any) {
          hideLoader();
          console.log('[LocationPermission] Location error:', locationError);
          
          Toast.show({
            type: 'info',
            text1: locationError?.message || 'Could not get current location',
            text2: 'Please use "Search Your Location" to add address',
          });
        }
      } else {
        console.log('[LocationPermission] Permission denied');
        Toast.show({
          type: 'error',
          text1: 'Location permission denied',
          text2: 'You can allow it from settings',
        });
      }
    } catch (error) {
      console.log('[LocationPermission] Unexpected error:', error);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
      });
    }
  };

  console.log('[LocationPermission] Rendering component');

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View>
          <Image source={Images.img_location} style={styles.imgView} />
        </View>
        <View>
          <TextView style={styles.infoLocation}>
            We use your location to serve you better
          </TextView>
        </View>

        <View>
          <View style={styles.buttonView}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                console.log('[LocationPermission] Allow Location Access button pressed');
                requestLocationPermission();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1B5E20',
                borderWidth: 3,
                borderColor: '#1B5E20',
                borderRadius: 30,
                height: 54,
                paddingHorizontal: 36,
                elevation: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
              }}
            >
              <TextView
                style={{
                  color: '#FFFFFF',
                  fontSize: 17,
                  fontWeight: '400',
                  top: -1,
                }}
              >
                Allow Location Access
              </TextView>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonView}>
            <BorderButton
              title="Search Your Location"
              onPress={() => {
                console.log('[LocationPermission] Search Your Location button pressed');
                navigation.navigate('SearchLocation');
              }}
              iconFamily={'EvilIcons'}
              buttonWidth={wp(80)}
              icon="search"
              showIcon={true}
              titleStyle={styles.buttonTitle}
              
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default LocationPermission;
