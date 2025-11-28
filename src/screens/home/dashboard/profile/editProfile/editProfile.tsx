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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import styles from './editProfile.styles';
import { HomeStackProps } from '../../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';
import {
  Colors,
  Fonts,
  Icon,
  Images,
  Typography,
} from '../../../../../constant';
import {
  BorderButton,
  Header,
  LinearButton,
  TextView,
} from '../../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import InputText from '../../../../../components/InputText/TextInput';

type ReferEarnScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'EditProfile'
>;

const EditProfile: FC = () => {
  const navigation = useNavigation<ReferEarnScreenNavigationType>();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View>
              <Header />
            </View>

            <View>
              <LinearGradient
                colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
                style={styles.cardView}
                start={{ x: 0.5, y: 0.2 }}
                end={{ x: 0.5, y: 1 }}
              >
                <View style={styles.profileView}>
                  <TextView style={styles.txtEditProfile}>
                    Edit Profile
                  </TextView>
                </View>
              </LinearGradient>
            </View>

            <View>
              <InputText
                value={''}
                //@ts-ignore
                inputStyle={[styles.inputView]}
                inputContainer={[styles.inputContainer]}
                placeHolderTextStyle={Colors.PRIMARY[400]}
                placeholder="Name"
                onChangeText={(value: string) => {
                  console.log('TEst', value);
                }}
              />
              <InputText
                value={''}
                //@ts-ignore
                inputStyle={[styles.inputView]}
                inputContainer={[styles.inputContainer]}
                placeHolderTextStyle={Colors.PRIMARY[400]}
                placeholder="Mobile Number"
                onChangeText={(value: string) => {
                  console.log('TEst', value);
                }}
              />
              <InputText
                value={''}
                //@ts-ignore
                inputStyle={[styles.inputView]}
                inputContainer={[styles.inputContainer]}
                placeHolderTextStyle={Colors.PRIMARY[400]}
                placeholder="Email address"
                onChangeText={(value: string) => {
                  console.log('TEst', value);
                }}
              />
            </View>
          </ScrollView>
          <View style={styles.buttonView}>
            <LinearButton
              title="Submit"
              //@ts-ignore
              titleStyle={[styles.buttonTitle, { color: Colors.PRIMARY[300] }]}
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default EditProfile;
