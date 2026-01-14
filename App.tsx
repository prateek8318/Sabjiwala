import React, { FC } from 'react';
import { LogBox } from 'react-native';
import Route from './src/routes';
import {
  NotificationProvider,
  UserDataContextProvider,
  useNotificationContext,
} from './src/context';
import { CommonLoaderProvider } from './src/components/CommonLoader/commonLoader';
import { CommonAlertProvider } from './src/components/CommonAlertModal/commonAlertModal';
import Toast from 'react-native-toast-message';
import { CartProvider } from './src/context/CartContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import useFCM from './src/hooks/useFCM';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const AppContent: FC = () => {
  // We now rely on real OS push notifications via Notifee + FCM.
  // So we don't store every message in the in-app list anymore.
  const handleMessage = async (
    message: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    console.log('[FCM] JS handler received message', {
      id: message.messageId,
      title:
        message.notification?.title ??
        message.data?.title ??
        'New notification',
    });
    // No in-app list / toast here – actual push UI is handled by Notifee.
  };

  useFCM(handleMessage);

  // Hiding warning logs - only used in debug mode
  LogBox.ignoreLogs(['Warning: ...']);
  LogBox.ignoreAllLogs();

  return (
    <>
      <UserDataContextProvider>
        <CommonLoaderProvider>
          <CommonAlertProvider>
          
            <CartProvider>
              <FavoritesProvider>
                <Route />
                <Toast />
              </FavoritesProvider>
            </CartProvider>
          </CommonAlertProvider>
        </CommonLoaderProvider>
      </UserDataContextProvider>
    </>
  );
};

const App: FC = () => (
  <NotificationProvider>
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  </NotificationProvider>
);

export default App;
