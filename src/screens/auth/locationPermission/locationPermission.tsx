import React, { FC, useContext } from 'react';
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
import { Colors, Images } from '../../../constant';
import { widthPercentageToDP as wp } from '../../../constant/dimentions';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Toast from 'react-native-toast-message';
import ApiService from '../../../service/apiService';
import { LocalStorage } from '../../../helpers/localstorage';
import { UserData, UserDataContext } from '../../../context/userDataContext';

type LocationPermissionScreenNavigationType = NativeStackNavigationProp<
  AuthStackProps,
  'LocationPermission'
>;

const LocationPermission: FC = () => {
  const navigation = useNavigation<LocationPermissionScreenNavigationType>();
  const { showLoader, hideLoader } = CommonLoader();
  const { setIsLoggedIn, setUserData } = useContext<UserData>(UserDataContext);

  const requestLocationPermission = async () => {
    console.log('[LocationPermission] requestLocationPermission called');
    try {
      let permissionStatus;
      if (Platform.OS === 'ios') {
        console.log('[LocationPermission] Requesting iOS location permission');
        permissionStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else {
        console.log('[LocationPermission] Requesting Android location permission');
        permissionStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }

      console.log('[LocationPermission] Permission status:', permissionStatus);

      if (permissionStatus === RESULTS.GRANTED) {
        console.log('[LocationPermission] Permission granted. Getting current position...');
        Geolocation.getCurrentPosition(
          async (position) => {
            console.log('[LocationPermission] Current position:', position);
            const lat = position.coords.latitude.toString();
            const long = position.coords.longitude.toString();
            console.log('[LocationPermission] Latitude:', lat, 'Longitude:', long);

            try {
              showLoader();
              console.log('[LocationPermission] Sending location to API...');
              const response = await ApiService.sendCurrentLoc(lat, long);
              hideLoader();
              console.log('[LocationPermission] API response:', response);

              if (response.status === 200) {
                console.log('[LocationPermission] Location update successful. Saving data...');
                await LocalStorage.save('@user', JSON.stringify(response.data.user || "Data"));
                setUserData(response.data.user || "Data");
                await LocalStorage.save('@login', true);
                setIsLoggedIn(true);

                Toast.show({
                  type: 'success',
                  text1: 'Location updated successfully!',
                });

                console.log('[LocationPermission] Navigating to HomeStackNavigator...');
                navigation.getParent()?.navigate('HomeStackNavigator');
              } else {
                console.log('[LocationPermission] API returned error message:', response.data?.message);
                Toast.show({
                  type: 'error',
                  text1: response.data?.message || 'Failed to update location',
                });
              }
            } catch (apiError: any) {
              hideLoader();
              console.log('[LocationPermission] API error:', apiError);
              Toast.show({
                type: 'error',
                text1: 'Failed to send location',
                text2: apiError.response?.data?.message || 'Please try again',
              });
            }
          },
          (error) => {
            console.log('[LocationPermission] Geolocation error:', error);
            Toast.show({
              type: 'error',
              text1: 'Failed to get location',
              text2: error.message,
            });
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
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
