import React, { FC, useContext, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import styles from "./verifyOTP.style";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackProps } from "../../../@types";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Colors, Images } from "../../../constant";
import { Button, CommonLoader, OtpInput, TextView } from "../../../components";
import Toast from "react-native-toast-message";
import { LocalStorage } from "../../../helpers/localstorage";
import { UserData, UserDataContext } from "../../../context/userDataContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserService } from "../../../service";
import { heightPercentageToDP as hp } from "../../../constant/dimentions";

import ApiService from '../../../service/apiService';
import { storage } from '../../../service/storage';



type VerifyOTPScreenNavigationType = NativeStackNavigationProp<
  AuthStackProps,
  "VerifyOTP"
>;

const VerifyOTP: FC = () => {
  const navigation = useNavigation<VerifyOTPScreenNavigationType>();
  const [globalTimer, setGlobalTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [code, setCode] = useState<any>("");
  const route = useRoute<any>();
  const { userData, setUserData, setIsLoggedIn } =
    useContext<UserData>(UserDataContext);
  const { showLoader, hideLoader } = CommonLoader();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (globalTimer > 0) {
      timer = setTimeout(() => {
        setGlobalTimer(globalTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [globalTimer]);

  const handleResendOTP = () => {
    setGlobalTimer(30);
    setCanResend(false);
    sendOTPAgain();
  };

  const attempVerify = async () => {
    try {
      if (!code) {
        Toast.show({
          type: "error",
          text1: "Please enter OTP",
        });
        return;
      }
      showLoader();
      await verifyOtp(route?.params?.number, code);
    } catch (error) {
      hideLoader();
      console.log("Error in verifying OTP:", error);
      Toast.show({
        type: "error",
        text1: "Something went wrong! Please try again.",
      });
    }
  };

  const verifyOtp = async (mobileNo: string, otp: string) => {
    try {
      const response = await ApiService.verifyOtp(mobileNo, otp); // call your API
      hideLoader();
      setCode("");

      if (response.status === 200 && response.data?.status === true) {
        Toast.show({
          type: "success",
          text1: "OTP verified successfully!",
        });
        const token = response.data.token;

        // Save user data if returned
        if (response.data?.user) {
          setUserData(response.data.user);
          setIsLoggedIn(true);

          LocalStorage.setItem("token", response.data.token);
          LocalStorage.setItem("userData", JSON.stringify(response.data.user));

        }
        await storage.saveToken(token);
        // Navigate to next screen
        navigation.navigate("LocationPermission");
      } else {
        Toast.show({
          type: "error",
          text1: response.data?.message || "Invalid OTP",
        });
      }
    } catch (error: any) {
      hideLoader();
      console.log("Verify OTP API error:", error);
      const msg =
        error.response?.data?.message || "Network error. Please try again.";
      Toast.show({
        type: "error",
        text1: msg,
      });
    }
  };


  //   const attempVerify = async () => {
  //     try {
  //       if (!code) {
  //         Toast.show({
  //           type: "error",
  //           text1: "Please enter otp",
  //         });
  //         return;
  //       }
  //       verifyOtp();
  //     } catch (error) {
  //       console.log("Error in sign in", error);
  //     }
  //   };
  //
  //   const verifyOtp = async () => {
  //     try {
  //       navigation.navigate('LocationPermission')
  //     } catch (error) {
  //       hideLoader();
  //       Toast.show({
  //         type: "error",
  //         text1: "Something went wrong! Please try again.",
  //       });
  //     }
  //   };

  const sendOTPAgain = async () => {
    try {
      showLoader();
      setCode("");
      const number = route?.params?.number;


      if (!number) {
        hideLoader();
        Toast.show({
          type: "error",
          text1: "Phone number not found!",
        });
        return;
      }

      const response = await ApiService.sendOtp(number);// or ApiService.sendOtp(number)
      hideLoader();
      setCode("");
      if (response.status === 200 && response.data?.success === true) {
        Toast.show({
          type: "success",
          text1: "OTP resent successfully!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: response.data?.message || "Failed to resend OTP",
        });
      }
    } catch (error: any) {
      hideLoader();
      console.log("Resend OTP Error:", error);
      const msg =
        error.response?.data?.message || "Network error. Please try again.";
      Toast.show({
        type: "error",
        text1: msg,
      });
    }
  };


  //   const sendOTPAgain = async () => {
  //     try {
  //       Alert.alert("Send OTP Again")
  //     } catch (error) {
  //       hideLoader();
  //       Toast.show({
  //         type: "error",
  //         text1: "Something went wrong! Please try again.",
  //       });
  //     }
  //   };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
          keyboardVerticalOffset={insets.top}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >

            <View style={{ flex: 1 }}>
              <View style={styles.verifyOTPView}>
                <View style={styles.containerView}>
                  <TextView style={styles.titleText}>
                    A 4 Digit OTP has Sent to your Number
                    +91 {route?.params?.number}
                  </TextView>
                </View>
                <View style={styles.otpView}>
                  <OtpInput
                    numberOfInputs={4}
                    onOTPComplete={(otp: any) => setCode(otp)}
                  />
                </View>
              </View>
              <View>
                {canResend && (
                  <View>
                    <Button
                      title={"Resend"}
                      //@ts-ignore
                      style={[styles.actionButton, { marginTop: hp(5) }]}
                      buttonColor={Colors.PRIMARY[300]}
                      titleStyle={styles.actionButtonTitle}
                      onPress={() => handleResendOTP()}
                    />
                  </View>
                )}
                <View>
                  <Button
                    title={"Submit"}
                    //@ts-ignore
                    style={[styles.actionButton, { marginTop: canResend ? hp(4) : hp(8) }]}
                    buttonColor={Colors.PRIMARY[300]}
                    titleStyle={styles.actionButtonTitle}
                    onPress={() => attempVerify()}
                  />
                </View>

              </View>
              {!canResend && (
                <View style={styles.bottomView}>
                  <TextView style={styles.timerText}>
                    Resend OTP in{" "}
                    <TextView style={styles.secText}>
                      {globalTimer}
                    </TextView>{" "}
                    sec
                  </TextView>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default VerifyOTP;
