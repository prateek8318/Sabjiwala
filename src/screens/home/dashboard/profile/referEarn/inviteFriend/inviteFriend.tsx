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
import styles from './inviteFriend.styles';
import { HomeStackProps } from '../../../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../../constant/dimentions';
import {
  Colors,
  Fonts,
  Icon,
  Images,
  Typography,
} from '../../../../../../constant';
import {
  BorderButton,
  Header,
  LinearButton,
  TextView,
} from '../../../../../../components';

type InviteFriendScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'InviteFriend'
>;

const InviteFriend: FC = () => {
  const navigation = useNavigation<InviteFriendScreenNavigationType>();

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

        <View style={styles.viewContainer}>
          <TextView style={styles.txtInvite}>Invite Your Friends</TextView>
          <View style={styles.inviteView}>
            <TextView style={styles.inviteCode}>XYZ562639</TextView>
          </View>
          <View style={styles.actionButtonView}>
            <LinearButton
              title="Whatsapp"
              //@ts-ignore
              titleStyle={[styles.buttonTitle, { color: Colors.PRIMARY[300] }]}
              style={styles.btnView}
            />
            <LinearButton
              title="Others"
              //@ts-ignore
              titleStyle={[styles.buttonTitle, { color: Colors.PRIMARY[300] }]}
              style={styles.btnView}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InviteFriend;
