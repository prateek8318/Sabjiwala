import React from 'react';
import { BlurView as RNBlurView } from '@react-native-community/blur';
import styles from './styles';

const CustomBlurView = () => {
  return (
    <RNBlurView
      style={styles.blurContainer}
      blurType="light"
      blurAmount={2}
      reducedTransparencyFallbackColor="white"
    />
  );
};

export default CustomBlurView;
