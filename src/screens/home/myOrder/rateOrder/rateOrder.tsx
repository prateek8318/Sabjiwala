import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Modal,
  Animated,
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
  const [reviews, setReviews] = useState<{ [key: string]: string }>({});
  const [existingReviews, setExistingReviews] = useState<{ [key: string]: { rating: number; review: string } }>({});
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
    onPress: () => {},
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      let orderInfo: any = null;
      
      if (order) {
        orderInfo = order;
      } else {
        const res = await ApiService.getOrderDetails(orderId);
        if (res?.data?.success || res?.data?.order) {
          orderInfo = res.data.order || res.data;
        }
      }

      if (orderInfo) {
        setOrderData(orderInfo);
        // Fetch existing ratings for this order
        await fetchExistingRatings(orderInfo);
      }
    } catch (err) {
      console.log('Fetch order details error:', err);
      showStyledAlert('Error', 'Failed to load order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showStyledAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    onPress: () => void = () => {}
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      type,
      onPress,
    });
  };

  const hideAlert = () => {
    setAlertModal({ ...alertModal, visible: false });
  };

  const fetchExistingRatings = async (orderInfo: any) => {
    try {
      // Try to fetch existing ratings from API
      const ratingsRes = await ApiService.getOrderRatings(orderId);
      
      // Handle different response formats
      let ratingsData: any[] = [];
      if (ratingsRes?.data) {
        if (Array.isArray(ratingsRes.data)) {
          ratingsData = ratingsRes.data;
        } else if (Array.isArray(ratingsRes.data.ratings)) {
          ratingsData = ratingsRes.data.ratings;
        } else if (Array.isArray(ratingsRes.data.data)) {
          ratingsData = ratingsRes.data.data;
        } else if (ratingsRes.data.rating) {
          // Single rating object
          ratingsData = [ratingsRes.data.rating];
        }
      }
      
      // Create a map of productId -> rating data
      const ratingsMap: { [key: string]: { rating: number; review: string } } = {};
      ratingsData.forEach((ratingItem: any) => {
        const pid = ratingItem.productId?._id || ratingItem.productId || ratingItem.product?._id || ratingItem.product;
        if (pid) {
          ratingsMap[pid] = {
            rating: Number(ratingItem.rating) || 0,
            review: ratingItem.review || ratingItem.comment || ratingItem.text || '',
          };
        }
      });

      // Initialize ratings and reviews with fetched data
      initializeRatingsAndReviews(orderInfo, ratingsMap);
    } catch (err: any) {
      console.log('Fetch ratings error (using order data):', err?.response?.data || err?.message);
      // If API fails, fallback to order data
      initializeRatingsAndReviews(orderInfo);
    }
  };

  const initializeRatingsAndReviews = (orderInfo: any, fetchedRatings?: { [key: string]: { rating: number; review: string } }) => {
    const items = orderInfo.items || orderInfo.products || [];
    const initialRatings: { [key: string]: number } = {};
    const initialReviews: { [key: string]: string } = {};
    const existing: { [key: string]: { rating: number; review: string } } = {};

    items.forEach((item: any) => {
      const itemId = item._id || item.productId?._id;
      const productId = item.productId?._id || item.productId || itemId;
      
      // Priority: fetchedRatings > item.rating/review > empty
      if (fetchedRatings && fetchedRatings[productId]) {
        // Use fetched ratings from API
        existing[productId] = fetchedRatings[productId];
        initialRatings[productId] = fetchedRatings[productId].rating;
        initialReviews[productId] = fetchedRatings[productId].review;
      } else if (item.rating && item.review) {
        // Fallback to order item data
        existing[productId] = {
          rating: item.rating,
          review: item.review,
        };
        initialRatings[productId] = item.rating;
        initialReviews[productId] = item.review;
      } else {
        // No existing rating
        initialRatings[productId] = 0;
        initialReviews[productId] = '';
      }
    });

    setRatings(initialRatings);
    setReviews(initialReviews);
    setExistingReviews(existing);
  };

  const handleRating = (productId: string, rating: number) => {
    setRatings({ ...ratings, [productId]: rating });
  };

  const handleReviewChange = (productId: string, review: string) => {
    setReviews({ ...reviews, [productId]: review });
  };

  const handleSubmit = async () => {
    const items = orderData?.items || orderData?.products || [];
    
    // Check if all items are rated
    const allRated = items.every((item: any) => {
      const productId = item.productId?._id || item.productId || item._id;
      return ratings[productId] > 0;
    });

    if (!allRated) {
      showStyledAlert('Rating Required', 'Please rate all items before submitting', 'error');
      return;
    }

    // Check if all items have reviews
    const allReviewed = items.every((item: any) => {
      const productId = item.productId?._id || item.productId || item._id;
      return reviews[productId]?.trim().length > 0;
    });

    if (!allReviewed) {
      showStyledAlert('Review Required', 'Please add a review for all items before submitting', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      // Send individual rating requests for each product
      const ratingPromises = items.map(async (item: any) => {
        const productId = item.productId?._id || item.productId || item._id;
        const rating = ratings[productId];
        const review = reviews[productId]?.trim() || '';

        const payload = {
          productId: productId,
          orderId: orderId,
          rating: rating,
          review: review,
        };

        return await ApiService.submitOrderRating(payload);
      });

      await Promise.all(ratingPromises);
      
      const successMessage = existingReviews && Object.keys(existingReviews).length > 0 
        ? 'Review updated successfully!' 
        : 'Thank you for your feedback!';
      
      showStyledAlert('Success', successMessage, 'success', () => {
        navigation.goBack();
      });
    } catch (err: any) {
      console.log('Submit rating error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to submit rating';
      showStyledAlert('Error', errorMessage, 'error');
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
        <Text style={styles.itemsCount}>
          {items.length} Item{items.length > 1 ? 's' : ''} In Order
          {Object.keys(existingReviews).length > 0 && ' • Edit Reviews'}
        </Text>

        {items.map((item: any) => {
          const product = item.productId || item.product || {};
          const variant = item.variantId || item.variant || {};
          const productId = item.productId?._id || item.productId || item._id;
          const currentRating = ratings[productId] || 0;
          const currentReview = reviews[productId] || '';
          const hasExistingReview = existingReviews[productId] !== undefined;

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
            <View key={productId} style={styles.productCard}>
              <Image source={imageSource} style={styles.productImage} />
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{product.name || 'Product'}</Text>
                  {hasExistingReview && (
                    <View style={styles.editBadge}>
                      <Text style={styles.editBadgeText}>Edit</Text>
                    </View>
                  )}
                </View>
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
                      onPress={() => handleRating(productId, star)}
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
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Write your review..."
                  placeholderTextColor="#999"
                  value={currentReview}
                  onChangeText={(text) => handleReviewChange(productId, text)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
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
            <Text style={styles.submitButtonText}>
              {Object.keys(existingReviews).length > 0 ? 'Update Reviews' : 'Submit Reviews'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Styled Alert Modal */}
      <Modal
        visible={alertModal.visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={hideAlert}
          style={styles.alertOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.alertContainer}
          >
            <View style={[
              styles.alertIconContainer,
              alertModal.type === 'success' && styles.alertIconSuccess,
              alertModal.type === 'error' && styles.alertIconError,
              alertModal.type === 'info' && styles.alertIconInfo,
            ]}>
              <Icon
                name={
                  alertModal.type === 'success' ? 'checkmark-circle' :
                  alertModal.type === 'error' ? 'close-circle' :
                  'information-circle'
                }
                size={48}
                color="#fff"
              />
            </View>
            <Text style={styles.alertTitle}>{alertModal.title}</Text>
            <Text style={styles.alertMessage}>{alertModal.message}</Text>
            <TouchableOpacity
              style={[
                styles.alertButton,
                alertModal.type === 'success' && styles.alertButtonSuccess,
                alertModal.type === 'error' && styles.alertButtonError,
                alertModal.type === 'info' && styles.alertButtonInfo,
              ]}
              onPress={() => {
                hideAlert();
                alertModal.onPress();
              }}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default RateOrder;
