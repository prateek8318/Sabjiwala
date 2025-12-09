// AddAddress.tsx - FINAL VERSION (Postman ke exact fields ke hisab se)

import React, { FC, useState, useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Keyboard,
} from 'react-native';
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

  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');
  const [floor, setFloor] = useState('');
  const [houseNoOrFlatNo, setHouseNoOrFlatNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverNo, setReceiverNo] = useState('');
  const [loading, setLoading] = useState(false);

  const editingAddress = route?.params?.address;
  const isEdit = !!editingAddress;

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

  const saveAddress = async () => {
    // Required validation
    if (!floor.trim()) return Alert.alert('Required', 'Floor is required');
    if (!houseNoOrFlatNo.trim()) return Alert.alert('Required', 'Flat/House No is required');
    if (!landmark.trim()) return Alert.alert('Required', 'Landmark is required');
    if (!pincode.trim()) return Alert.alert('Required', 'Pincode is required');
    if (!city.trim()) return Alert.alert('Required', 'City is required');

    const payload = {
      addressType: addressType,           // "home", "work", "other"
      floor: floor.trim(),
      houseNoOrFlatNo: houseNoOrFlatNo.trim(),
      landmark: landmark.trim(),
      pincode: pincode.trim(),
      city: city.trim(),
      receiverName: receiverName.trim() || undefined,
      receiverNo: receiverNo.trim() || undefined,
    };

    console.log('Sending to backend →', payload);

    try {
      setLoading(true);
      if (isEdit && editingAddress?._id) {
        await ApiService.updateAddress(editingAddress._id, payload);
        Alert.alert('Success', 'Address updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const res = await ApiService.addAddress(payload);
        console.log('Address saved successfully!', res.data);

        Alert.alert('Success', 'Address added successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Mark user as logged in so root navigator switches to Home stack
              LocalStorage.save('@login', true);
              setIsLoggedIn(true);

              // If this screen sits inside the Home stack (after login),
              // try to go to bottom tabs; otherwise rely on auth state switch.
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
            },
          },
        ]);
      }
    } catch (error: any) {
      const msg = 
        error?.response?.data?.message || 
        error?.response?.data?.error || 
        'Failed to save address';
      Alert.alert('Error', msg);
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
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Header title={isEdit ? "Edit Address" : "Add New Address"} onBack={() => navigation.goBack()} />

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
                        backgroundColor: selected ? Colors.PRIMARY[50] : 'transparent',
                      },
                    ]}
                  >
                    <TextView style={{ 
                      color: selected ? Colors.PRIMARY[100] : '#666',
                      fontWeight: selected ? '600' : '400'
                    }}>
                      {label}
                    </TextView>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ marginTop: 24, gap: 16 }}>
              <InputText
                placeholder="Floor *"
                value={floor}
                onChangeText={setFloor}
                inputStyle={styles.inputView}
                inputContainer={styles.inputContainer}
              />

              <InputText
                placeholder="Flat / House No *"
                value={houseNoOrFlatNo}
                onChangeText={setHouseNoOrFlatNo}
                inputStyle={styles.inputView}
                inputContainer={styles.inputContainer}
              />

              <InputText
                placeholder="Landmark *"
                value={landmark}
                onChangeText={setLandmark}
                inputStyle={styles.inputView}
                inputContainer={styles.inputContainer}
              />

              <InputText
                placeholder="Pincode *"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="number-pad"
                maxLength={6}
                inputStyle={styles.inputView}
                inputContainer={styles.inputContainer}
              />

              <InputText
                placeholder="City *"
                value={city}
                onChangeText={setCity}
                inputStyle={styles.inputView}
                inputContainer={styles.inputContainer}
              />

              <InputText
                placeholder="Receiver Name (Optional)"
                value={receiverName}
                onChangeText={setReceiverName}
                inputStyle={styles.inputView}
                inputContainer={styles.inputContainer}
              />

              <InputText
                placeholder="Receiver Phone (Optional)"
                value={receiverNo}
                onChangeText={setReceiverNo}
                keyboardType="phone-pad"
                inputStyle={styles.inputView}
                inputContainer={styles.inputContainer}
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