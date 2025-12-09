import React, { FC, useEffect, useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  Text,
} from 'react-native';
import styles from './address.styles';
import { HomeStackProps } from '../../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LinearButton, TextView } from '../../../../../components';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';
import { Colors, Fonts, Images, Typography } from '../../../../../constant';
import LinearGradient from 'react-native-linear-gradient';
import ApiService from '../../../../../service/apiService';

type AddressScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'Address'
>;

const Address: FC = () => {
  const navigation = useNavigation<AddressScreenNavigationType>();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const formatAddress = (addr: any) => {
    if (!addr) return '';
    const parts: string[] = [];
    if (addr.houseNoOrFlatNo) parts.push(addr.houseNoOrFlatNo);
    if (addr.floor) parts.push(`Floor ${addr.floor}`);
    if (addr.landmark) parts.push(addr.landmark);
    if (addr.city) parts.push(addr.city);
    if (addr.pincode) parts.push(addr.pincode);
    return parts.filter(Boolean).join(', ');
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getAddresses();
      const list = res?.data?.address?.[0]?.addresses || [];
      setAddresses(list);
    } catch (err) {
      console.log('Address list fetch error:', err);
      Alert.alert('Error', 'Unable to load addresses right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.deleteAddress(id);
            fetchAddresses();
          } catch (err) {
            console.log('Delete address error:', err);
            Alert.alert('Error', 'Failed to delete address.');
          }
        },
      },
    ]);
  };

  const renderAddress = (item: any) => {
    return (
      <View style={styles.itemAddressView}>
        <View style={{ flex: 1 }}>
          <View style={styles.itemAddressType}>
            <TextView style={styles.itemAddressTypeTxt}>
              {item.item.addressType || 'Home'}
            </TextView>
          </View>
          <TextView style={styles.itemAddressTxt}>
            {formatAddress(item.item)}
          </TextView>
        </View>
  
        <View style={styles.actionsContainer}>
          <Pressable onPress={() => handleDelete(item.item._id)}>
            <Image source={Images.ic_delete} style={styles.imgDelete} />
          </Pressable>
  
          <Pressable
            onPress={() => navigation.navigate('AddAddress', { address: item.item })}
            style={styles.btnEdit}
          >
            <TextView style={styles.txtEdit}>Edit</TextView>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Header title="Address" />
        </View>

        <View style={{ padding: hp(2) }}>
          <TextView style={styles.txtSavedAddress}>Your Saved Address</TextView>

          <View>
            {loading ? (
              <Text style={{ color: '#000', marginTop: 10 }}>Loading addresses...</Text>
            ) : (
              <FlatList
                data={addresses}
                renderItem={renderAddress}
                ListEmptyComponent={
                  <Text style={{ color: '#666', marginTop: 10 }}>
                    No address saved yet
                  </Text>
                }
              />
            )}
          </View>

          <LinearButton
            title="Add Address"
            onPress={() => navigation.navigate('AddAddress')}
            style={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Address;