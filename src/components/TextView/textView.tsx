import React from "react";
import { StyleSheet, Text } from "react-native";
import { FC } from "react";
import { TextStyle } from "react-native";
import { StyleProp } from "react-native";
import { Typography } from "../../constant";
interface TextProps {
  style?: StyleProp<TextStyle>,
  children?: React.ReactNode | any,
  onPress?: () => void,
  numberOfLines?: number
}

const TextView: FC<TextProps> = ({
  style,
  children,
  onPress,
  numberOfLines,
}) => {

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[Typography.BodyRegular12, style]}
      allowFontScaling={false}
      onPress={onPress}
    >
      {children}
    </Text>
  );
};


export default TextView;
