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
import styles from './aboutUs.styles';
import { HomeStackProps } from '../../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, TextView } from '../../../../../components';

type AboutUsScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'AboutUs'
>;

const AboutUs: FC = () => {
  const navigation = useNavigation<AboutUsScreenNavigationType>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Header title="About Us" />
        </View>

        <View>
          <TextView style={styles.txtContent}>
            Korem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
            vulputate libero et velit interdum, ac aliquet odio mattis. sit
            amet, consectetur adipiscing elit. Nunc vulputate libero et velit
            interdum
          </TextView>
          <TextView style={styles.txtContent}>
            Korem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
            vulputate libero et velit interdum, ac aliquet odio mattis. sit
            amet, consectetur adipiscing elit. Nunc vulputate libero et velit
            interdumKorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nunc vulputate libero et velit interdum, ac aliquet odio mattis. sit
            amet, consectetur adipiscing elit. Nunc vulputate libero et velit
            interdumKorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nunc vulputate libero et velit interdum, ac aliquet odio mattis. sit
            amet, consectetur adipiscing elit. Nunc vulputate libero et velit
            interdumKorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nunc vulputate libero et velit interdum, ac aliquet odio mattis. sit
            amet, consectetur adipiscing elit. Nunc vulputate libero et velit
            interdumKorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nunc vulputate libero et velit interdum, ac aliquet odio mattis. sit
            amet, consectetur adipiscing elit. Nunc vulputate libero et velit
            interdumKorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nunc vulputate libero et velit interdum, ac aliquet odio mattis. sit
            amet, consectetur adipiscing elit. Nunc vulputate libero et velit
            interdum
          </TextView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUs;
