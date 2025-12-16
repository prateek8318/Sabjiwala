// MyOrder.tsx (PURA CODE – COPY PASTE KAR DE)
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
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
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showSummary, setShowSummary] = useState(false);

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

    const displayItems = items.slice(0, 6);
    const extraCount = totalItems - displayItems.length;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setSelectedOrder(item);
          setShowSummary(true);
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
        <View style={{ marginBottom: 8, paddingVertical: 8, paddingHorizontal: 8, backgroundColor: '#F9F9F9', borderRadius: 8 }}>
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
        </View>

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
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Reorder', { orderId: item._id, order: item })}
          >
            <TextView style={styles.actionText}>Reorder</TextView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('OrderTracking', { orderId: item._id, order: item })}
          >
            <TextView style={styles.actionText}>Track</TextView>
          </TouchableOpacity>

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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <TextView style={styles.emptyText}>No orders found!</TextView>
          </View>
        }
      />

      {/* Order Summary Modal */}
      <Modal
        visible={showSummary}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSummary(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setShowSummary(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '90%',
              paddingHorizontal: 16,
              paddingTop: 12,
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc' }} />
            </View>
            <TextView style={{ fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 10 }}>
              Order Summary
            </TextView>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {selectedOrder ? (
                <>
                  <TextView style={{ color: '#444', marginBottom: 6 }}>
                    Order ID: {selectedOrder._id}
                  </TextView>
                  <TextView style={{ color: '#444', marginBottom: 12 }}>
                    Date: {formatDate(selectedOrder.createdAt || selectedOrder.orderDate)}
                  </TextView>

                  {(selectedOrder.products || selectedOrder.items || []).map((product: any, idx: number) => {
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
                    const unitPrice = Number(product.price || variantObj?.price || 0);
                    const qty = Number(product.quantity || 1);
                    const lineTotal = unitPrice * qty;
                    return (
                      <View
                        key={`${selectedOrder._id}-prod-${idx}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 10,
                          backgroundColor: '#F7F7F7',
                          borderRadius: 10,
                          padding: 10,
                        }}
                      >
                        <Image
                          source={source}
                          style={{ width: 54, height: 54, borderRadius: 8, marginRight: 10 }}
                          defaultSource={require('../../../assets/images/order.png')}
                        />
                        <View style={{ flex: 1 }}>
                          <TextView style={{ color: '#000', fontWeight: '700' }} numberOfLines={2}>
                            {productObj?.name || 'Item'}
                          </TextView>
                          <TextView style={{ color: '#555', marginTop: 2 }}>
                            Qty: {qty} • ₹{unitPrice.toFixed(2)} each
                          </TextView>
                        </View>
                        <TextView style={{ color: '#000', fontWeight: '700' }}>
                          ₹{lineTotal.toFixed(2)}
                        </TextView>
                      </View>
                    );
                  })}

                  {(() => {
                    const totals = computeOrderTotals(selectedOrder);
                    return (
                      <View style={{ marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: '#F2F7EC' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <TextView style={{ color: '#000' }}>Payment</TextView>
                          <TextView style={{ color: '#000', fontWeight: '700' }}>
                            {selectedOrder.paymentMethod?.toUpperCase()}
                          </TextView>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <TextView style={{ color: '#000' }}>Status</TextView>
                          <TextView style={{ color: '#000', fontWeight: '700' }}>
                            {selectedOrder.status || selectedOrder.orderStatus || 'pending'}
                          </TextView>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <TextView style={{ color: '#000' }}>Item Total</TextView>
                          <TextView style={{ color: '#000', fontWeight: '700' }}>₹{totals.itemTotal.toFixed(2)}</TextView>
                        </View>
                        {totals.handlingCharge > 0 && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                            <TextView style={{ color: '#000' }}>Handling Charge</TextView>
                            <TextView style={{ color: '#000', fontWeight: '700' }}>₹{totals.handlingCharge.toFixed(2)}</TextView>
                          </View>
                        )}
                        {totals.deliveryCharge > 0 && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                            <TextView style={{ color: '#000' }}>Delivery Charge</TextView>
                            <TextView style={{ color: '#000', fontWeight: '700' }}>₹{totals.deliveryCharge.toFixed(2)}</TextView>
                          </View>
                        )}
                        {totals.couponDiscount > 0 && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                            <TextView style={{ color: '#000' }}>Coupon Discount</TextView>
                            <TextView style={{ color: '#2E7D32', fontWeight: '700' }}>-₹{totals.couponDiscount.toFixed(2)}</TextView>
                          </View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#ddd' }}>
                          <TextView style={{ color: '#000', fontWeight: '700' }}>Grand Total</TextView>
                          <TextView style={{ color: '#000', fontWeight: '700' }}>₹{totals.grandTotal.toFixed(2)}</TextView>
                        </View>
                      </View>
                    );
                  })()}
                </>
              ) : null}
            </ScrollView>

            <TouchableOpacity
              onPress={() => {
                setShowSummary(false);
                if (selectedOrder?._id) {
                  navigation.navigate('RateOrder', { orderId: selectedOrder._id, order: selectedOrder });
                }
              }}
              activeOpacity={0.9}
              style={{
                backgroundColor: Colors.PRIMARY[100],
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <TextView style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Rate Product</TextView>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MyOrder;