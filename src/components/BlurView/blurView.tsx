import { Platform } from 'react-native';
import { BlurView as RNBlurView } from '@react-native-community/blur';
import styles from './styles';

const CustomBlurView = () => {
  return (
    <RNBlurView
      style={styles.blurContainer}
      blurType="light"
      blurAmount={10}
      reducedTransparencyFallbackColor="white"
      overlayColor={Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.3)' : undefined}
    />
  );
};

export default CustomBlurView;
