import React, { FC, useContext, useState, useEffect } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import styles from './searchLocation.styles';
import { AuthStackProps } from '../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CommonLoader,
  TextView,
  LinearButton,
  Header,
} from '../../../../components';
import { UserData, UserDataContext } from '../../../../context/userDataContext';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../constant/dimentions';
import { Colors, Icon, Images, Typography } from '../../../../constant';
import InputText from '../../../../components/InputText/TextInput';
import Toast from 'react-native-toast-message';
import ApiService from '../../../../service/apiService';
import { LocalStorage } from '../../../../helpers/localstorage';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import { reverseGeocode, GeocodedAddress } from '../../../../helpers/geocoding';

type SearchLocationScreenNavigationType = NativeStackNavigationProp<
  AuthStackProps,
  'SearchLocation'
>;

const SearchLocation: FC = () => {
  const navigation = useNavigation<SearchLocationScreenNavigationType>();
  const [searchQuery, setSearchQuery] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<GeocodedAddress | null>(null);
  const { showLoader, hideLoader } = CommonLoader();
  const { setIsLoggedIn, setUserData } = useContext<UserData>(UserDataContext);

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Fetch location when map opens
  useEffect(() => {
    if (showMapModal) {
      fetchCurrentLocation();
    } else {
      // Reset location when map closes
      setCurrentLocation(null);
      setResolvedAddress(null);
    }
  }, [showMapModal]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAddresses();
      console.log('Address API response:', response.data);
      if (response.status === 200) {
        // Check different possible response structures
        const addressList = 
          response.data?.address?.[0]?.addresses || 
          response.data?.addresses || 
          response.data?.data?.addresses || 
          [];
        setAddresses(addressList);
        console.log('Addresses fetched:', addressList.length);
      }
    } catch (error: any) {
      console.log('Error fetching addresses:', error);
      // Don't show error if no addresses found
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = async (address: any) => {
    try {
      showLoader();
      // Set this address as default or use it for location
      // If backend has an endpoint to set default address, use it
      if (address._id) {
        try {
          await ApiService.setDefaultAddress(address._id);
        } catch (e) {
          console.log('Could not set default address:', e);
        }
      }

      // Update user location based on address
      // You might need to extract lat/long from address or use city/pincode
      const lat = address.lat || '28.6139'; // Default to Delhi NCR
      const long = address.long || '77.2090';

      const response = await ApiService.sendCurrentLoc(lat, long);
      hideLoader();

      if (response.status === 200) {
        await LocalStorage.save('@user', JSON.stringify(response.data.user || "Data"));
        setUserData(response.data.user || "Data");
        await LocalStorage.save('@login', true);
        setIsLoggedIn(true);

        Toast.show({
          type: 'success',
          text1: 'Address selected successfully!',
        });

        navigation.getParent()?.navigate('HomeStackNavigator');
      } else {
        hideLoader();
        Toast.show({
          type: 'error',
          text1: response.data?.message || 'Failed to select address',
        });
      }
    } catch (error: any) {
      hideLoader();
      console.log('Error selecting address:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to select address',
      });
    }
  };

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

  const fetchCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const location = await getLocation();
      setCurrentLocation(location);
      try {
        const geo = await reverseGeocode(location.latitude, location.longitude);
        setResolvedAddress(geo);
        console.log('Geocoded address:', geo);
      } catch (geoErr) {
        console.log('Reverse geocoding failed:', geoErr);
      }
      console.log('Current location fetched:', location);
    } catch (error: any) {
      console.log('Error fetching location:', error);
      Toast.show({
        type: 'error',
        text1: error.message || 'Could not get current location',
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const saveAddressFromCoords = async (lat: number, long: number) => {
    try {
      const geo = await reverseGeocode(lat, long);
      setResolvedAddress(geo);

      // Require at least city and pincode before attempting to save
      if (!geo.city || !geo.pincode) {
        console.log('Geocoded address missing city/pincode, skipping save');
        return;
      }

      const payload = {
        addressType: 'home',
        floor: 'Ground',
        houseNoOrFlatNo: geo.houseNumber || 'Near current location',
        landmark: geo.landmark || geo.formattedAddress || 'Current location',
        pincode: geo.pincode,
        city: geo.city,
        lat: lat.toString(),
        long: long.toString(),
      };

      const res = await ApiService.addAddress(payload);
      const newId =
        res?.data?._id ||
        res?.data?.address?._id ||
        res?.data?.data?._id;

      if (newId) {
        try {
          await ApiService.setDefaultAddress(newId);
        } catch (e) {
          console.log('setDefaultAddress failed, continuing:', e);
        }
        await LocalStorage.save('@selectedAddressId', newId);
      }
      fetchAddresses();

      Toast.show({
        type: 'success',
        text1: 'Current location saved in addresses',
      });
    } catch (error) {
      console.log('Error saving geocoded address:', error);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      let permissionStatus;
      if (Platform.OS === 'ios') {
        permissionStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else {
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

      if (permissionStatus === RESULTS.GRANTED) {
        // Show full screen map first, location will be fetched in useEffect
        setShowMapModal(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Location permission denied',
          text2: 'You can allow it from settings',
        });
      }
    } catch (error) {
      console.log('Error requesting location:', error);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
      });
    }
  };

  const handleMapConfirm = async () => {
    if (!currentLocation) {
      Toast.show({
        type: 'error',
        text1: 'Please wait for location to load',
      });
      return;
    }

    try {
      showLoader();

      const lat = currentLocation.latitude.toString();
      const long = currentLocation.longitude.toString();

      const response = await ApiService.sendCurrentLoc(lat, long);
        
      if (response.status === 200) {
        await saveAddressFromCoords(currentLocation.latitude, currentLocation.longitude);
        hideLoader();
        await LocalStorage.save('@user', JSON.stringify(response.data.user || "Data"));
        setUserData(response.data.user || "Data");
        await LocalStorage.save('@login', true);
        setIsLoggedIn(true);

        Toast.show({
          type: 'success',
          text1: 'Location updated successfully!',
        });

        setShowMapModal(false);
        navigation.getParent()?.navigate('HomeStackNavigator');
      } else {
        hideLoader();
        Toast.show({
          type: 'error',
          text1: response.data?.message || 'Failed to update location',
        });
      }
    } catch (error: any) {
      hideLoader();
      console.log('Error confirming location:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update location',
      });
    }
  };

  const renderAddressItem = ({ item }: { item: any }) => {
    const addressText = `${item.houseNoOrFlatNo || ''} ${item.floor || ''}, ${item.landmark || ''}, ${item.city || ''} - ${item.pincode || ''}`.trim();
    
    return (
      <Pressable
        style={[
          styles.addressItemContainer,
          {
            borderColor: Colors.PRIMARY[100],
            borderWidth: 0.5,
            marginTop: 10,
          },
        ]}
        onPress={() => handleSelectAddress(item)}
      >
        <View style={styles.iconView}>
          <Icon
            family={'Entypo'}
            name={'location-pin'}
            size={24}
            color={Colors.PRIMARY[100]}
          />
        </View>
        <View style={styles.addressTextContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextView style={styles.txtLocation}>
              {item.landmark || item.city || 'Address'}
            </TextView>
            {item.addressType && (
              <View style={styles.addressTypeBadge}>
                <TextView style={styles.addressTypeText}>
                  {item.addressType.charAt(0).toUpperCase() + item.addressType.slice(1)}
                </TextView>
              </View>
            )}
          </View>
          <TextView style={styles.addressFullText} numberOfLines={2}>
            {addressText}
          </TextView>
        </View>
        <Icon
          family={'Entypo'}
          name={'chevron-right'}
          size={24}
          color={Colors.PRIMARY[100]}
        />
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View>
          <Header />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <InputText
              value={searchQuery}
              //@ts-ignore
              inputStyle={[styles.inputView]}
              inputContainer={[styles.inputContainer]}
              showIcon={true}
              iconFamily={'EvilIcons'}
              icon="search"
              placeHolderTextStyle={Colors.PRIMARY[100]}
              placeholder="Search Your Location"
              onChangeText={(value: string) => {
                setSearchQuery(value);
              }}
            />
          </View>

          <Pressable
            style={[
              styles.inputContainer,
              { borderColor: Colors.PRIMARY[100], borderWidth: 0.5 },
            ]}
            onPress={handleUseCurrentLocation}
          >
            <View style={styles.iconView}>
              <Icon
                family={'MaterialIcons'}
                name={'gps-fixed'}
                size={30}
                color={Colors.PRIMARY[100]}
              />
            </View>
            <TextView style={styles.txtLocation}>
              Use My Current Location
            </TextView>
          </Pressable>

          {addresses.length > 0 && (
            <View style={styles.addressesSection}>
              <TextView style={styles.sectionTitle}>Saved Addresses</TextView>
              {addresses.map((item, index) => (
                <View key={item._id || index.toString()}>
                  {renderAddressItem({ item })}
                </View>
              ))}
            </View>
          )}
          
          <Pressable
            style={[
              styles.inputContainer,
              {
                borderColor: Colors.PRIMARY[100],
                borderWidth: 0.5,
                marginTop: 5,
              },
            ]}
            onPress={() => navigation.navigate('AddAddress')}
          >
            <View style={styles.iconView}>
              <Icon
                family={'Entypo'}
                name={'plus'}
                size={30}
                color={Colors.PRIMARY[100]}
              />
            </View>
            <TextView style={styles.txtLocation}>Add New Address</TextView>
          </Pressable>
        </ScrollView>

        {/* Full Screen Map for Current Location */}
        {showMapModal && (
          <View style={styles.fullScreenMapContainer}>
            <SafeAreaView style={styles.fullScreenMapSafeArea}>
              <View style={styles.mapHeader}>
                <TextView style={styles.mapTitle}>
                  {currentLocation ? 'Your Location' : 'Delhi NCR'}
                </TextView>
                <TouchableOpacity onPress={() => setShowMapModal(false)}>
                  <Icon
                    family={'Entypo'}
                    name={'cross'}
                    size={28}
                    color={Colors.PRIMARY[100]}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.mapViewContainer}>
                {locationLoading ? (
                  <View style={styles.mapLoadingContainer}>
                    <TextView style={styles.loadingText}>Fetching your location...</TextView>
                  </View>
                ) : currentLocation ? (
                  <WebView
                    source={{
                      html: `
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                            <style>
                              body { margin: 0; padding: 0; }
                              #map { width: 100%; height: 100%; }
                            </style>
                          </head>
                          <body>
                            <div id="map"></div>
                            <script>
                              var map = L.map('map').setView([${currentLocation.latitude}, ${currentLocation.longitude}], 15);
                              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                attribution: '© OpenStreetMap contributors',
                                maxZoom: 19
                              }).addTo(map);
                              var marker = L.marker([${currentLocation.latitude}, ${currentLocation.longitude}]).addTo(map);
                              marker.bindPopup('Your Location').openPopup();
                            </script>
                          </body>
                        </html>
                      `,
                    }}
                    style={styles.mapWebView}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                  />
                ) : (
                  <Image
                    source={Images.img_map}
                    style={styles.mapImage}
                    resizeMode="cover"
                  />
                )}
              </View>
              {resolvedAddress?.formattedAddress ? (
                <TextView
                  style={{
                    textAlign: 'center',
                    color: Colors.PRIMARY[100],
                    marginTop: 10,
                    paddingHorizontal: 16,
                  }}
                  numberOfLines={2}
                >
                  {resolvedAddress.formattedAddress}
                </TextView>
              ) : null}
              <View style={styles.mapButtonContainer}>
                <LinearButton
                  title="Confirm Location"
                  onPress={handleMapConfirm}
                  style={styles.confirmButton}
                  titleStyle={{ color: Colors.PRIMARY[300] }}
                />
              </View>
            </SafeAreaView>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SearchLocation;
