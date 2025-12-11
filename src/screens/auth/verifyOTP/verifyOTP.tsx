import React, { FC, useContext, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  Image,
  Platform,
} from "react-native";
import styles from "./verifyOTP.style";
import { Colors } from "../../../constant";
import { Button, OtpInput, TextView } from "../../../components";
import Toast from "react-native-toast-message";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackProps } from "../../../@types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "../../../constant/dimentions";
import ApiService from "../../../service/apiService";
import { LocalStorage } from "../../../helpers/localstorage";
import { storage } from "../../../service/storage";
import { UserData, UserDataContext } from "../../../context/userDataContext";

const VerifyOTP: FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackProps>>();
  const [globalTimer, setGlobalTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [code, setCode] = useState("");
  const route = useRoute<any>();
  const { setUserData, setIsLoggedIn } = useContext<UserData>(UserDataContext);
  const insets = useSafeAreaInsets();

  // NEW: keyboard visibility state
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (globalTimer > 0) {
      timer = setTimeout(() => setGlobalTimer(globalTimer - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => timer && clearTimeout(timer);
  }, [globalTimer]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleResendOTP = () => {
    setGlobalTimer(30);
    setCanResend(false);
    sendOTPAgain();
  };

  const attempVerify = () => {
    if (!code) {
      Toast.show({ type: "error", text1: "Please enter OTP" });
      return;
    }
    verifyOtp(route?.params?.number, code);
  };

  const verifyOtp = async (mobileNo: string, otp: string) => {
    try {
      const res = await ApiService.verifyOtp(mobileNo, otp);
      setCode("");

      if (res.status === 200 && res.data?.status === true) {
        Toast.show({ type: "success", text1: "OTP verified successfully!" });

        const token = res.data.token;
        if (res.data?.user) {
          setUserData(res.data.user);
          setIsLoggedIn(true);

          LocalStorage.setItem("token", token);
          LocalStorage.setItem("userData", JSON.stringify(res.data.user));
        }

        await storage.saveToken(token);
        navigation.navigate("LocationPermission");
      } else {
        Toast.show({ type: "error", text1: res.data?.message || "Invalid OTP" });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Network error. Try again.",
      });
    }
  };

  const sendOTPAgain = async () => {
    try {
      const res = await ApiService.sendOtp(route?.params?.number);
      if (res.status === 200 && res.data?.success === true) {
        Toast.show({ type: "success", text1: "OTP resent successfully!" });
      } else {
        Toast.show({ type: "error", text1: res.data?.message || "Failed to resend OTP" });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Network error. Try again.",
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>

        {/* ---------- RESPONSIVE TOP IMAGES ---------- */}
        <Image
          source={require("../../../assets/images/style.png")}
          style={{
            width: "100%",

            position: "absolute",
            top: 0,
            resizeMode: "stretch",
          }}
        />


        {/* ----------------------------------------------------------- */}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 30 : 0}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ flex: 1, paddingTop: hp(22) }}>
              <View style={styles.verifyOTPView}>
                <Image
                  source={require("../../../assets/images/lemon.png")}
                  style={{
                    position: "absolute",
                    top: hp(-8),
                    left: wp(5),
                    width: wp(18),
                    height: wp(18),
                    resizeMode: "contain",
                  }}
                />

                <Image
                  source={require("../../../assets/images/peas.png")}
                  style={{
                    position: "absolute",
                    top: hp(5),
                    right: wp(5),
                    width: wp(30),
                    height: wp(20),
                    resizeMode: "contain",
                  }}
                />
                <TextView style={styles.titleText}>
                  A 4 Digit OTP has been Sent to +91 {route?.params?.number}
                </TextView>

                <View style={styles.otpView}>
                  <OtpInput
                    numberOfInputs={4}
                    onOTPComplete={(otp: any) => setCode(otp)}
                  />
                </View>
              </View>

              <View style={{ marginTop: hp(0.5) }}>
                {canResend && (
                  <Button
                    title="Resend"
                    style={styles.actionButton}
                    buttonColor={Colors.PRIMARY[300]}
                    titleStyle={styles.actionButtonTitle}
                    onPress={handleResendOTP}
                  />
                )}

                <Button
                  title="Submit"
                  style={[
                    styles.actionButton,
                    { marginTop: canResend ? hp(2) : hp(4) },
                  ]}
                  buttonColor={Colors.PRIMARY[300]}
                  titleStyle={styles.actionButtonTitle}
                  onPress={attempVerify}
                />
              </View>

              {!canResend && (
                <View style={styles.bottomView}>
                  <TextView style={styles.timerText}>
                    Resend OTP in{" "}
                    <TextView style={styles.secText}>{globalTimer}</TextView> sec
                  </TextView>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ---------- RESPONSIVE BOTTOM IMAGES - HIDE WHEN KEYBOARD VISIBLE ---------- */}
        {!isKeyboardVisible && (
          <>
            <Image
              source={require("../../../assets/images/style3.png")}
              style={{
                width: wp(35),
                height: hp(12),
                position: "absolute",
                bottom: 0,
                left: 0,
                resizeMode: "contain",
              }}
            />

            <Image
              source={require("../../../assets/images/beetroot.png")}
              style={{
                position: "absolute",
                bottom: hp(3),
                left: wp(8),
                width: wp(18),
                height: hp(12),
                resizeMode: "contain",
              }}
            />

            <Image
              source={require("../../../assets/images/tomato.png")}
              style={{
                position: "absolute",
                bottom: hp(18),
                right: wp(2),
                width: wp(12),
                height: hp(10),
                resizeMode: "contain",
              }}
            />

            <Image
              source={require("../../../assets/images/style2.png")}
              style={{
                width: wp(35),
                height: hp(12),
                position: "absolute",
                bottom: 0,
                right: 0,
                resizeMode: "contain",
              }}
            />
          </>
        )}
        {/* ----------------------------------------------------------- */}

      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default VerifyOTP;
