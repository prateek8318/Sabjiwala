import React, { FC } from 'react';
import { SafeAreaView, View } from 'react-native';
import styles from './notifications.styles';
import { Header, TextView } from '../../../../components';

const Notifications: FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Header title="Notifications" />
      </View>
      <View style={styles.contentContainer}>
        <TextView style={styles.emptyText}>no notification found</TextView>
      </View>
    </SafeAreaView>
  );
};

export default Notifications;
