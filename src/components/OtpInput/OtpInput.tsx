import React, { useState, useRef, useContext } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import styles from "./styles";
import { UserData, UserDataContext } from "../../context/userDataContext";
import { Colors } from "../../constant";

interface CustomOTPInputProps {
  numberOfInputs?: number;
  onOTPComplete?: (otp: string) => void;
  borderColor?: string;
}

const OtpInput: React.FC<CustomOTPInputProps> = ({
  numberOfInputs = 4,
  borderColor,
  onOTPComplete,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(numberOfInputs).fill(""));
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const inputs = useRef<any>([]);

  const handleChangeText = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;

    setOtp(newOtp);

    if (text && index < numberOfInputs - 1) {
      inputs.current[index + 1].focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      onOTPComplete && onOTPComplete(newOtp.join(""));
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedInput(index);
  };

  const handleBlur = () => {
    setFocusedInput(null);
  };

  return (
    <View style={styles.otpContainer}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          value={digit}
          //@ts-ignore
          ref={(ref) => (inputs.current[index] = ref as TextInput)}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          keyboardType="numeric"
          maxLength={1}
          style={[
            styles.otpInput,
            { borderColor: borderColor ? borderColor : "#E0E0E0" },
            focusedInput === index && styles.focusedOtpInput,
          ]}
        />
      ))}
    </View>
  );
};

export default OtpInput;
