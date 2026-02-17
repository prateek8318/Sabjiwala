import React, { useCallback } from 'react';
import {
  View,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { TextView } from '../../../components';
import ApiService from '../../../service/apiService';
import styles from './myOrder.styles';

type RootStackParamList = {
  OrderSummary: { order: any };
  RateOrder: { orderId: string; order: any };
};

type OrderSummaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderSummary'>;
type OrderSummaryScreenRouteProp = RouteProp<RootStackParamList, 'OrderSummary'>;

const OrderSummaryScreen = () => {
  const navigation = useNavigation<OrderSummaryScreenNavigationProp>();
  const route = useRoute<OrderSummaryScreenRouteProp>();
  const rawOrder = route.params.order;

  // Get the order data from the route params
  const order = rawOrder?.data || rawOrder;
  
  // Calculate order totals with proper null checks and fallbacks
  const computeOrderTotals = (orderData: any) => {
    // Check both direct and nested data for charges
    const data = orderData?.data || orderData;

    // Debug log to check the data structure
    console.log('Order data for totals:', JSON.stringify(data, null, 2));

    // Calculate item total from products array if not provided
    let calculatedItemTotal = 0;
    if (data?.products || data?.items) {
      const products = data.products || data.items || [];
      calculatedItemTotal = products.reduce((total: number, product: any) => {
        const price = Number(product.price || 0);
        const quantity = Number(product.quantity || 1);
        return total + (price * quantity);
      }, 0);
    }

    const totals = {
      itemTotal: Number(data?.itemPriceTotal || data?.itemTotal || calculatedItemTotal || 0),
      deliveryCharge: Number(data?.deliveryCharge || data?.shippingCharge || 0),
      handlingCharge: Number(data?.handlingCharge || 0),
      couponDiscount: Math.abs(Number(data?.couponDiscount || data?.couponUsage?.[0]?.discountAmount || 0)), // Ensure positive value
      grandTotal: Number(data?.grandTotal || data?.totalAmount || calculatedItemTotal || 0),
    };

    console.log('Calculated totals:', totals);
    return totals;
  };

  const totals = React.useMemo(() => computeOrderTotals(order), [order]);

  // Check if order is eligible for rating (delivered/completed)
  const canRateOrder = React.useMemo(() => {
    if (!order || !order._id) {
      console.log('canRateOrder: No order or order ID');
      return false;
    }
    
    // Check both status and orderStatus fields
    const status = (order?.status || order?.orderStatus || '').toLowerCase().trim();
    
    // Check for delivered/completed status
    const isDelivered = 
      status.includes('delivered') || 
      status.includes('completed') ||
      status === 'delivered' ||
      status === 'completed';
    
    // Also check if order has deliveredAt date as additional indicator
    const hasDeliveredDate = !!(order?.deliveredAt || order?.delivered_on || order?.deliveryDate || order?.completedAt);
    
    // Exclude pending, cancelled, and return requested orders
    const isExcluded = 
      status.includes('pending') || 
      status.includes('cancel') || 
      status.includes('return_requested') ||
      status.includes('returned_requested');
    
    const result = (isDelivered || hasDeliveredDate) && !isExcluded;
    
    // Log for debugging
    console.log('canRateOrder check:', {
      status: order?.status || order?.orderStatus,
      isDelivered,
      hasDeliveredDate,
      isExcluded,
      finalResult: result
    });
    
    return result;
  }, [order]);

  // Extract shipping address with proper fallbacks
  const shippingAddress = React.useMemo(() => {
    const directAddr =
      order?.shippingAddress ||
      order?.data?.shippingAddress ||
      order?.deliveryAddress ||
      order?.address ||
      order?.addressLine ||
      order?.deliveryAddressText ||
      order?.addressText;

    if (!directAddr) {
      console.log('No shipping address found in order data:', { order });
      return {
        receiverName: order?.userName || 'Customer',
        receiverNo: order?.mobileNo || order?.phone || '',
        houseNoOrFlatNo: '',
        landmark: '',
        city: '',
        pincode: '',
        floor: '',
        addressType: order?.addressType || 'home',
      };
    }

    if (typeof directAddr === 'string') {
      return {
        receiverName: order?.userName || 'Customer',
        receiverNo: order?.mobileNo || order?.phone || '',
        houseNoOrFlatNo: directAddr,
        landmark: '',
        city: '',
        pincode: '',
        floor: '',
        addressType: order?.addressType || 'home',
      };
    }

    return directAddr;
  }, [order]);

  React.useEffect(() => {
    // Log complete order object
    console.log('=== ORDER SUMMARY SCREEN ===');
    console.log('Order Object:', JSON.stringify(order, null, 2));

    // Basic order info
    console.log('Order ID:', order?._id);
    console.log('Order Status:', order?.status);
    console.log('Order Date:', order?.createdAt ? formatDate(order.createdAt) : 'N/A');
    console.log('Total Items:', (order?.products || order?.items || []).length);

    // Log order items details
    const orderItems = order?.products || order?.items || [];
    if (orderItems.length) {
 
      console.log('--- Order Items ---');
      orderItems.forEach((item: any, index: number) => {
        console.log(`Item ${index + 1}:`, {
          name: item.productId?.name || item.product?.name || 'N/A',
          quantity: item.quantity,
          price: item.price,
          variant: item.variantId?.name || item.variant?.name || 'N/A'
        });
      });
    }

    // Log shipping address and order data for debugging
    console.log('--- Order Data ---');
    console.log('Complete order object:', JSON.stringify(order, null, 2));
    console.log('Raw order object:', JSON.stringify(rawOrder, null, 2));

    console.log('--- Shipping Address ---');
    if (shippingAddress) {
      console.log('Name:', shippingAddress.receiverName);
      console.log('Phone:', shippingAddress.receiverNo);
      console.log('House/Flat:', shippingAddress.houseNoOrFlatNo);
      console.log('Floor:', shippingAddress.floor);
      console.log('Landmark:', shippingAddress.landmark);
      console.log('City:', shippingAddress.city);
      console.log('Pincode:', shippingAddress.pincode);
      console.log('Address Type:', shippingAddress.addressType);
    } else {
      console.log('No shipping address found in the order data');
    }

    // Log payment details
    console.log('--- Payment Details ---');
    console.log('Payment Method:', order?.paymentMethod || 'N/A');
    console.log('Payment Status:', order?.paymentStatus || 'N/A');
    console.log('Transaction ID:', order?.transactionId || 'N/A');

      // Log order totals if available
    console.log('--- Order Totals ---');
    if (totals) {
      console.log('Item Total:', totals.itemTotal);
      console.log('Delivery Charge:', totals.deliveryCharge);
      console.log('Handling Charge:', totals.handlingCharge);
      console.log('Coupon Discount:', totals.couponDiscount);
      console.log('Grand Total:', totals.grandTotal);
    } else {
      console.log('No totals information available');
    }
  }, [order, shippingAddress, totals]);

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string): string => {
    const s = status?.toLowerCase();
    if (!s) return '#666';
    if (s.includes('return')) return '#FBC02D';
    if (s.includes('pending')) return '#FBC02D';
    if (s.includes('delivered') || s.includes('completed')) return '#2E7D32';
    if (s.includes('cancel')) return '#D32F2F';
    return '#666';
  };

  interface OrderItem {
    quantity?: number;
    price?: number;
    productId?: any;
    product?: any;
    variantId?: any;
    variant?: any;
    image?: string;
    images?: string[];
    productImage?: string;
  }


  if (!order) {
    return (
      <SafeAreaView style={styles.center}>
        <TextView>No order data available</TextView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <TextView style={styles.headerTitle}>Order Summary</TextView>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Status + Items Count */}
        <View style={{ padding: 16 }}>
          <LinearGradient
            colors={["#5A875C", "#015304"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusBadge}
          >
            <TextView style={styles.statusText}>
              {order?.status || 'Delivered'}
            </TextView>
          </LinearGradient>

          <View style={styles.divider} />
          <TextView style={styles.itemsCountText}>
            {(order?.products || order?.items || []).length} items in order
          </TextView>
        </View>

        {/* Products List */}
        {(order.products || order.items || []).map((product: OrderItem, idx: number) => {
          const productObj = product.productId || product.product || product;
          const variantObj = product.variantId || product.variant;
          const candidates = [
            product.image, product.productImage, product.images?.[0],
            productObj?.image, productObj?.images?.[0], productObj?.productImage,
            variantObj?.image, variantObj?.images?.[0],
          ].filter(Boolean);
          const img = candidates[0];
          const source = img
            ? { uri: img.startsWith('http') ? img : ApiService.getImage(img) }
            : require('../../../assets/images/order.png');
          const unitPrice = Number(product.price || variantObj?.price || 0);
          const qty = Number(product.quantity || 1);
          const lineTotal = unitPrice * qty;

          return (
            <View key={idx} style={styles.productItem}>
              <Image source={source} style={styles.productImage} />
              <View style={styles.productDetails}>
                <TextView style={styles.productName} numberOfLines={2}>
                  {productObj?.name || 'Item'}
                </TextView>
                <TextView style={styles.productQuantity}>
                  Qty: {qty} × ₹{unitPrice.toFixed(2)}
                </TextView>
              </View>
              <TextView style={styles.productPrice}>
                ₹{lineTotal.toFixed(2)}
              </TextView>
            </View>
          );
        })}

        {/* Bill Summary */}
        <View style={styles.sectionContainer}>
          <View style={styles.divider} />
          <TextView style={styles.sectionTitle}>Bill Summary</TextView>
          <View style={styles.card}>
            <View style={styles.billRow}>
              <TextView style={styles.billLabel}>Item total & GST</TextView>
              <TextView style={styles.billValue}>₹{totals?.itemTotal?.toFixed(2) || '0.00'}</TextView>

            </View>
            <View style={styles.billRow}>
              <TextView style={styles.billLabel}>Delivery Fee</TextView>
              <TextView style={styles.billValue}>₹{totals?.deliveryCharge?.toFixed(2) || '0.00'}</TextView>
            </View>
            <View style={styles.billRow}>
              <TextView style={styles.billLabel}>Handling Charge</TextView>
              <TextView style={styles.billValue}>₹{totals?.handlingCharge?.toFixed(2) || '0.00'}</TextView>
            </View>
            <View style={styles.billRow}>
              <TextView style={styles.billLabel}>Coupon Discount</TextView>
              <TextView style={[styles.billValue, { color: '#2E7D32' }]}>
                -₹{totals?.couponDiscount?.toFixed(2) || '0.00'}
              </TextView>
            </View>
            {/* {totals.deliveryCharge > 0 && (
              
            )} */}
            {/* {totals.handlingCharge > 0 && (
              
            )} */}
            <View style={[styles.billRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#eee' }]}>
              <TextView style={[styles.billLabel, { fontSize: 16, fontWeight: '700' }]}>Total Bill</TextView>
              <TextView style={[styles.billValue, { fontSize: 16, fontWeight: '700' }]}>
                ₹{totals?.grandTotal?.toFixed(2) || '0.00'}
              </TextView>
            </View>
          </View>
        </View>

        {/* Order Details */}
        <View style={[styles.sectionContainer, { marginBottom: 0 }]}>
          <View style={styles.divider} />
          <TextView style={styles.sectionTitle}>Order Details</TextView>
          <View style={[styles.card, { paddingVertical: 12 }]}>
            <View style={[styles.detailRow, { marginBottom: 8 }]}>
              <TextView style={styles.detailLabel}>Order ID:</TextView>
              <TextView style={styles.detailValue}>#{order?._id}</TextView>
            </View>

            <View style={[styles.detailRow, { marginBottom: 8 }]}>
              <TextView style={styles.detailLabel}>Payment Method:</TextView>
              <TextView style={[styles.detailValue, { textTransform: 'capitalize' }]}>
                {order?.paymentMethod || 'N/A'}
              </TextView>
            </View>

            <View style={styles.detailRow}>
              <TextView style={styles.detailLabel}>Order Placed On:</TextView>
              <TextView style={styles.detailValue}>
                {formatDate(order?.createdAt || order?.orderDate)}
              </TextView>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={[styles.sectionContainer, { marginTop: 0 }]}>
          <View style={styles.divider} />
          <TextView style={styles.sectionTitle}>Delivery Address</TextView>
          <View style={[styles.card, { padding: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TextView style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>
                {shippingAddress?.receiverName || 'N/A'}
              </TextView>
              <View style={[styles.statusDot, { backgroundColor: '#4CAF50', marginLeft: 8 }]} />
            </View>

            {(shippingAddress?.houseNoOrFlatNo || shippingAddress?.floor) && (
              <TextView style={{ color: '#666', marginBottom: 4 }}>
                {shippingAddress?.houseNoOrFlatNo || ''}{shippingAddress?.floor ? `, Floor: ${shippingAddress.floor}` : ''}
              </TextView>
            )}

            {shippingAddress?.landmark && (
              <TextView style={{ color: '#666', marginBottom: 4 }}>
                {shippingAddress?.landmark}
              </TextView>
            )}

            {(shippingAddress?.city || shippingAddress?.pincode) && (
              <TextView style={{ color: '#666', marginBottom: 4 }}>
                {shippingAddress?.city || ''}{shippingAddress?.city && shippingAddress?.pincode ? ' - ' : ''}{shippingAddress?.pincode || ''}
              </TextView>
            )}

            {shippingAddress?.receiverNo && (
              <TextView style={{ color: '#666', marginTop: 8 }}>
                Mobile: {shippingAddress?.receiverNo}
              </TextView>
            )}
          </View>
        </View>

        {/* Rate Button - Only show for delivered/completed orders */}
        {canRateOrder && (
          <View style={[styles.sectionContainer, { marginTop: 0 }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                console.log('Navigating to RateOrder with orderId:', order?._id);
                if (order?._id) {
                  navigation.navigate('RateOrder', { 
                    orderId: order._id, 
                    order: order 
                  });
                } else {
                  console.error('Cannot rate: Order ID is missing');
                }
              }}
              style={[styles.rateButton, { 
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#015304',
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }]}
            >
              
              <TextView style={[styles.rateButtonText, { 
                color: '#015304',
                fontWeight: '600',
                fontSize: 16,
              }]}>
                Rate Orders
              </TextView>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderSummaryScreen;
