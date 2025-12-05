// MyOrder.tsx (PURA CODE – COPY PASTE KAR DE)
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { TextView } from '../../../components';
import styles from './myOrder.styles';
import ApiService from '../../../service/apiService';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constant';


const MyOrder = () => {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const res = await ApiService.getMyOrders(); // ← Tera exact endpoint
      setOrders(res.data.orders || res.data.data || []);
    } catch (err: any) {
      console.log('Orders fetch failed:', err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(true);
  }, []);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s?.includes('delivered') || s?.includes('completed')) return '#4CAF50';
    if (s?.includes('cancel')) return '#F44336';
    return '#666';
  };

  const renderOrder = ({ item }: { item: any }) => {
    const items = item.items || item.products || [];
    const totalItems = items.length;
    const displayItems = items.slice(0, 4);
    const extraCount = totalItems - 4;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <TextView style={[styles.statusText, { color: getStatusColor(item.status || item.orderStatus) }]}>
            {item.status || item.orderStatus || 'Unknown'}
          </TextView>
          <TextView style={styles.priceText}>₹{item.totalAmount || item.amount || 0}</TextView>
          <TextView style={styles.dateText}>
            {moment(item.createdAt || item.orderDate).format('DD-MMM-YYYY')}
          </TextView>
        </View>

        <View style={styles.imageRow}>
          {displayItems.map((product: any, idx: number) => (
            <Image
              key={idx}
              source={{ uri: ApiService.getImage(product.image || product.productImage || product.variant?.images?.[0]) }}
              style={styles.productImage}
              defaultSource={require('../../../assets/images/order.png')}
            />
          ))}
          {extraCount > 0 && (
            <View style={styles.moreItems}>
              <TextView style={styles.moreText}>+{extraCount}</TextView>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => ApiService.reorder(item._id)}
          >
            <TextView style={styles.actionText}>Reorder</TextView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('RateOrder', { orderId: item._id })}
          >
            <TextView style={styles.actionText}>Rate Order</TextView>
          </TouchableOpacity>

          {(item.status === 'Delivered' || item.status === 'Completed') && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.returnBtn]}
              onPress={() => navigation.navigate('ReturnOrder', { orderId: item._id })}
            >
              <TextView style={[styles.actionText, { color: Colors.PRIMARY[300] }]}>
                Return
              </TextView>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.PRIMARY[300]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextView style={styles.title}>My Order</TextView>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={renderOrder}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <TextView style={styles.emptyText}>No orders found!</TextView>
          </View>
        }
      />
    </View>
  );
};

export default MyOrder;