import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { TextView } from '../../../../components';
import { Colors } from '../../../../constant';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import ApiService from '../../../../service/apiService';
import styles from './returnOrder.styles';

const RETURN_WINDOW_HOURS = 72; // show return button for 3 days after delivery

interface Props {
  route: any;
  navigation: any;
}

const reasonOptions = ['Damaged item', 'Wrong item delivered', 'Quality not as expected', 'Item missing', 'Other'];

const ReturnOrder: React.FC<Props> = ({ route, navigation }) => {
  const { orderId, order: passedOrder } = route.params || {};
  const [order, setOrder] = useState<any>(passedOrder || null);
  const [loading, setLoading] = useState(!passedOrder);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, { quantity: number; reason: string; description: string }>>({});
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Loading address...');

  const formatAddress = (addrObj: any) => {
    if (!addrObj) return '';
    if (typeof addrObj === 'string') return addrObj;

    const parts = [
      addrObj.houseNoOrFlatNo,
      addrObj.floor ? `Floor ${addrObj.floor}` : '',
      addrObj.landmark,
      addrObj.city,
      addrObj.pincode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const res = await ApiService.getOrderDetails(orderId);
        const data = res?.data?.order || res?.data?.orders?.[0] || res?.data?.data || res?.data;
        if (data) setOrder(data);
      } catch (err: any) {
        console.log('Return order fetch error:', err?.response?.data || err?.message);
      } finally {
        setLoading(false);
      }
    };
    if (!passedOrder) fetchOrder();
  }, [orderId, passedOrder]);

  useEffect(() => {
    const resolveAddress = async () => {
      const o = order || passedOrder;
      if (!o) return;

      const directAddr =
        formatAddress(o.address) ||
        formatAddress(o.deliveryAddress) ||
        formatAddress(o.shippingAddress) ||
        formatAddress(o.addressLine) ||
        (typeof o.addressText === 'string' ? o.addressText : '') ||
        (typeof o.deliveryAddressText === 'string' ? o.deliveryAddressText : '');

      if (directAddr) {
        setDeliveryAddress(directAddr);
        return;
      }

      if (o.addressId) {
        try {
          const res = await ApiService.getAddresses();
          const list = res?.data?.address?.[0]?.addresses || res?.data?.addresses || res?.data?.data?.addresses || [];
          const found = list.find((addr: any) => addr?._id === o.addressId);
          if (found) {
            const text = formatAddress(found);
            setDeliveryAddress(text || 'Address available');
            return;
          }
        } catch (err: any) {
          console.log('Address lookup failed:', err?.response?.data || err?.message);
        }
      }

      setDeliveryAddress('Address not available');
    };

    resolveAddress();
  }, [order, passedOrder]);

  const products = useMemo(() => order?.products || order?.items || [], [order]);

  const deliveredState = useMemo(() => {
    const status = (order?.status || order?.orderStatus || '').toLowerCase();
    const isReturnRequested =
      status.includes('returned_requested') ||
      status.includes('return_requested') ||
      status.includes('return requested');
    const isDelivered = isReturnRequested || status.includes('delivered') || status.includes('completed');

    const deliveredDate =
      order?.deliveredAt ||
      order?.delivered_on ||
      order?.deliveryDate ||
      order?.completedAt ||
      order?.updatedAt ||
      order?.statusUpdatedAt ||
      order?.deliveredDate;

    const deliveredAt = deliveredDate ? new Date(deliveredDate) : null;
    const diffHours = deliveredAt ? (Date.now() - deliveredAt.getTime()) / 36e5 : Infinity;
    const windowOpen = diffHours <= RETURN_WINDOW_HOURS;
    const hoursLeft = Math.max(0, Math.round(RETURN_WINDOW_HOURS - diffHours));

    return { isDelivered, windowOpen, hoursLeft, isReturnRequested };
  }, [order]);

  const toggleSelect = (key: string, maxQty: number) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
        return next;
      }
      next[key] = { quantity: Math.min(1, maxQty || 1), reason: reasonOptions[0], description: '' };
      return next;
    });
  };

  const updateItem = (key: string, updater: (curr: { quantity: number; reason: string; description: string }) => { quantity: number; reason: string; description: string }) => {
    setSelectedItems((prev) => {
      if (!prev[key]) return prev;
      return { ...prev, [key]: updater(prev[key]) };
    });
  };

  const buildKey = (product: any) => {
    const productId = product?.productId?._id || product?.productId || product?.product?._id || product?._id;
    const variantId = product?.variantId?._id || product?.variantId || product?.variant?._id || '';
    return `${productId || ''}|${variantId}`;
  };

  const formatCurrency = (val: number) => `₹${Number(val || 0).toFixed(0)}`;
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const onSubmit = async () => {
    if (!deliveredState.isDelivered) {
      Alert.alert('Return unavailable', 'Return is available after delivery.');
      return;
    }

    if (!deliveredState.windowOpen && !deliveredState.isReturnRequested) {
      Alert.alert('Return unavailable', 'Return window is closed for this order.');
      return;
    }

    const entries = Object.entries(selectedItems);
    if (!entries.length) {
      Alert.alert('Select items', 'Please select at least one item to return.');
      return;
    }

    const payloadProducts = entries.map(([key, data]) => {
      const [productId, variantId] = key.split('|');
      return {
        productId,
        variantId: variantId || undefined,
        quantity: data.quantity,
        reason: data.reason,
        description: data.description,
        images: [],
      };
    });

    setSubmitting(true);
    try {
      const res = await ApiService.createReturnRequest(orderId, {
        products: payloadProducts,
      });
      const message = res?.data?.message || 'Return request created successfully.';
      Alert.alert('Success', message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Unable to create return request. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const bill = order?.billSummary || order?.bill || order?.pricing || {};
  const itemTotal =
    Number(order?.itemTotal) ||
    Number(order?.itemsTotal) ||
    Number(order?.subtotal) ||
    Number(bill.itemTotal) ||
    products.reduce((sum: number, p: any) => sum + Number(p.price || p.amount || p.total || 0), 0);
  const deliveryCharge =
    Number(order?.deliveryFee) ||
    Number(order?.deliveryCharge) ||
    Number(order?.deliveryCharges) ||
    Number(order?.delivery_amount) ||
    Number(bill.deliveryFee || bill.deliveryCharge || bill.deliveryCharges) ||
    0;
  const handlingCharge =
    Number(order?.handlingCharge) ||
    Number(order?.handling_fee) ||
    Number(order?.handlingCharges) ||
    Number(bill.handlingCharge || bill.handlingCharges || bill.handlingFee) ||
    0;
  const totalAmount = order?.totalAmount || order?.amount || order?.total || itemTotal + deliveryCharge + handlingCharge;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <TextView style={{ color: Colors.PRIMARY[300], fontWeight: '700' }}>{'<'}</TextView>
        </TouchableOpacity>
        <TextView style={styles.headerTitle}>Return</TextView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <TextView style={styles.sectionTitle}>{products.length} Items in order</TextView>
          {products.map((product: any, idx: number) => {
            const key = buildKey(product);
            const selected = Boolean(selectedItems[key]);
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
            const isAbsolute = typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'));
            const source = img ? { uri: isAbsolute ? img : ApiService.getImage(img) } : require('../../../../assets/images/order.png');
            const price = Number(product.price || product.amount || productObj?.price || 0);
            const mrp = Number(product.mrp || productObj?.mrp || price);
            const maxQty = product.quantity || 1;
            const variantText = variantObj?.title || variantObj?.name || variantObj?.weight || variantObj?.size || '500gm';
            return (
              <View key={`${orderId}-${idx}`} style={styles.productRow}>
                <TouchableOpacity style={styles.checkbox} onPress={() => toggleSelect(key, maxQty)}>
                  {selected && <View style={styles.checkboxFill} />}
                </TouchableOpacity>
                <Image source={source} style={styles.productImg} />
                <View style={styles.productInfo}>
                  <TextView style={styles.productName} numberOfLines={2}>
                    {productObj?.name || 'Item'}
                  </TextView>
                  <TextView style={styles.variantText}>
                    {variantText} X {maxQty} Unit
                  </TextView>
                  <View style={styles.priceRow}>
                    <TextView style={styles.price}>{formatCurrency(price)}</TextView>
                    {mrp > price ? <TextView style={styles.oldPrice}>{formatCurrency(mrp)}</TextView> : null}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <TextView style={styles.sectionTitle}>Bill Summary</TextView>
          <View style={styles.billRow}>
            <TextView style={{ color: '#000' }}>Item total & GST</TextView>
            <TextView style={{ color: '#000' }}>{formatCurrency(itemTotal)}</TextView>
          </View>
          <View style={styles.billRow}>
            <TextView style={{ color: '#000' }}>Delivery Fee</TextView>
            <TextView style={{ color: '#000' }}>{formatCurrency(deliveryCharge)}</TextView>
          </View>
          <View style={styles.billRow}>
            <TextView style={{ color: '#000' }}>Handling Charge</TextView>
            <TextView style={{ color: '#000' }}>{formatCurrency(handlingCharge)}</TextView>
          </View>
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <TextView style={{ fontWeight: '700', color: '#000' }}>Total Bill</TextView>
            <TextView style={{ fontWeight: '700', color: '#000' }}>{formatCurrency(totalAmount)}</TextView>
          </View>
        </View>

        <View style={styles.section}>
          <TextView style={styles.sectionTitle}>Order Details</TextView>
          <TextView style={styles.tinyLabel}>Order ID</TextView>
          <TextView style={{ color: '#000', marginBottom: 8 }}>#{order?._id || orderId}</TextView>
          <TextView style={styles.tinyLabel}>Delivery Address</TextView>
          <TextView style={{ color: '#000', marginBottom: 8 }}>{deliveryAddress}</TextView>
          <TextView style={styles.tinyLabel}>Order Placed</TextView>
          <TextView style={{ color: '#000', marginBottom: 8 }}>{formatDate(order?.createdAt || order?.orderDate)}</TextView>
          <TextView style={styles.tinyLabel}>Order Delivered on</TextView>
          <TextView style={{ color: '#000' }}>
            {formatDate(
              order?.deliveredAt ||
              order?.delivered_on ||
              order?.deliveryDate ||
              order?.completedAt ||
              order?.updatedAt
            )}
          </TextView>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={onSubmit}
          disabled={
            submitting ||
            !deliveredState.isDelivered ||
            (!deliveredState.windowOpen && !deliveredState.isReturnRequested)
          }
          style={[
            styles.primaryBtn,
            (!deliveredState.isDelivered || (!deliveredState.windowOpen && !deliveredState.isReturnRequested))
              ? styles.disabledBtn
              : null,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <TextView style={styles.btnText}>Return</TextView>
          )}
        </TouchableOpacity>
      </View>

      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.6)',
          }}
        >
          <ActivityIndicator size="large" color={Colors.PRIMARY[100]} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ReturnOrder;

