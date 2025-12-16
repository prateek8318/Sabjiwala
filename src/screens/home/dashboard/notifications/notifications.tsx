import React, { FC, useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  View,
} from 'react-native';
import moment from 'moment';
import styles from './notifications.styles';
import { Header, TextView } from '../../../../components';
import {
  useNotificationContext,
  type SimpleNotification,
} from '../../../../context';

const Notifications: FC = () => {
  const { notifications, clearNotifications, loading } =
    useNotificationContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await clearNotifications();
    setRefreshing(false);
  }, [clearNotifications]);

  const renderNotification = useCallback(
    ({ item }: { item: SimpleNotification }) => (
      <View style={styles.card}>
        <TextView style={styles.title}>{item.title}</TextView>
        {item.body ? <TextView style={styles.body}>{item.body}</TextView> : null}
        <TextView style={styles.timestamp}>
          {moment(item.receivedAt).fromNow()}
        </TextView>
      </View>
    ),
    [],
  );

  const renderEmptyComponent = () =>
    loading ? null : (
      <View style={styles.contentContainer}>
        <TextView style={styles.emptyText}>no notification found</TextView>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Notifications" />
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        contentContainerStyle={
          notifications.length ? styles.listContent : styles.emptyWrapper
        }
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
            tintColor={'#000'}
          />
        }
      />
    </SafeAreaView>
  );
};

export default Notifications;
