// AddAddress.tsx - FINAL VERSION (Postman ke exact fields ke hisab se)

import React, { FC, useState, useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import styles from './addAddress.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TextView, LinearButton, Header } from '../../../../components';
import { Colors } from '../../../../constant';
import InputText from '../../../../components/InputText/TextInput';
import ApiService from '../../../../service/apiService';
import { LocalStorage } from '../../../../helpers/localstorage';
import { UserData, UserDataContext } from '../../../../context/userDataContext';

const AddAddress: FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setIsLoggedIn } = useContext<UserData>(UserDataContext);

  const placeholderColor = '#000';
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');
  const [floor, setFloor] = useState('');
  const [houseNoOrFlatNo, setHouseNoOrFlatNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverNo, setReceiverNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat?: number; long?: number }>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const editingAddress = route?.params?.address;
  const fromAddressScreen = route?.params?.fromAddressScreen;
  const isEdit = !!editingAddress;
  const sanitizeText = (text: string, limit: number) =>
    text ? text.replace(/\s+/g, ' ').trim().slice(0, limit) : '';

  useEffect(() => {
    if (editingAddress) {
      setAddressType(editingAddress.addressType || 'home');
      setFloor(editingAddress.floor || '');
      setHouseNoOrFlatNo(editingAddress.houseNoOrFlatNo || '');
      setLandmark(editingAddress.landmark || '');
      setPincode(editingAddress.pincode || '');
      setCity(editingAddress.city || '');
      setReceiverName(editingAddress.receiverName || '');
      setReceiverNo(editingAddress.receiverNo || '');
    }
  }, [editingAddress]);

  useEffect(() => {
    const prefill = route?.params?.prefillAddress;
    if (prefill && !editingAddress) {
      if (prefill.addressType) {
        setAddressType(prefill.addressType);
      }
      setFloor(prefill.floor || 'Ground');
      setHouseNoOrFlatNo(sanitizeText(prefill.houseNoOrFlatNo || '', 60));
      setLandmark(sanitizeText(prefill.landmark || '', 80));
      setPincode(prefill.pincode || '');
      setCity(prefill.city || '');
      if (prefill.lat && prefill.long) {
        setCoords({ lat: prefill.lat, long: prefill.long });
      }
    }
  }, [editingAddress, route?.params?.prefillAddress]);

  const showToast = (
    type: 'success' | 'error',
    text1: string,
    text2?: string,
  ) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      topOffset: 50,
      visibilityTime: 2200,
      text1Style: { fontWeight: '700', color: '#000' },
      text2Style: { color: '#000' },
    });
  };

  const validateRequired = () => {
    const validationErrors: Record<string, string> = {};
    if (!floor.trim()) validationErrors.floor = ' ';
    if (!houseNoOrFlatNo.trim())
      validationErrors.houseNoOrFlatNo = ' ';
    if (!landmark.trim()) validationErrors.landmark = ' ';
    if (!pincode.trim()) validationErrors.pincode = ' ';
    else if (!/^\d{6}$/.test(pincode.trim()))
      validationErrors.pincode = 'Pincode must be 6 digits';
    if (!city.trim()) validationErrors.city = ' ';
    if (!receiverName.trim()) validationErrors.receiverName = ' ';
    if (!receiverNo.trim()) validationErrors.receiverNo = ' ';
    else if (receiverNo.trim().length !== 10)
      validationErrors.receiverNo = 'Enter 10 digit mobile';

    const touchedFields = {
      floor: true,
      houseNoOrFlatNo: true,
      landmark: true,
      pincode: true,
      city: true,
      receiverName: true,
      receiverNo: true,
    };

    setTouched((prev) => ({ ...prev, ...touchedFields }));
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      showToast('error', 'Please fix highlighted fields', 'Missing details above');
      return false;
    }
    return true;
  };

  const clearErrorIfValid = (field: string, value: string) => {
    if (value.trim()) {
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const saveAddress = async () => {
    if (!validateRequired()) return;

    const payload = {
      addressType: addressType,           // "home", "work", "other"
      floor: floor.trim(),
      houseNoOrFlatNo: houseNoOrFlatNo.trim(),
      landmark: landmark.trim(),
      pincode: pincode.trim(),
      city: city.trim(),
      receiverName: receiverName.trim() || undefined,
      receiverNo: receiverNo.trim() || undefined,
      ...(coords.lat && coords.long
        ? { lat: coords.lat.toString(), long: coords.long.toString() }
        : {}),
    };

    console.log('Sending to backend →', payload);

    try {
      setLoading(true);
      if (isEdit && editingAddress?._id) {
        await ApiService.updateAddress(editingAddress._id, payload);
        showToast('success', 'Address Updated!', 'Your address has been updated successfully');
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        const res = await ApiService.addAddress(payload);
        console.log('Address saved successfully!', res.data);

        showToast('success', 'Address Saved!', 'Your address has been saved successfully');

        // Mark user as logged in so root navigator switches to Home stack
        LocalStorage.save('@login', true);
        setIsLoggedIn(true);

        // If this screen sits inside the Home stack (after login),
        // try to go to bottom tabs; otherwise rely on auth state switch.
        setTimeout(() => {
          if (fromAddressScreen) {
            navigation.goBack();
            return;
          }

          const parentNav = navigation.getParent?.();
          const routeNames =
            parentNav?.getState?.()?.routeNames ||
            navigation.getState?.()?.routeNames ||
            [];

          if (routeNames.includes('BottomStackNavigator')) {
            navigation.navigate('BottomStackNavigator');
          } else if (routeNames.includes('HomeStackNavigator')) {
            navigation.navigate('HomeStackNavigator');
          }
        }, 1500);
      }
    } catch (error: any) {
      const msg = 
        error?.response?.data?.message || 
        error?.response?.data?.error || 
        'Failed to save address';
      showToast('error', 'Error', msg);
      console.log('API Error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          nestedScrollEnabled
          decelerationRate="fast"
        >
          <Header title={isEdit ? "Edit Address" : "Add New Address"} />

          <View style={styles.addressView}>
            <TextView style={styles.txtAddress}>Save address as</TextView>
            <View style={styles.addressTypeContainer}>
              {['Home', 'Work', 'Other'].map((label, i) => {
                const type = label.toLowerCase() as 'home' | 'work' | 'other';
                const selected = addressType === type;
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => setAddressType(type)}
                    style={[
                      styles.addressTypeButton,
                      {
                        borderColor: selected ? Colors.PRIMARY[100] : '#ddd',
                        backgroundColor: selected ? Colors.PRIMARY[100] : 'transparent',
                      },
                    ]}
                  >
                    <TextView style={{
                      color: selected ? '#FFFFFF' : '#666',
                      fontWeight: selected ? '600' : '400'
                    }}>
                      {label}
                    </TextView>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ marginTop: 2, gap: 8 }}>
              <InputText
                placeholder="Floor *"
                value={floor}
                onFocus={() => setTouched((prev) => ({ ...prev, floor: true }))}
                onChangeText={(txt) => {
                  setFloor(txt);
                  clearErrorIfValid('floor', txt);
                }}
                placeHolderTextStyle={placeholderColor}
                inputStyle={styles.inputView}
                inputContainer={[
                  styles.inputContainer,
                  errors.floor && touched.floor && styles.inputErrorBorder,
                ]}
                maxLength={30}
                error={errors.floor}
                touched={touched.floor}
              />

              <InputText
                placeholder="Flat / House No *"
                value={houseNoOrFlatNo}
                onFocus={() =>
                  setTouched((prev) => ({ ...prev, houseNoOrFlatNo: true }))
                }
                onChangeText={(txt) => {
                  const sanitized = sanitizeText(txt, 60);
                  setHouseNoOrFlatNo(sanitized);
                  clearErrorIfValid('houseNoOrFlatNo', sanitized);
                }}
                placeHolderTextStyle={placeholderColor}
                inputStyle={styles.inputView}
                inputContainer={[
                  styles.inputContainer,
                  errors.houseNoOrFlatNo &&
                    touched.houseNoOrFlatNo &&
                    styles.inputErrorBorder,
                ]}
                maxLength={60}
                error={errors.houseNoOrFlatNo}
                touched={touched.houseNoOrFlatNo}
              />

              <InputText
                placeholder="Landmark *"
                value={landmark}
                onFocus={() =>
                  setTouched((prev) => ({ ...prev, landmark: true }))
                }
                onChangeText={(txt) => {
                  setLandmark(txt.slice(0, 80));
                  clearErrorIfValid('landmark', txt);
                }}
                placeHolderTextStyle={placeholderColor}
                inputStyle={styles.inputView}
                inputContainer={[
                  styles.inputContainer,
                  errors.landmark && touched.landmark && styles.inputErrorBorder,
                ]}
                maxLength={80}
                error={errors.landmark}
                touched={touched.landmark}
              />

              <InputText
                placeholder="Pincode *"
                value={pincode}
                onFocus={() =>
                  setTouched((prev) => ({ ...prev, pincode: true }))
                }
                onChangeText={(txt) => {
              const onlyDigits = txt.replace(/[^0-9]/g, '').slice(0, 6);
              setPincode(onlyDigits);
              clearErrorIfValid('pincode', onlyDigits);
                }}
                keyboardType="number-pad"
                maxLength={6}
                placeHolderTextStyle={placeholderColor}
                inputStyle={styles.inputView}
                inputContainer={[
                  styles.inputContainer,
                  errors.pincode && touched.pincode && styles.inputErrorBorder,
                ]}
                error={errors.pincode}
                touched={touched.pincode}
              />

              <InputText
                placeholder="City *"
                value={city}
                onFocus={() => setTouched((prev) => ({ ...prev, city: true }))}
                onChangeText={(txt) => {
                  setCity(txt);
                  clearErrorIfValid('city', txt);
                }}
                placeHolderTextStyle={placeholderColor}
                inputStyle={styles.inputView}
                inputContainer={[
                  styles.inputContainer,
                  errors.city && touched.city && styles.inputErrorBorder,
                ]}
                error={errors.city}
                touched={touched.city}
              />

              <InputText
                placeholder="Receiver Name*"
                value={receiverName}
                onFocus={() =>
                  setTouched((prev) => ({ ...prev, receiverName: true }))
                }
                onChangeText={(txt) => {
                  setReceiverName(txt);
                  clearErrorIfValid('receiverName', txt);
                }}
                placeHolderTextStyle={placeholderColor}
                inputStyle={styles.inputView}
                inputContainer={[
                  styles.inputContainer,
                  errors.receiverName &&
                    touched.receiverName &&
                    styles.inputErrorBorder,
                ]}
                error={errors.receiverName}
                touched={touched.receiverName}
              />

              <InputText
                placeholder="Receiver Phone*"
                value={receiverNo}
                onFocus={() =>
                  setTouched((prev) => ({ ...prev, receiverNo: true }))
                }
                onChangeText={(txt) => {
                  const digits = txt.replace(/[^0-9]/g, '').slice(0, 10);
                  setReceiverNo(digits);
                  clearErrorIfValid('receiverNo', digits);
                }}
                keyboardType="phone-pad"
                maxLength={10}
                placeHolderTextStyle={placeholderColor}
                inputStyle={styles.inputView}
                inputContainer={[
                  styles.inputContainer,
                  errors.receiverNo &&
                    touched.receiverNo &&
                    styles.inputErrorBorder,
                ]}
                error={errors.receiverNo}
                touched={touched.receiverNo}
              />
            </View>
          </View>

          <View style={styles.buttonView}>
            <LinearButton
              title={loading ? 'Saving...' : 'Save Address'}
              disabled={loading}
              onPress={saveAddress}
              style={{ width: '100%' }}
              titleStyle={{ color: Colors.PRIMARY[300] }}
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default AddAddress;