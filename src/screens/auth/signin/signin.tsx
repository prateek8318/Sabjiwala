import React, { FC, useContext, useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
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
import { useFormik } from 'formik';
import { UserData, UserDataContext } from '../../../context/userDataContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../../constant/dimentions';
import { Colors, Fonts, Typography } from '../../../constant';
import InputText from '../../../components/InputText/TextInput';
import ApiService from '../../../service/apiService';
import Toast from 'react-native-toast-message';


type SigninScreenNavigationType = NativeStackNavigationProp<
  AuthStackProps,
  'Signin'
>;


const Signin: FC = () => {
  const navigation = useNavigation<SigninScreenNavigationType>();
//   const [number, setNumber] = useState("8979720606");
  const [number, setNumber] = useState("");

  const attemptSignIn = () => {
    if (!number) {
      Toast.show({
        type: "error",
        text1: "Please enter mobile number",
      });
      return;
    }
    if (number.length !== 10) {
      Toast.show({
        type: "error",
        text1: "Please enter valid mobile number",
      });
      return;
    }

    signIn();
  };

const signIn = async () => {
  try {
    const response = await ApiService.sendOtp(number);
       console.log(number);

    // 200 + API says status === true → go to VerifyOTP
    if (response.status === 200 && response.data?.success === true) {
      navigation.navigate('VerifyOTP', { number });
    } else {
      Toast.show({
        type: 'error',
        text1: response.data?.message || 'Failed to send OTP',
      });
    }
  } catch (error: any) {
      console.log(error);
    const msg = error.response?.data?.message || 'Network error. Try again.';
    Toast.show({ type: 'error', text1: msg });
  }
};
//   const signIn = async () => {
//     try {
//       navigation.navigate("VerifyOTP", { number: number });
//     } catch (error) {
//       Toast.show({
//         type: "error",
//         text1: "Something went wrong! Please try again.",
//       });
//     }
//   };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.txtLoginView}>
          <Text style={styles.txtLogin}>Login</Text>
        </View>
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
            <TextView style={styles.txtWhite}>By continuing, you agree to our <TextView style={styles.txtYellow}>Terms of Use
            </TextView><TextView style={styles.txtWhite}> and </TextView> <TextView style={styles.txtYellow}>Privacy Policy</TextView></TextView>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView >
  );
};

export default Signin;
