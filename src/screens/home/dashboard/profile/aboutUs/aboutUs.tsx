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
  ActivityIndicator,
} from 'react-native';
import styles from './aboutUs.styles';
import { HomeStackProps } from '../../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, TextView } from '../../../../../components';
import { useCmsContent } from '../../../../../hooks/useCmsContent';

type AboutUsScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'AboutUs'
>;

const AboutUs: FC = () => {
  const navigation = useNavigation<AboutUsScreenNavigationType>();
  const { content, loading, error, refetch } = useCmsContent('about-us');

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#015304" />
          <TextView style={styles.loadingText}>Loading...</TextView>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <TextView style={styles.errorText}>{error}</TextView>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <TextView style={styles.retryButtonText}>Retry</TextView>
          </TouchableOpacity>
        </View>
      );
    }

    if (!content) {
      return (
        <View style={styles.errorContainer}>
          <TextView style={styles.errorText}>No content available</TextView>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <TextView style={styles.retryButtonText}>Retry</TextView>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <TextView style={styles.txtTitle}>{content.title}</TextView>
        <TextView style={styles.txtContent}>{content.content}</TextView>
      </View>
    );
  };

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
          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUs;
