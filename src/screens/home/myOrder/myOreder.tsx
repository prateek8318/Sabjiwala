import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { TextView } from '../../../components';
import styles from './myOrder.styles';

const MyOrder = () => {
  return (
    <View style={styles.container}>
      <TextView>My Order</TextView>
    </View>
  );
};

export default MyOrder;
