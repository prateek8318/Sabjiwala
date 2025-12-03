import React, { FC, useContext, useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  Image,
} from 'react-native';
import styles from './signin.styles';
import { AuthStackProps } from '../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  CommonLoader,
  CommonAlertModal,
  TextView,
  Button,
} from '../../../components';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../../constant/dimentions';
import { Colors } from '../../../constant';
import InputText from '../../../components/InputText/TextInput';
import ApiService from '../../../service/apiService';
import Toast from 'react-native-toast-message';

type SigninScreenNavigationType = NativeStackNavigationProp<
  AuthStackProps,
  'Signin'
>;

const Signin: FC = () => {
  const navigation = useNavigation<SigninScreenNavigationType>();
  const [number, setNumber] = useState("");

  const attemptSignIn = () => {
    if (!number) {
      Toast.show({ type: "error", text1: "Please enter mobile number" });
      return;
    }
    if (number.length !== 10) {
      Toast.show({ type: "error", text1: "Please enter valid mobile number" });
      return;
    }
    signIn();
  };

  const signIn = async () => {
    try {
      const response = await ApiService.sendOtp(number);

      if (response.status === 200 && response.data?.success === true) {
        navigation.navigate('VerifyOTP', { number });
      } else {
        Toast.show({
          type: 'error',
          text1: response.data?.message || 'Failed to send OTP',
        });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Network error. Try again.';
      Toast.show({ type: 'error', text1: msg });
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* 🔥 Top background image FIXED */}
      <Image
        source={require('../../../assets/images/style.png')}
        style={{
          width: '100%',
          position: 'absolute',
          top: 15,
          resizeMode: 'contain'
        }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50 }}>
        <Image
          source={require('../../../assets/images/lemon.png')}
          style={{
            position: 'absolute',
            top: 90,
            left: 20,
            width: 65,
            height: 65,
            resizeMode: 'contain',
          }}
        />

        <Image
          source={require('../../../assets/images/peas.png')}
          style={{
            position: 'absolute',
            top: 300,
            right: 20,
            width: 130,
            height: 85,
            resizeMode: 'contain',
          }}
        />
      </View>

      <View style={styles.txtLoginView}>
        <Text style={styles.txtLogin}>Login</Text>
      </View>

      {/* ✅ KeyboardAvoidingView ONLY for input section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: "center" }}
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <InputText
            value={number}
            //@ts-ignore
            inputStyle={[styles.inputView]}
            keyboardType="number-pad"
            maxLength={10}
            placeHolderTextStyle={Colors.FLOATINGINPUT[100]}
            placeholder="Mobile Number"
            onChangeText={(value: string) => {
              const filteredValue = value.replace(/[^0-9]/g, "");
              setNumber(filteredValue);
            }}
          />

          <View>
            <Button
              title={"Get OTP"}
              style={styles.actionButton}
              buttonColor={Colors.PRIMARY[300]}
              titleStyle={styles.actionButtonTitle}
              onPress={() => attemptSignIn()}
            />
          </View>

          <View style={styles.txtView}>
            <TextView style={styles.txtWhite}>
              By continuing, you agree to our <TextView style={styles.txtYellow}>Terms of Use</TextView>
              <TextView style={styles.txtWhite}> and </TextView>
              <TextView style={styles.txtYellow}>Privacy Policy</TextView>
            </TextView>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 🔥 Bottom images stay FIXED now */}
      <Image
        source={require('../../../assets/images/style3.png')}
        style={{
          width: 140,
          height: 90,
          position: 'absolute',
          bottom: 0,
          left: 0,
          resizeMode: 'contain'
        }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 40 }}>
        <Image
          source={require('../../../assets/images/beetroot.png')}
          style={{
            position: 'absolute',
            bottom: 25,
            left: 30,
            width: 74,
            height: 90,
          }}
        />

        <Image
          source={require('../../../assets/images/tomato.png')}
          style={{
            position: 'absolute',
            bottom: 150,
            right: 0,
            width: 45,
            height: 75,
          }}
        />
      </View>

      <Image
        source={require('../../../assets/images/style2.png')}
        style={{
          width: 140,
          height: 80,
          position: 'absolute',
          bottom: 0,
          right: 0,
          resizeMode: 'contain'
        }}
      />

    </SafeAreaView>
  );
};

export default Signin;
