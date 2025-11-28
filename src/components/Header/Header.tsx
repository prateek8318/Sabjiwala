import React, { FC } from 'react';
import {
  TextInput,
  View,
  ReturnKeyTypeOptions,
  KeyboardTypeOptions,
  TextStyle,
  Image,
  Pressable,
  Text,
} from 'react-native';
import { FormikErrors, FormikTouched } from 'formik';
import TextView from '../TextView/textView';
import styles from './styles';
import { heightPercentageToDP as hp } from '../../constant/dimentions';
import { Images } from '../../constant';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  isBack?: boolean;
  title?: string;
  rightIcon?: boolean;
  rightIconName?: any;
  rightIconPress?: any;
}

const Header: FC<HeaderProps> = ({
  isBack,
  title,
  rightIcon,
  rightIconName,
  rightIconPress,
}) => {
  const navigate = useNavigation();

  return (
    <View style={styles.headerContainer}>
      {!isBack ? (
        <Pressable onPress={() => navigate.goBack()}>
          <Image source={Images.ic_back} style={styles.imgBack} />
        </Pressable>
      ) : (
        <View>
          <Image style={styles.imgBack} />
        </View>
      )}

      <Text style={styles.headerTitle}>{title}</Text>
      {rightIcon ? (
        <Pressable onPress={() => rightIconPress() && rightIconPress()}>
          <Image source={rightIconName} style={styles.imgBack} />
        </Pressable>
      ) : (
        <Pressable onPress={() => rightIconPress() && rightIconPress()}>
          <Image style={styles.imgBack} />
        </Pressable>
      )}
    </View>
  );
};

export default Header;
