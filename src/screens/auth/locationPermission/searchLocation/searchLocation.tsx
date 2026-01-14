import React, { FC, useContext, useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

// Keep address text concise for list display
const formatAddressText = (address: any) => {
  const sanitize = (value: any) =>
    typeof value === 'string'
      ? value.replace(/\s+/g, ' ').replace(/,+/g, ',').trim()
      : value;

  const parts = [
    sanitize(address.houseNoOrFlatNo),
    sanitize(address.floor),
    sanitize(address.landmark),
    sanitize(address.city),
    sanitize(address.pincode),
  ].filter(Boolean);

  const condensed = parts
    .join(', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s+/g, ', ')
    .replace(/,{2,}/g, ',')
    .trim();

  if (condensed.length > 60) {
    return `${condensed.slice(0, 57)}...`;
  }

  return condensed;
};

const SearchLocation: FC = () => {
  const navigation = useNavigation<SearchLocationScreenNavigationType>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<GeocodedAddress | null>(null);
  const [mapError, setMapError] = useState(false);
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
    } finally {
      setLoading(false);
    }
  };

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=AIzaSyAVnkWhVaQ3Sj4XjlNi65oCMiBoh0BzuFA&components=country:in`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        setSearchResults(data.predictions);
      }
    } catch (err) {
      console.log('Search error:', err);
    }
  };

  const handleSelectSearchResult = async (item: any) => {
    try {
      showLoader();
      const detailsRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=AIzaSyAVnkWhVaQ3Sj4XjlNi65oCMiBoh0BzuFA&fields=geometry,formatted_address,address_components`
      );
      const details = await detailsRes.json();
      if (details.status === 'OK') {
        const loc = details.result.geometry.location;
        const addr = details.result.formatted_address;
        const components = details.result.address_components;
        
        let city = '', pincode = '';
        components.forEach((c: any) => {
          if (c.types.includes('locality')) city = c.long_name;
          if (c.types.includes('postal_code')) pincode = c.long_name;
        });

        hideLoader();
        setSearchQuery('');
        setSearchResults([]);

        navigation.navigate('AddAddress', {
          prefillAddress: {
            pincode: pincode || '',
            city: city || '',
            landmark: addr || '',
            floor: 'Ground',
            houseNoOrFlatNo: '',
            lat: loc.lat,
            long: loc.lng,
          },
        });
      }
    } catch (err) {
      hideLoader();
      Toast.show({ type: 'error', text1: 'Failed to get location details' });
    }
  };

  const handleSelectAddress = async (address: any) => {
    try {
      showLoader();
      if (address._id) {
        try {
          await ApiService.setDefaultAddress(address._id);
        } catch (e) {
          console.log('Could not set default address:', e);
        }
      }

      const lat = address.lat || '28.6139';
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

  const generateMapHTML = () => {
    const lat = currentLocation?.latitude ?? 28.6139;
    const lon = currentLocation?.longitude ?? 77.2090;
    const zoomLevel = currentLocation ? 15 : 11;
    const cityName = resolvedAddress?.city || 'Your Location';
    const addressText = resolvedAddress?.formattedAddress || '';

    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const escapedCity = escapeHtml(cityName);
    const escapedAddress = escapeHtml(addressText);

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
                center: { lat: ${lat}, lng: ${lon} },
                zoom: ${zoomLevel},
                disableDefaultUI: false,
              });

              const marker = new google.maps.Marker({
                position: { lat: ${lat}, lng: ${lon} },
                map: map,
                title: "${escapedCity}",
              });

              const infoWindow = new google.maps.InfoWindow({
                content: "<strong>${escapedCity}</strong><br><small>${escapedAddress}</small>",
              });
              infoWindow.open(map, marker);
            }
          </script>
          <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAVnkWhVaQ3Sj4XjlNi65oCMiBoh0BzuFA&callback=initMap"></script>
        </body>
      </html>
    `;
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

      const geo =
        resolvedAddress ||
        (await reverseGeocode(currentLocation.latitude, currentLocation.longitude));
      setResolvedAddress(geo);

      if (!geo?.city || !geo?.pincode) {
        hideLoader();
        Toast.show({
          type: 'error',
          text1: 'Could not resolve city and pincode from location',
        });
        return;
      }

      try {
        await ApiService.sendCurrentLoc(lat, long);
      } catch (err) {
        console.log('sendCurrentLoc failed, continuing to AddAddress:', err);
      }

      hideLoader();
      setShowMapModal(false);
      (navigation as any).navigate('AddAddress', {
        prefillAddress: {
          pincode: geo.pincode,
          city: geo.city,
          landmark: geo.formattedAddress || geo.landmark || '',
          floor: 'Ground',
          houseNoOrFlatNo: geo.houseNumber || '',
          lat: currentLocation.latitude,
          long: currentLocation.longitude,
        },
      });
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
    const addressText = formatAddressText(item);
    
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
        <View style={{ marginLeft: wp(0) }}>
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
              {item.city || item.landmark || 'Address'}
            </TextView>
            {item.addressType && (
              <View style={styles.addressTypeBadge}>
                <TextView style={styles.addressTypeText}>
                  {item.addressType.charAt(0).toUpperCase() + item.addressType.slice(1)}
                </TextView>
              </View>
            )}
          </View>
          <TextView style={styles.addressFullText} numberOfLines={1}>
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
      <SafeAreaView style={styles.container} edges={['top']}>
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
                searchLocations(value);
              }}
            />

            {searchResults.length > 0 && (
              <View style={styles.searchResultsContainer}>
                {searchResults.map((item) => (
                  <Pressable
                    key={item.place_id}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectSearchResult(item)}
                  >
                    <TextView style={styles.searchResultText}>
                      {item.description}
                    </TextView>
                  </Pressable>
                ))}
              </View>
            )}
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
                  {resolvedAddress?.city || (currentLocation ? 'Your Location' : 'Delhi NCR')}
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
                {mapError ? (
                  <Image
                    source={Images.img_map}
                    style={styles.mapImage}
                    resizeMode="cover"
                  />
                ) : (
                  <WebView
                    originWhitelist={['*']}
                    source={{ html: generateMapHTML() }}
                    style={styles.mapWebView}
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState
                    scalesPageToFit
                    mixedContentMode="always"
                    onError={() => setMapError(true)}
                    onHttpError={() => setMapError(true)}
                  />
                )}
                {locationLoading && (
                  <View style={styles.mapLoadingContainer}>
                    <TextView style={styles.loadingText}>Fetching your location...</TextView>
                  </View>
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