import { Platform } from 'react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidStyle,
  AndroidVisibility,
} from '@notifee/react-native';

const ANDROID_CHANNEL_ID = 'sabjiwala_alerts';
const ANDROID_CHANNEL_NAME = 'SabjiWala Alerts';

const buildTitle = (message: FirebaseMessagingTypes.RemoteMessage) =>
  message.notification?.title ?? message.data?.title ?? 'SabjiWala';

const buildBody = (message: FirebaseMessagingTypes.RemoteMessage) =>
  message.notification?.body ?? message.data?.body ?? '';

const buildImageUrl = (message: FirebaseMessagingTypes.RemoteMessage) =>
  // Prefer FCM notification image, fallback to common data keys
  message.notification?.android?.imageUrl ||
  message.data?.image ||
  message.data?.imageUrl ||
  undefined;

export const ensureNotificationChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  // Android 13+ runtime notification permission
  try {
    const settings = await notifee.requestPermission();
    console.log('[FCM] notifee permission settings', settings);
  } catch (err) {
    console.log('[FCM] notifee.requestPermission error', err);
  }

  await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: ANDROID_CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    lights: true,
    bypassDnd: false,
    visibility: AndroidVisibility.PUBLIC,
  });
};

export const presentRemoteMessage = async (
  message: FirebaseMessagingTypes.RemoteMessage,
) => {
  const title = buildTitle(message);
  const body = buildBody(message);
  const imageUrl = buildImageUrl(message);

  if (!title && !body) {
    return;
  }

  await ensureNotificationChannel();

  console.log('[FCM] presenting local notification', {
    id: message.messageId,
    title,
    imageUrl,
  });

  await notifee.displayNotification({
    title,
    body,
    data: message.data,
    android: {
      channelId: ANDROID_CHANNEL_ID,
      pressAction: {
        id: 'default',
      },
      sound: 'default',
      smallIcon: 'ic_launcher', // default app icon
      ...(imageUrl
        ? {
            largeIcon: imageUrl,
            style: {
              type: AndroidStyle.BIGPICTURE,
              picture: imageUrl,
            },
          }
        : {}),
    },
    ios: {
      sound: 'default',
      ...(imageUrl
        ? {
            attachments: [
              {
                url: imageUrl,
              },
            ],
          }
        : {}),
    },
  });
};

export const registerBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    try {
      await presentRemoteMessage(remoteMessage);
    } catch (error) {
      console.log('[FCM] background handler error', error);
    }
  });
};
