import { Vibration } from 'react-native';

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
  switch (type) {
    case 'light':
      Vibration.vibrate(50);
      break;
    case 'medium':
      Vibration.vibrate(100);
      break;
    case 'heavy':
      Vibration.vibrate(200);
      break;
    case 'success':
      Vibration.vibrate([0, 50, 50, 50]);
      break;
    case 'error':
      Vibration.vibrate([0, 50, 10, 50, 10, 50]);
      break;
  }
};
