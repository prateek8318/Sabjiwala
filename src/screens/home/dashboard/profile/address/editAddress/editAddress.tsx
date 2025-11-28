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
import styles from './editAddress.styles';
import { HomeStackProps } from '../../../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LinearButton, TextView } from '../../../../../../components';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../../constant/dimentions';
import {
  Colors,
  Fonts,
  Icon,
  Images,
  Typography,
} from '../../../../.././../constant';
import LinearGradient from 'react-native-linear-gradient';

type EditAddressScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'EditAddress'
>;

const EditAddress: FC = () => {
  const navigation = useNavigation<EditAddressScreenNavigationType>();

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

        <View style={styles.viewContainer}>
          <View style={styles.imgMapView}>
            <Image source={Images.img_map} style={styles.imgMap} />
          </View>

          <View
            style={[
              styles.inputContainer,
              { borderColor: Colors.PRIMARY[100], borderWidth: 0.5 },
            ]}
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
          </View>

          <View>
            <TextView style={styles.txtOrderInfo}>
              Your order will be delivering to
            </TextView>
          </View>

          <View style={styles.lineDivider} />

          <View style={styles.addressView}>
            <Icon
              name="location-pin"
              family="Entypo"
              color={Colors.ERROR[300]}
              size={22}
            />
            <View>
              <View style={{ flexDirection: 'row' }}>
                <TextView style={styles.txtAddress}>B Block Rd</TextView>
                <View style={styles.addressType}>
                  <TextView style={styles.addressTypeTxt}>Office</TextView>
                </View>
              </View>
              <View>
                <TextView style={styles.txtFullAddress}>
                  B Block Rd, B Block, Sector 63, Noida, Uttar Pradesh 201301,
                  India
                </TextView>
              </View>
            </View>
          </View>

          <View style={styles.lineDivider} />
        </View>

        <View></View>
      </ScrollView>
      <View style={styles.actionButtonView}>
        <LinearButton
          title="Update the pin & Proceed"
          showIcon={true}
          icon="chevron-right"
          iconFamily={'Entypo'}
          //@ts-ignore
          titleStyle={[styles.buttonTitle, { color: Colors.PRIMARY[300] }]}
          style={styles.btnView}
        />
      </View>
    </SafeAreaView>
  );
};

export default EditAddress;
