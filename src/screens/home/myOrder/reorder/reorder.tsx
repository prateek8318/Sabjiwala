import React, { useState, useEffect } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ApiService from '../../../../service/apiService';
import styles from './reorder.styles';

const ITEMS_PER_PAGE = 10;

const Reorder = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { orderId, order } = route.params as { orderId: string; order?: any };

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      if (order) {
        setOrderData(order);
      } else {
        const res = await ApiService.getOrderDetails(orderId);
        if (res?.data?.success || res?.data?.order) {
          const orderInfo = res.data.order || res.data;
          setOrderData(orderInfo);
        }
      }
    } catch (err) {
      console.log('Fetch order details error:', err);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: any) => {
    const productId = item.productId?._id || item.productId || item._id;
    const variantId = item.variantId?._id || item.variantId;
    const quantity = item.quantity || 1;

    if (!productId || !variantId) {
      Alert.alert('Error', 'Product information is missing');
      return;
    }

    try {
      setAddingToCart({ ...addingToCart, [productId]: true });
      await ApiService.addToCart(productId, variantId, quantity.toString());
      Alert.alert('Success', 'Item added to cart!', [
        {
          text: 'Continue Shopping',
          style: 'cancel',
        },
        {
          text: 'Go to Cart',
          onPress: () => navigation.navigate('Cart'),
        },
      ]);
    } catch (err: any) {
      console.log('Add to cart error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to add item to cart';
      Alert.alert('Error', errorMessage);
    } finally {
      setAddingToCart({ ...addingToCart, [productId]: false });
    }
  };

  const handleAddAllToCart = async () => {
    const items = orderData?.items || orderData?.products || [];
    let successCount = 0;
    let failCount = 0;

    try {
      for (const item of items) {
        const productId = item.productId?._id || item.productId || item._id;
        const variantId = item.variantId?._id || item.variantId;
        const quantity = item.quantity || 1;

        if (productId && variantId) {
          try {
            await ApiService.addToCart(productId, variantId, quantity.toString());
            successCount++;
          } catch (err) {
            failCount++;
          }
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        Alert.alert(
          'Success',
          `${successCount} item(s) added to cart${failCount > 0 ? `, ${failCount} failed` : ''}`,
          [
            {
              text: 'Continue Shopping',
              style: 'cancel',
            },
            {
              text: 'Go to Cart',
              onPress: () => navigation.navigate('Cart'),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to add items to cart');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to add items to cart');
    }
  };

  const renderProduct = ({ item, index }: { item: any; index: number }) => {
    const product = item.productId || item.product || {};
    const variant = item.variantId || item.variant || {};
    const productId = item.productId?._id || item.productId || item._id;
    const isAdding = addingToCart[productId] || false;

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
      <View style={styles.productCard}>
        <Image source={imageSource} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name || 'Product'}
          </Text>
          <Text style={styles.productQuantity}>
            {weight} {unit} X {quantity} Unit
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{price}</Text>
            {mrp > price && (
              <Text style={styles.mrp}>₹{mrp}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => handleAddToCart(item)}
            disabled={isAdding}
            style={isAdding && styles.addButtonDisabled}
          >
            <LinearGradient
              colors={['#5A875C', '#015304']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0 }}
              style={styles.addButton}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Add to Cart</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    const items = orderData?.items || orderData?.products || [];
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = items.slice(startIndex, endIndex);

    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
        >
          <Icon name="chevron-back" size={20} color={currentPage === 1 ? '#ccc' : '#000'} />
        </TouchableOpacity>

        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages}
        </Text>

        <TouchableOpacity
          onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
        >
          <Icon name="chevron-forward" size={20} color={currentPage === totalPages ? '#ccc' : '#000'} />
        </TouchableOpacity>
      </View>
    );
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
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, endIndex);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reorder</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Add All Button */}
      {items.length > 0 && (
        <View style={styles.addAllContainer}>
          <TouchableOpacity onPress={handleAddAllToCart} style={styles.addAllButton}>
            <Icon name="cart" size={20} color="#fff" />
            <Text style={styles.addAllButtonText}>Add All to Cart</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Product List */}
      <FlatList
        data={paginatedItems}
        renderItem={renderProduct}
        keyExtractor={(item, index) => {
          const productId = item.productId?._id || item.productId || item._id || index.toString();
          return productId.toString();
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />

      {/* Pagination */}
      {renderPagination()}
    </SafeAreaView>
  );
};

export default Reorder;
