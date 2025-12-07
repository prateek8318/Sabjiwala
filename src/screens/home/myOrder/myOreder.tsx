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
      const res = await ApiService.getMyOrders(); 
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s?.includes('delivered') || s?.includes('completed')) return '#4CAF50';
    if (s?.includes('cancel')) return '#F44336';
    return '#666';
  };

  const renderOrder = ({ item }: { item: any }) => {
    const items = item.items || item.products || [];
    const totalItems = items.length;

    const bill = item.billSummary || item.bill || item.pricing || {};

    const itemTotal =
      Number(item.itemTotal) ||
      Number(item.itemsTotal) ||
      Number(item.subtotal) ||
      Number(bill.itemTotal) ||
      items.reduce(
        (sum: number, p: any) =>
          sum + Number(p.price || p.amount || p.total || 0),
        0
      );
    const deliveryCharge =
      Number(item.deliveryFee) ||
      Number(item.deliveryCharge) ||
      Number(item.deliveryCharges) ||
      Number(item.delivery_amount) ||
      Number(bill.deliveryFee || bill.deliveryCharge || bill.deliveryCharges) ||
      0;
    const handlingCharge =
      Number(item.handlingCharge) ||
      Number(item.handling_fee) ||
      Number(item.handlingCharges) ||
      Number(bill.handlingCharge || bill.handlingCharges || bill.handlingFee) ||
      0;
    const totalAmount =
      item.totalAmount || item.amount || item.total || itemTotal + deliveryCharge + handlingCharge;

    const displayItems = items.slice(0, 6);
    const extraCount = totalItems - displayItems.length;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('OrderSummary', { orderId: item._id, order: item })}
        style={[styles.orderCard, { backgroundColor: '#fff' }]}
      >
        {/* Status and summary */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
              backgroundColor: '#E8F5E9',
              borderWidth: 1,
              borderColor: getStatusColor(item.status || item.orderStatus || ''),
            }}>
              <TextView style={{ color: getStatusColor(item.status || item.orderStatus || ''), fontWeight: '700' }}>
                {item.status || item.orderStatus || 'Unknown'}
              </TextView>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <TextView style={{ color: '#000', fontWeight: '700' }}>₹{totalAmount}</TextView>
            <TextView style={{ color: '#444', fontSize: 11 }}>{formatDate(item.createdAt || item.orderDate)}</TextView>
          </View>
        </View>

        <TextView style={{ color: '#000', marginBottom: 6 }}>{totalItems} item{totalItems === 1 ? '' : 's'} in order</TextView>

        {/* Items thumbnails row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          {displayItems.map((product: any, idx: number) => {
            const productObj = product.productId || product.product || product;
            const variantObj = product.variantId || product.variant;
            const candidates = [
              product.image,
              product.productImage,
              product.images?.[0],
              productObj?.image,
              productObj?.images?.[0],
              productObj?.productImage,
              productObj?.productImages?.[0],
              productObj?.featuredImage,
              variantObj?.image,
              variantObj?.images?.[0],
              productObj?.thumbnail,
              variantObj?.thumbnail,
              product.thumbnail,
            ].filter(Boolean);
            const img = candidates[0];
            const isAbsolute =
              typeof img === 'string' &&
              (img.startsWith('http://') || img.startsWith('https://'));
            const source = img
              ? { uri: isAbsolute ? img : ApiService.getImage(img) }
              : require('../../../assets/images/order.png');
            return (
              <Image
                key={idx}
                source={source}
                style={styles.productImage}
                defaultSource={require('../../../assets/images/order.png')}
              />
            );
          })}
          {extraCount > 0 && (
            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#1B743E', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
              <TextView style={{ color: '#fff', fontWeight: '700' }}>+{extraCount}</TextView>
            </View>
          )}
        </View>

        {/* Bill Summary (compact) */}
        <View style={{ marginTop: 6, borderTopWidth: 1, borderColor: '#eee', paddingTop: 8 }}>
          {[
            { label: 'Item total', value: itemTotal },
            { label: 'Delivery fee', value: deliveryCharge },
            { label: 'Handling charge', value: handlingCharge },
          ].map((row, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
              <TextView style={{ color: '#000' }}>{row.label}</TextView>
              <TextView style={{ color: '#000' }}>₹{row.value}</TextView>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
            <TextView style={{ color: '#000', fontWeight: '700' }}>Total Bill</TextView>
            <TextView style={{ color: '#000', fontWeight: '700' }}>₹{totalAmount}</TextView>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Reorder', { orderId: item._id, order: item })}
          >
            <TextView style={styles.actionText}>Reorder</TextView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('RateOrder', { orderId: item._id, order: item })}
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
      </TouchableOpacity>
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
      <TextView style={[styles.title, { color: '#000', fontWeight: '700', marginTop: 45 }]}>My order</TextView>

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