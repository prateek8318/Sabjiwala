/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Keep background notifications handled to avoid app termination on Android
  console.log('FCM background message:', remoteMessage?.messageId);
});

AppRegistry.registerComponent(appName, () => App);
