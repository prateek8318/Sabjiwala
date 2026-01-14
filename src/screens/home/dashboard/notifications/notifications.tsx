import React, { FC, useCallback, useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './notifications.styles';
import { Header, TextView } from '../../../../components';
import { Colors } from '../../../../constant';
import ApiService from '../../../../service/apiService';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

const Notifications: FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await ApiService.getNotifications();
      if (response.data && response.data.status && Array.isArray(response.data.data)) {
        setNotifications(response.data.data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to load notifications',
          text2: response.data?.message || 'Please try again later'
        });
      }
      return true;
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to fetch notifications'
      });
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await ApiService.deleteNotification(notificationId);
      if (response.data?.status) {
        // Refresh the notifications list from server after successful deletion
        await fetchNotifications();
        Toast.show({
          type: 'success',
          text1: 'Notification deleted',
        });
      } else {
        throw new Error(response.data?.message || 'Failed to delete notification');
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to delete notification'
      });
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderNotification = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <View style={styles.card}>
        <View style={styles.notificationHeader}>
          <TextView style={styles.title}>{item.title}</TextView>
          <TouchableOpacity 
            onPress={() => handleDeleteNotification(item._id)}
            style={styles.deleteButton}
          >
            <Icon name="close" size={20} color="#FF0000" />
          </TouchableOpacity>
        </View>
        <View style={styles.notificationBody}>
          <TextView style={styles.body} numberOfLines={3}>
            {item.message}
          </TextView>
          <TextView style={styles.timestamp}>
            {moment(item.createdAt).fromNow()}
          </TextView>
        </View>
      </View>
    ),
    []
  );

  const renderEmptyComponent = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyWrapper}>
          <ActivityIndicator size="large" color={Colors.PRIMARY[500]} />
          <TextView style={[styles.emptyText, { marginTop: 16 }]}>
            Loading notifications...
          </TextView>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyWrapper}>
        <Icon name="notifications-none" size={48} color={Colors.SECONDARY[600]} />
        <TextView style={[styles.emptyText, { marginTop: 16 }]}>
          No notifications yet
        </TextView>
        
      </View>
    );
  }, [loading]);

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Notifications" 
        rightIconComponent={
          notifications.length > 0 ? (
            <TouchableOpacity 
              onPress={onRefresh} 
              style={styles.refreshButton}
              disabled={loading || refreshing}
            >
              <Icon name="refresh" size={24} color={Colors.PRIMARY[500]} />
            </TouchableOpacity>
          ) : null
        }
      />
      
      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
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
