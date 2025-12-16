import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { LocalStorage } from '../helpers/localstorage';

export type SimpleNotification = {
  id: string;
  title: string;
  body: string;
  receivedAt: string;
  data?: Record<string, string | undefined>;
};

type NotificationContextValue = {
  notifications: SimpleNotification[];
  addNotification: (
    message: FirebaseMessagingTypes.RemoteMessage,
  ) => Promise<void>;
  clearNotifications: () => Promise<void>;
  loading: boolean;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = 'fcm_notifications';

export const NotificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadNotifications = async () => {
      const saved = await LocalStorage.read(STORAGE_KEY);
      if (saved && Array.isArray(saved)) {
        setNotifications(saved);
      }
      setLoading(false);
    };

    loadNotifications();
  }, []);

  const persistNotifications = async (items: SimpleNotification[]) => {
    await LocalStorage.save(STORAGE_KEY, items);
  };

  const addNotification = async (
    message: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    console.log('[FCM] addNotification', message?.messageId);
    const title =
      message.notification?.title ??
      message.data?.title ??
      'New notification';
    const body = message.notification?.body ?? message.data?.body ?? '';
    const id = message.messageId ?? `${Date.now()}`;

    const next: SimpleNotification = {
      id,
      title,
      body,
      receivedAt: new Date().toISOString(),
      data: message.data,
    };

    setNotifications(prev => {
      const updated = [next, ...prev].slice(0, 50);
      persistNotifications(updated);
      return updated;
    });
  };

  const clearNotifications = async () => {
    setNotifications([]);
    await LocalStorage.save(STORAGE_KEY, []);
  };

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      clearNotifications,
      loading,
    }),
    [notifications, loading],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotificationContext must be used within NotificationProvider',
    );
  }
  return context;
};

