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
import styles from './support.styles';
import { HomeStackProps } from '../../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, TextView } from '../../../../../components';

type SupportScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'Support'
>;

const Support: FC = () => {
  const navigation = useNavigation<SupportScreenNavigationType>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Header title="Support" />
        </View>

        <View>
         
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Support;
