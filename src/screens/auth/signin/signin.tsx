import React, { FC, useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  Image,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './signin.styles';
import { AuthStackProps } from '../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TextView, Button } from '../../../components';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../../constant/dimentions';
import { Colors } from '../../../constant';
import InputText from '../../../components/InputText/TextInput';
import ApiService from '../../../service/apiService';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';

type SigninScreenNavigationType = NativeStackNavigationProp<
  AuthStackProps,
  'Signin'
>;

const Signin: FC = () => {
  const navigation = useNavigation<SigninScreenNavigationType>();
  const [number, setNumber] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const attemptSignIn = () => {
    if (!number) {
      Toast.show({ type: 'error', text1: 'Please enter mobile number' });
      return;
    }
    if (number.length !== 10) {
      Toast.show({ type: 'error', text1: 'Please enter valid mobile number' });
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

  const openTerms = () => {
    navigation.navigate('TermsCondition');
  };

  const openPrivacy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  return (
    <LinearGradient
      colors={['#015304', '#5A875C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1.5, y: 1.5 }}
      style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>

        {/* ⭐ FIXED TOP IMAGES */}
        <Image
          source={require('../../../assets/images/style.png')}
          style={{
            width: '100%',
            height: hp(10),
            position: 'absolute',
            top: 0,
            resizeMode: 'contain',
          }}
        />





        {/* ⭐ WRAP ENTIRE CONTENT SO NO ERRORS */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: wp(5),
              paddingBottom: isKeyboardVisible ? hp(0) : hp(10), // padding to avoid overlap with images
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                maxHeight: hp(40),
                justifyContent: 'center',
              }}
            >
              <View style={styles.txtLoginView}>
                <Image
                  source={require('../../../assets/images/lemon.png')}
                  style={{
                    position: 'absolute',
                    top: hp(-5),
                    left: wp(5),
                    width: wp(18),
                    height: wp(14),
                    resizeMode: 'contain',
                  }}
                />
                <Text style={styles.txtLogin}>Login</Text>
                <Image
                  source={require('../../../assets/images/peas.png')}
                  style={{
                    position: 'absolute',
                    top: hp(11),
                    right: wp(5),
                    width: wp(24),
                    height: wp(18),
                    resizeMode: 'contain',
                  }}
                />
              </View>

              <InputText
                value={number}
                //@ts-ignore
                inputStyle={[styles.inputView]}
                keyboardType="number-pad"
                maxLength={10}
                placeHolderTextStyle={Colors.FLOATINGINPUT[100]}
                placeholder="Mobile Number"
                onChangeText={(value: string) =>
                  setNumber(value.replace(/[^0-9]/g, ''))
                }
              />

              <Button
                title={'Get OTP'}
                style={styles.actionButton}
                buttonColor={Colors.PRIMARY[300]}
                titleStyle={styles.actionButtonTitle}
                onPress={attemptSignIn}
              />

              <View style={styles.txtView}>
                <TextView style={styles.txtWhite}>
                  By continuing, you agree to our{' '}
                  <TextView style={styles.txtYellow} onPress={openTerms}>
                    Terms of Use
                  </TextView>
                  <TextView style={styles.txtWhite}> and </TextView>
                  <TextView style={styles.txtYellow} onPress={openPrivacy}>
                    Privacy Policy
                  </TextView>
                </TextView>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ⭐ FIXED BOTTOM IMAGES - HIDE ON KEYBOARD VISIBLE */}
        {!isKeyboardVisible && (
          <>

            <Image
              source={require('../../../assets/images/beetroot.png')}
              style={{
                position: 'absolute',
                bottom: hp(2),
                left: wp(7),
                width: wp(18),
                height: hp(12),
                resizeMode: 'contain',
              }}
            />
            <Image
              source={require('../../../assets/images/style3.png')}
              style={{
                width: wp(32),
                height: hp(10),
                position: 'absolute',
                bottom: 0,
                left: 0,
                resizeMode: 'contain',
              }}
            />



            <Image
              source={require('../../../assets/images/tomato.png')}
              style={{
                position: 'absolute',
                bottom: hp(17),
                right: 0,
                width: wp(12),
                height: hp(10),
                resizeMode: 'contain',
              }}
            />

            <Image
              source={require('../../../assets/images/style2.png')}
              style={{
                width: wp(32),
                height: hp(10),
                position: 'absolute',
                bottom: 0,
                right: 0,
                resizeMode: 'contain',
              }}
            />
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Signin;
