import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { TextView } from '../../../components';
import styles from './favorites.styles';

const Favorites = () => {
  return (
    <View style={styles.container}>
      <TextView>Favorites</TextView>
    </View>
  );
};

export default Favorites;
