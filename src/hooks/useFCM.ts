import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { LocalStorage } from '../helpers/localstorage';

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
  useEffect(() => {
    let unsubscribeOnMessage: (() => void) | undefined;
    let unsubscribeOnTokenRefresh: (() => void) | undefined;
    let unsubscribeOnNotificationOpen: (() => void) | undefined;

    const initFCM = async () => {
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
        if (onMessage) {
          await onMessage(remoteMessage);
        }
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
  }, [onMessage]);
};

export default useFCM;

