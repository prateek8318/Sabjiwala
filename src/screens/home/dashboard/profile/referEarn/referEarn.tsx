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
import styles from './referEarn.styles';
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

type ReferEarnScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'ReferEarn'
>;

const ReferEarn: FC = () => {
  const navigation = useNavigation<ReferEarnScreenNavigationType>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Header />
        </View>

        <View style={styles.imageView}>
          <Image source={Images.img_refer} style={styles.imgRefer} />

          <TextView style={styles.txtRefer}>
            Refer Your friend and earn
          </TextView>
          <LinearButton
            title="Invite Friends"
            //@ts-ignore
            titleStyle={[styles.buttonTitle, { color: Colors.PRIMARY[300] }]}
            style={styles.btnRefer}
            onPress={()=>navigation.navigate('InviteFriend')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReferEarn;
