import React, { FC, useCallback, useState, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './notifications.styles';
import { Header, TextView } from '../../../../components';
import {
  useNotificationContext,
  type SimpleNotification,
} from '../../../../context';
import { Colors } from '../../../../constant';

const Notifications: FC = () => {
  const { notifications, clearNotifications, loading } = useNotificationContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await clearNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
    setRefreshing(false);
  }, [clearNotifications]);

  const renderNotification = useCallback(
    ({ item }: { item: SimpleNotification }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TextView style={styles.title}>{item.title}</TextView>
          <TextView style={styles.timestamp}>
            {moment(item.receivedAt).fromNow()}
          </TextView>
        </View>
        {item.body && (
          <TextView style={styles.body} numberOfLines={3} ellipsizeMode="tail">
            {item.body}
          </TextView>
        )}
      </View>
    ),
    []
  );

  const renderEmptyComponent = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY[500]} />
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name="notifications-none" size={48} color={Colors.SECONDARY[600]} />
        <TextView style={styles.emptyText}>No notifications yet</TextView>
        <TextView style={styles.emptySubtext}>
          We'll notify you when something new arrives
        </TextView>
      </View>
    );
  }, [loading]);

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Notifications" 
        rightComponent={
          notifications.length > 0 && (
            <TouchableOpacity 
              onPress={clearNotifications} 
              style={styles.clearButton}
              disabled={loading}
            >
              <Icon name="delete-sweep" size={24} color={Colors.PRIMARY[500]} />
            </TouchableOpacity>
          )
        }
      />
      
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY[500]]}
            tintColor={Colors.PRIMARY[500]}
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={100}
        windowSize={11}
      />
    </SafeAreaView>
  );
};

export default Notifications;
