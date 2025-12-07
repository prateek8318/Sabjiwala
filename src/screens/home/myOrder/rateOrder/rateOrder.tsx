import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ApiService from '../../../../service/apiService';
import styles from './rateOrder.styles';

const RateOrder = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { orderId, order } = route.params as { orderId: string; order?: any };

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      if (order) {
        setOrderData(order);
        // Initialize ratings with 0 for all items
        const items = order.items || order.products || [];
        const initialRatings: { [key: string]: number } = {};
        items.forEach((item: any) => {
          initialRatings[item._id || item.productId?._id] = 0;
        });
        setRatings(initialRatings);
      } else {
        const res = await ApiService.getOrderDetails(orderId);
        if (res?.data?.success || res?.data?.order) {
          const orderInfo = res.data.order || res.data;
          setOrderData(orderInfo);
          const items = orderInfo.items || orderInfo.products || [];
          const initialRatings: { [key: string]: number } = {};
          items.forEach((item: any) => {
            initialRatings[item._id || item.productId?._id] = 0;
          });
          setRatings(initialRatings);
        }
      }
    } catch (err) {
      console.log('Fetch order details error:', err);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (itemId: string, rating: number) => {
    setRatings({ ...ratings, [itemId]: rating });
  };

  const handleSubmit = async () => {
    // Check if all items are rated
    const items = orderData?.items || orderData?.products || [];
    const allRated = items.every((item: any) => {
      const itemId = item._id || item.productId?._id;
      return ratings[itemId] > 0;
    });

    if (!allRated) {
      Alert.alert('Error', 'Please rate all items before submitting');
      return;
    }

    try {
      setSubmitting(true);
      const ratingData = items.map((item: any) => {
        const itemId = item._id || item.productId?._id;
        return {
          productId: item.productId?._id || item.productId || itemId,
          variantId: item.variantId?._id || item.variantId,
          rating: ratings[itemId],
        };
      });

      await ApiService.submitOrderRating({ ratings: ratingData });
      Alert.alert('Success', 'Thank you for your feedback!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      console.log('Submit rating error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to submit rating';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  const items = orderData?.items || orderData?.products || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.itemsCount}>{items.length} Items In order</Text>

        {items.map((item: any) => {
          const product = item.productId || item.product || {};
          const variant = item.variantId || item.variant || {};
          const itemId = item._id || product._id;
          const currentRating = ratings[itemId] || 0;

          // Get product image
          const imageCandidates = [
            item.image,
            item.productImage,
            product.image,
            product.images?.[0],
            product.productImage,
            variant.image,
            variant.images?.[0],
          ].filter(Boolean);
          const img = imageCandidates[0];
          const isAbsolute = typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'));
          const imageSource = img
            ? { uri: isAbsolute ? img : ApiService.getImage(img) }
            : require('../../../../assets/images/order.png');

          // Get price
          const price = Number(item.price) || Number(variant.price) || Number(product.price) || 0;
          const mrp = Number(item.mrp) || Number(variant.mrp) || Number(product.mrp) || price;

          // Get weight/quantity
          const weight = variant.weight || variant.stock || variant.name || '1';
          const unit = variant.unit || 'kg';
          const quantity = item.quantity || 1;

          return (
            <View key={itemId} style={styles.productCard}>
              <Image source={imageSource} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name || 'Product'}</Text>
                <Text style={styles.productQuantity}>
                  {weight} {unit} X {quantity} Unit
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>₹{price}</Text>
                  {mrp > price && (
                    <Text style={styles.mrp}>₹{mrp}</Text>
                  )}
                </View>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => handleRating(itemId, star)}
                      style={styles.starButton}
                    >
                      <Icon
                        name={star <= currentRating ? 'star' : 'star-outline'}
                        size={24}
                        color={star <= currentRating ? '#FFD700' : '#ddd'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RateOrder;
