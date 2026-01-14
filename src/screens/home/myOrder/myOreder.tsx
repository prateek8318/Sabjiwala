import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { TextView } from '../../../components';
import styles from './myOrder.styles';
import ApiService from '../../../service/apiService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Colors } from '../../../constant';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  OrderSummary: { order: any };
 
};

type MyOrderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderSummary'>;

const MyOrder = () => {
  const navigation = useNavigation<MyOrderScreenNavigationProp>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Memoize the fetchOrders function to prevent unnecessary re-renders
  const fetchOrders = useCallback(async (isRefresh = false) => {
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
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refresh orders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      
      const loadData = async () => {
        if (isActive) {
          await fetchOrders();
        }
      };
      
      loadData();
      
      // Cleanup function
      return () => {
        isActive = false;
      };
    }, [fetchOrders])
  );

  // Set header options with back button
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable 
          onPress={() => navigation.goBack()}
          style={({pressed}) => ({
            opacity: pressed ? 0.5 : 1,
            marginLeft: 15,
            padding: 5
          })}
        >
          <Icon name="arrow-left" size={24} color={Colors.PRIMARY[400]} />
        </Pressable>
      ),
    });
  }, [navigation]);

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
    if (!s) return '#666';

    // Return / pending -> yellow, Delivered / Completed -> green, Cancelled -> red
    if (s.includes('return')) return '#FBC02D';
    if (s.includes('pending')) return '#FBC02D';
    if (s.includes('delivered') || s.includes('completed')) return '#2E7D32';
    if (s.includes('cancel')) return '#D32F2F';

    return '#666';
  };

  const getDisplayStatus = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('returned_requested') || s.includes('return_requested') || s.includes('return requested')) {
      return 'Return';
    }
    return status || 'Unknown';
  };

  const computeOrderTotals = (order: any) => {
    const bill = order?.billSummary || order?.bill || order?.pricing || {};
    const items = order?.items || order?.products || [];

    // Calculate item total based on quantity
    const itemTotal =
      Number(order?.itemTotal) ||
      Number(order?.itemsTotal) ||
      Number(order?.subtotal) ||
      Number(bill?.itemTotal) ||
      items.reduce((sum: number, p: any) => {
        const qty = Number(p.quantity || 1);
        const unitPrice =
          Number(p.price) ||
          Number(p.amount) ||
          Number(p.total) ||
          Number(p.unitPrice) ||
          0;
        return sum + qty * unitPrice;
      }, 0);

    const deliveryCharge =
      Number(order?.deliveryFee) ||
      Number(order?.deliveryCharge) ||
      Number(order?.deliveryCharges) ||
      Number(order?.delivery_amount) ||
      Number(bill?.deliveryFee || bill?.deliveryCharge || bill?.deliveryCharges) ||
      0;

    const handlingCharge =
      Number(order?.handlingCharge) ||
      Number(order?.handling_fee) ||
      Number(order?.handlingCharges) ||
      Number(bill?.handlingCharge || bill?.handlingCharges || bill?.handlingFee) ||
      0;

    const couponDiscount =
      Number(order?.couponDiscount) ||
      Number(order?.coupon_amount) ||
      Number(order?.discount) ||
      Number(bill?.couponDiscount || bill?.couponAmount || bill?.discount) ||
      0;

    // Use grandTotal from API if available, otherwise calculate
    const grandTotal =
      Number(order?.grandTotal) ||
      Number(order?.totalAmount) ||
      Number(order?.total) ||
      Number(order?.amount) ||
      Math.max(0, itemTotal + handlingCharge + deliveryCharge - couponDiscount);

    return {
      itemTotal,
      deliveryCharge,
      handlingCharge,
      couponDiscount,
      grandTotal,
    };
  };

  const renderOrder = ({ item }: { item: any }) => {
    const items = item.items || item.products || [];
    const totalItems = items.length;
    const status = (item.status || item.orderStatus || '').toLowerCase();
    const isReturnRequested =
      status.includes('returned_requested') ||
      status.includes('return_requested') ||
      status.includes('return requested');
    const isDelivered = isReturnRequested || status.includes('delivered') || status.includes('completed');
    const isCancelled = status.includes('cancel');
    const deliveredDate =
      item.deliveredAt ||
      item.delivered_on ||
      item.deliveryDate ||
      item.completedAt ||
      item.updatedAt ||
      item.statusUpdatedAt ||
      item.deliveredDate;
    const deliveredAt = deliveredDate ? new Date(deliveredDate) : null;
    const diffHours = deliveredAt ? (Date.now() - deliveredAt.getTime()) / 36e5 : Infinity;
    const RETURN_WINDOW_HOURS = 72;
    const windowOpen = diffHours <= RETURN_WINDOW_HOURS;

    const totals = computeOrderTotals(item);

    const displayItems = items.slice(0, 5);
    const extraCount = totalItems - displayItems.length;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          navigation.navigate('OrderSummary', { order: item });
        }}
        style={[styles.orderCard, { backgroundColor: '#fff' }]}
      >
        {/* Status, price, and date on same line */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <TextView style={{ color: getStatusColor(item.status || item.orderStatus || ''), fontWeight: '700', fontSize: 14 }}>
            {getDisplayStatus(item.status || item.orderStatus || '')}
          </TextView>
          <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 8 }}>
            <TextView style={{ color: '#000', fontWeight: '700', fontSize: 14 }}>₹{totals.grandTotal.toFixed(2)}</TextView>
            <TextView style={{ color: '#444', fontSize: 12 }}>{formatDate(item.createdAt || item.orderDate)}</TextView>
          </View>
        </View>

        {/* Price Breakdown */}
        {/* <View style={{ marginBottom: 8, paddingVertical: 8, paddingHorizontal: 8, backgroundColor: '#F9F9F9', borderRadius: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <TextView style={{ color: '#666', fontSize: 12 }}>Item Total</TextView>
            <TextView style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>₹{totals.itemTotal.toFixed(2)}</TextView>
          </View>
          {totals.handlingCharge > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <TextView style={{ color: '#666', fontSize: 12 }}>Handling Charge</TextView>
              <TextView style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>₹{totals.handlingCharge.toFixed(2)}</TextView>
            </View>
          )}
          {totals.deliveryCharge > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <TextView style={{ color: '#666', fontSize: 12 }}>Delivery Charge</TextView>
              <TextView style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>₹{totals.deliveryCharge.toFixed(2)}</TextView>
            </View>
          )}
          {totals.couponDiscount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <TextView style={{ color: '#666', fontSize: 12 }}>Coupon Discount</TextView>
              <TextView style={{ color: '#2E7D32', fontSize: 12, fontWeight: '600' }}>-₹{totals.couponDiscount.toFixed(2)}</TextView>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#ddd' }}>
            <TextView style={{ color: '#000', fontSize: 13, fontWeight: '700' }}>Grand Total</TextView>
            <TextView style={{ color: '#000', fontSize: 13, fontWeight: '700' }}>₹{totals.grandTotal.toFixed(2)}</TextView>
          </View>
        </View> */}

        {/* Dashed border */}
        <View style={{ flexDirection: 'row', marginBottom: 8, marginTop: 2, alignItems: 'center' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 1,
                backgroundColor: '#ddd',
                marginRight: i < 29 ? 2 : 0,
              }}
            />
          ))}
        </View>

        {/* Items thumbnails row - overlapping images */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
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
                style={[styles.productImage, { marginLeft: idx === 0 ? 0 : -8, zIndex: displayItems.length - idx }]}
                defaultSource={require('../../../assets/images/order.png')}
              />
            );
          })}
          {extraCount > 0 && (
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: '#2E7D32',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: -8,
              zIndex: 0,
              borderWidth: 2,
              borderColor: '#fff'
            }}>
              <TextView style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{extraCount}+</TextView>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionButtons}>
          {/* Reorder Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Reorder', { orderId: item._id, order: item })}
          >
            <TextView style={styles.actionText}>Reorder</TextView>
          </TouchableOpacity>

          {/* Vertical Separator */}
          <View style={styles.separator} />

          {/* Track Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('OrderTracking', { orderId: item._id, order: item })}
          >
            <TextView style={styles.actionText}>Track</TextView>
          </TouchableOpacity>

          {/* Vertical Separator */}
          <View style={styles.separator} />

          {/* Return Button */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              (!isDelivered || isCancelled || (!windowOpen && !isReturnRequested)) ? styles.actionBtnDisabled : null,
            ]}
            disabled={!isDelivered || isCancelled || (!windowOpen && !isReturnRequested)}
            onPress={() => navigation.navigate('ReturnOrder', { orderId: item._id, order: item })}
          >
            <TextView
              style={[
                styles.actionText,
                (!isDelivered || isCancelled || (!windowOpen && !isReturnRequested)) ? styles.actionTextDisabled : null,
              ]}
            >
              Return
            </TextView>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.PRIMARY[100]} />
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
        showsVerticalScrollIndicator={true}
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