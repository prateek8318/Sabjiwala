import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { useCallback, useEffect } from 'react';
import { LocalStorage } from '../helpers/localstorage';
import {
  ensureNotificationChannel,
  presentRemoteMessage,
} from '../utils/pushNotifications';

const isPermissionEnabled = (
  status: FirebaseMessagingTypes.AuthorizationStatus,
) =>
  status === messaging.AuthorizationStatus.AUTHORIZED ||
  status === messaging.AuthorizationStatus.PROVISIONAL;

/**
 * Sets up FCM permission, token, and foreground listeners.
 */
const useFCM = (
  onMessage?: (
    message: FirebaseMessagingTypes.RemoteMessage,
  ) => Promise<void> | void,
) => {
  const forwardMessage = useCallback(
    async (message: FirebaseMessagingTypes.RemoteMessage) => {
      try {
        await presentRemoteMessage(message);
      } catch (error) {
        console.log('[FCM] local notification error', error);
      }

      if (onMessage) {
        await onMessage(message);
      }
    },
    [onMessage],
  );

  useEffect(() => {
    let unsubscribeOnMessage: (() => void) | undefined;
    let unsubscribeOnTokenRefresh: (() => void) | undefined;
    let unsubscribeOnNotificationOpen: (() => void) | undefined;

    const initFCM = async () => {
      // Log any cached token so it shows up in native dev tools console
      const cached = await LocalStorage.read('fcm_token');
      if (cached) {
        console.log('[FCM] cached token (dev tools)', cached);
      }

      await ensureNotificationChannel();
      console.log('[FCM] requesting permission');
      const authorizationStatus = await messaging().requestPermission();
      console.log('[FCM] permission status', authorizationStatus);

      if (isPermissionEnabled(authorizationStatus)) {
        try {
          await messaging().registerDeviceForRemoteMessages();
          const token = await messaging().getToken();
          console.log('[FCM] token', token);
          if (token) {
            await LocalStorage.save('fcm_token', token);
          }
        } catch (err) {
          console.log('[FCM] token error', err);
        }
      } else {
        console.log('[FCM] permission not granted, skipping token');
      }

      unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
        console.log('[FCM] foreground message', remoteMessage?.messageId);
        await forwardMessage(remoteMessage);
      });

      unsubscribeOnTokenRefresh = messaging().onTokenRefresh(async token => {
        console.log('[FCM] token refreshed', token);
        await LocalStorage.save('fcm_token', token);
      });

      // Handle notifications that opened the app from a quit state
      messaging()
        .getInitialNotification()
        .then(initialMessage => {
          console.log(
            '[FCM] initial notification',
            initialMessage?.messageId ?? 'none',
          );
          if (initialMessage && onMessage) {
            onMessage(initialMessage);
          }
        });

      messaging()
        .setAutoInitEnabled(true)
        .catch(() => {});

      unsubscribeOnNotificationOpen = messaging().onNotificationOpenedApp(
        remoteMessage => {
          console.log(
            '[FCM] notification opened app',
            remoteMessage?.messageId ?? 'none',
          );
          if (remoteMessage && onMessage) {
            onMessage(remoteMessage);
          }
        },
      );
    };

    initFCM();

    return () => {
      unsubscribeOnMessage && unsubscribeOnMessage();
      unsubscribeOnTokenRefresh && unsubscribeOnTokenRefresh();
      unsubscribeOnNotificationOpen && unsubscribeOnNotificationOpen();
    };
  }, [forwardMessage, onMessage]);
};

export default useFCM;

