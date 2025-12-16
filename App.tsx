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
import useFCM from './src/hooks/useFCM';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

const AppContent: FC = () => {
  const { addNotification } = useNotificationContext();
  const handleMessage = async (
    message: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    await addNotification(message);
    const title =
      message.notification?.title ??
      message.data?.title ??
      'New notification';
    const body = message.notification?.body ?? message.data?.body ?? '';
    // quick in-app surface so user sees it immediately
    Toast.show({
      type: 'info',
      text1: title,
      text2: body,
      visibilityTime: 4000,
    });
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
              <Route />
              <Toast />
            </CartProvider>
          </CommonAlertProvider>
        </CommonLoaderProvider>
      </UserDataContextProvider>
    </>
  );
};

const App: FC = () => (
  <NotificationProvider>
    <AppContent />
  </NotificationProvider>
);

export default App;
