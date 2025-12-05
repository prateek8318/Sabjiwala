import React, { FC, useContext, useState } from 'react';
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

type AddressScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'Address'
>;

const address = [
  {
    type: 'Home',
    address: 'H-146, Sector - 63, Noida, 201301',
  },
  {
    type: 'Office',
    address: 'B-90, Gaur City 1, Noida, 201301',
  },
];

const Address: FC = () => {
  const navigation = useNavigation<AddressScreenNavigationType>();

  const renderAddress = (item: any) => {
    return (
      <View style={styles.itemAddressView}>
        <View>
          <View style={styles.itemAddressType}>
            <TextView style={styles.itemAddressTypeTxt}>
              {item.item.type}
            </TextView>
          </View>
          <View>
            <TextView style={styles.itemAddressTxt}>
              {item.item.address}
            </TextView>
          </View>
        </View>
        <View>
          <View>
            <Image source={Images.ic_delete} style={styles.imgDelete} />
          </View>
          <Pressable onPress={() => navigation.navigate('EditAddress')}>
            <LinearGradient
              colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
              style={styles.btnEditView}
              start={{ x: 0.5, y: 0.2 }}
              end={{ x: 0.5, y: 1 }}
            >
              <TextView style={styles.txtEdit}>Edit</TextView>
            </LinearGradient>
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
            <FlatList data={address} renderItem={renderAddress} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Address;