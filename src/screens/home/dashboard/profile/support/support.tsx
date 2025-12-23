import React, { FC, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeStackProps } from '../../../../../@types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../../../../../components';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../../../../constant/colors';
import ChatBot from '../../../../../components/ChatBot/ChatBot';

type SupportScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'Support'
>;

const Support: FC = () => {
  const navigation = useNavigation<SupportScreenNavigationType>();

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Support" 
        isBack={false}
       
      />
      <View style={styles.chatContainer}>
        <ChatBot onClose={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[300],
  },
});

export default Support;