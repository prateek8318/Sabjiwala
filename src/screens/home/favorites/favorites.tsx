import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { TextView } from '../../../components';
import styles from './favorites.styles';
import {
  Colors,
  Icon,
  Images,
  Typography,
} from '../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../constant/dimentions';
import ApiService, { IMAGE_BASE_URL } from '../../../service/apiService';
import LinearGradient from 'react-native-linear-gradient';

const Favorites = () => {
  const navigation = useNavigation<any>();
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [cartMap, setCartMap] = useState<{ [key: string]: number }>({});
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Load favorites
  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getWishlist();
      console.log('=== WISHLIST API RESPONSE ===');
      console.log('Full response:', JSON.stringify(res, null, 2));
      console.log('res.data:', res?.data);
      console.log('res.data.wishlist:', res?.data?.wishlist);
      console.log('===========================');
      
      // Handle different response structures
      let items = [];
      
      // Check if items exist in different possible locations
      if (res?.data?.wishlist?.items && Array.isArray(res.data.wishlist.items)) {
        // Case: res.data.wishlist.items (array)
        items = res.data.wishlist.items;
        console.log('Found items in res.data.wishlist.items');
      } else if (res?.data?.wishlist && Array.isArray(res.data.wishlist)) {
        // Case: res.data.wishlist is array directly
        items = res.data.wishlist;
        console.log('Found items in res.data.wishlist (array)');
      } else if (res?.data?.wishlist?.products && Array.isArray(res.data.wishlist.products)) {
        // Case: res.data.wishlist.products
        items = res.data.wishlist.products;
        console.log('Found items in res.data.wishlist.products');
      } else if (res?.data?.data?.items) {
        items = res.data.data.items;
        console.log('Found items in res.data.data.items');
      } else if (res?.data?.items) {
        items = res.data.items;
        console.log('Found items in res.data.items');
      } else if (Array.isArray(res?.data)) {
        items = res.data;
        console.log('Found items in res.data (array)');
      }
      
      console.log('Extracted items:', items);
      console.log('Items count:', items.length);
      
      if (items.length === 0) {
        console.log('No items found in wishlist');
        setFavoriteProducts([]);
        setWishlist(new Set());
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Transform function similar to dashboard
      const transformProduct = (product: any, productId: string) => {
        const variant = product.ProductVarient?.[0] || product.variants?.[0];
        const imagePath = variant?.images?.[0] || product.primary_image?.[0] || product.images?.[0] || '';
        
        const cleanPath = imagePath
          .replace('public\\', '')
          .replace('public/', 'public/')
          .replace(/\\/g, '/');
        
        return {
          id: product._id || product.id || productId,
          productId: productId,
          name: product.productName || product.name || 'Unknown Product',
          image: imagePath ? IMAGE_BASE_URL + cleanPath : '',
          price: variant?.price || product.price || 0,
          oldPrice: variant?.originalPrice || product.mrp || product.oldPrice || 0,
          discount: variant?.discount ? `₹${variant.discount} OFF` : '',
          weight: variant ? `${variant.stock || 1} ${variant.unit || ''}` : 'N/A',
          rating: product.rating || 4.7,
         
        };
      };
      
      // Extract products from wishlist items
      const products = await Promise.all(items.map(async (item: any) => {
        console.log('Processing item:', item);
        
        let productData: any = null;
        let productId = item.productId?.toString() || item._id?.toString() || item.id?.toString();
        
        if (!productId) {
          console.log('No productId found in item:', item);
          return null;
        }
        
        // Case 1: Product details nested in item.product
        if (item.product && typeof item.product === 'object' && (item.product.productName || item.product.name)) {
          console.log('Using nested product data');
          productData = transformProduct(item.product, productId);
        }
        // Case 2: Product details directly in item
        else if (item.productName || item.name || item.primary_image || item.ProductVarient) {
          console.log('Using direct item data');
          productData = transformProduct(item, productId);
        }
        // Case 3: Only productId available, fetch product details from API
        else {
          try {
            console.log('Fetching product details for productId:', productId);
            const productRes = await ApiService.getProductDetail(productId);
            const product = productRes?.data?.productData || productRes?.data?.data || productRes?.data;
            
            if (product && (product.productName || product.name)) {
              console.log('Fetched product details:', product);
              productData = transformProduct(product, productId);
            } else {
              console.log('Invalid product data received:', product);
              return null;
            }
          } catch (fetchError) {
            console.log('Error fetching product details:', fetchError);
            return null;
          }
        }
        
        console.log('Final productData:', productData);
        return productData;
      }));
      
      // Filter out null/undefined items
      const validProducts = products.filter(Boolean);

      console.log('Final products array:', validProducts);
      console.log('Products count:', validProducts.length);
      
      setFavoriteProducts(validProducts);
      
      // Update wishlist set - use productId consistently
      const ids = validProducts.map((p: any) => {
        const pid = p?.productId?.toString() || p?.id?.toString();
        return pid;
      }).filter(Boolean);
      console.log('Wishlist IDs:', ids);
      setWishlist(new Set(ids));
    } catch (e) {
      console.log('Favorites load error:', e);
      console.log('Error details:', JSON.stringify(e, null, 2));
      setFavoriteProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // Load cart
  const loadCart = async () => {
    try {
      const res = await ApiService.getCart();
      const map: any = {};
      
      // Handle different cart response structures
      const cartItems = res?.data?.cart?.products || 
                       res?.data?.products || 
                       res?.data?.items || 
                       [];
      
      cartItems.forEach((i: any) => {
        // Handle different productId formats
        const productId = i.productId?._id || 
                         i.productId || 
                         i.productId?.toString() || 
                         '';
        if (productId) {
          map[productId] = i.quantity || 0;
        }
      });
      
      setCartMap(map);
    } catch (e) {
      console.log('Cart load error', e);
    }
  };

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
      loadCart();
    }, [])
  );

  // Toggle favorite - Remove from favorites
  const toggleWishlist = async (productId: string) => {
    try {
      const productIdStr = productId.toString();
      console.log('=== FAVORITES PAGE - DELETE ===');
      console.log('ProductId to delete:', productIdStr);
      console.log('Current wishlist before delete:', Array.from(wishlist));
      console.log('Current products count:', favoriteProducts.length);
      
      // Call delete API
      const deleteResponse = await ApiService.deleteWishlist(productIdStr);
      console.log('Delete API response:', deleteResponse?.data);
      
      // Remove from favorites list immediately (optimistic update)
      setFavoriteProducts(prev => {
        const filtered = prev.filter(p => {
          const pId = (p.productId?.toString() || p.id?.toString());
          const shouldKeep = pId !== productIdStr;
          if (!shouldKeep) {
            console.log('Removing product:', pId);
          }
          return shouldKeep;
        });
        console.log('Products after filter:', filtered.length);
        return filtered;
      });
      
      // Update wishlist set
      const newList = new Set(wishlist);
      newList.delete(productIdStr);
      setWishlist(newList);
      console.log('Wishlist after delete:', Array.from(newList));
      
      // Reload from server to ensure consistency
      setTimeout(async () => {
        console.log('Reloading favorites after delete...');
        await loadFavorites();
      }, 300);
    } catch (err: any) {
      console.log('=== DELETE ERROR ===');
      console.log('Error:', err);
      console.log('Error response:', err?.response?.data);
      console.log('Error message:', err?.message);
      
      // On error, reload to sync with server
      loadFavorites();
    }
  };


  // Update cart qty
  const updateCartQty = async (
    productId: string,
    variantId: string,
    qty: number,
  ) => {
    try {
      if (qty > 0) {
        await ApiService.addToCart(productId, variantId, qty.toString());
        // Update cart map optimistically
        setCartMap(prev => ({ ...prev, [productId]: qty }));
        // Reload cart from server to ensure sync
        await loadCart();
      } else {
        await ApiService.removeCartItem(productId, variantId);
        // Remove from cart map
        setCartMap(prev => {
          const newMap = { ...prev };
          delete newMap[productId];
          return newMap;
        });
        // Reload cart from server to ensure sync
        await loadCart();
      }
    } catch (e) {
      console.log('Cart update error', e);
      // Reload cart on error to sync with server
      await loadCart();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
    loadCart();
  };

  const renderProductItem = ({ item }: { item: any }) => {
    if (!item) {
      console.log('renderProductItem: item is null/undefined');
      return null;
    }
    
    const productId = (item.productId?.toString() || item.id?.toString());
    const isFavorite = wishlist.has(productId);
    
    // Use the transformed data directly
    const imageUrl = item.image || '';
    const productName = item.name || 'Unknown Product';
    const price = item.price || 0;
    const oldPrice = item.oldPrice || 0;
    const discount = item.discount || (oldPrice > price ? `₹${Math.round(oldPrice - price)} OFF` : '');
    const weight = item.weight || 'N/A';
    const rating = item.rating || 4.7;
    const options = item.options || '';
    
    console.log('Rendering product:', { productId, productName, imageUrl, price, oldPrice });

    return (
      <Pressable
        style={styles.cardProduct}
        onPress={() =>
          navigation.navigate('ProductDetail', { productId: item.id || item.productId })
        }
      >
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: imageUrl }} style={styles.cardProductImage} />

          {/* Favorite Heart - Always red on favorites page, tap to remove */}
          <Pressable
            onPress={e => {
              e.stopPropagation();
              console.log('Favorites page - Heart pressed for productId:', productId);
              toggleWishlist(productId);
            }}
            style={styles.imgHeart}
            hitSlop={10}
          >
            <Icon
              name="heart"
              family="AntDesign"
              size={26}
              color="#E53935"
            />
          </Pressable>

          <View style={styles.imgTradeMarkView}>
            <Image source={Images.ic_trademark} style={styles.imgTradeMark} />
          </View>
        </View>

        {/* Price */}
        <View style={styles.cardProductPriceView}>
          <View>
            <TextView style={styles.cardProductPriceText}>
              ₹{price}
              {oldPrice > price && (
                <TextView style={styles.cardProductPriceDiscount}>
                  {' '}₹{oldPrice}
                </TextView>
              )}
            </TextView>
          </View>
          {discount && (
            <View style={styles.offerView}>
              <TextView style={styles.offerTxt}>{discount}</TextView>
            </View>
          )}
        </View>

        <Text style={styles.txtProduct}>{productName}</Text>

        <View style={styles.quantityView}>
          <View>
            <TextView style={styles.txtWeight}>{weight}</TextView>
            <View style={styles.ratingView}>
              <Icon
                family="AntDesign"
                name="star"
                color={Colors.PRIMARY[400]}
                size={15}
              />
              <TextView style={styles.txtRating}>{rating}</TextView>
            </View>
          </View>

          {/* Add Button */}
          <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
            {cartMap[productId] > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {/* Minus Button */}
                <Pressable
                  onPress={e => {
                    e.stopPropagation();
                    updateCartQty(
                      productId,
                      item.ProductVarient?.[0]?._id || item.variants?.[0]?._id || productId,
                      cartMap[productId] - 1,
                    );
                  }}
                  style={styles.cartButton}
                >
                  <Text style={styles.cartButtonText}>-</Text>
                </Pressable>

                {/* Quantity Text */}
                <Text style={styles.quantityText}>{cartMap[productId]}</Text>

                {/* Plus Button */}
                <Pressable
                  onPress={e => {
                    e.stopPropagation();
                    updateCartQty(
                      productId,
                      item.ProductVarient?.[0]?._id || item.variants?.[0]?._id || productId,
                      cartMap[productId] + 1,
                    );
                  }}
                  style={[styles.cartButton, { marginRight: hp(1) }]}
                >
                  <Text style={styles.cartButtonText}>+</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={e => {
                  e.stopPropagation();
                  if (item?.ProductVarient?.length > 1 || item?.variants?.length > 1) {
                    setSelectedProduct(item);
                    setShowVariantModal(true);
                  } else {
                    updateCartQty(
                      productId,
                      item.ProductVarient?.[0]?._id || item.variants?.[0]?._id || productId,
                      1
                    );
                  }
                }}
              >
                <LinearGradient
                  colors={[Colors.PRIMARY[200], Colors.PRIMARY[100]]}
                  style={styles.addProductButon}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0 }}
                >
                  <TextView style={styles.txtAdd}>Add</TextView>
                </LinearGradient>
                {options && (
                  <View style={styles.optionView}>
                    <TextView style={styles.txtOption}>{options}</TextView>
                  </View>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY[200]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextView style={styles.headerTitle}>Favorites</TextView>
      </View>

      {favoriteProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="hearto" family="AntDesign" size={60} color={Colors.PRIMARY[400]} />
          <TextView style={styles.emptyText}>No favorites yet</TextView>
          <TextView style={styles.emptySubText}>
            Tap the heart icon on products to add them to favorites
          </TextView>
          <TextView style={[styles.emptySubText, { marginTop: hp(2), fontSize: 12 }]}>
            
          </TextView>
        </View>
      ) : (
        <FlatList
          data={favoriteProducts}
          renderItem={({ item, index }) => {
            console.log(`Rendering item ${index}:`, item);
            if (!item) return null;
            return (
              <View style={{ width: '50%', paddingHorizontal: wp(1.5) }}>
                {renderProductItem({ item })}
              </View>
            );
          }}
          keyExtractor={(item, index) => (item?.id?.toString() || item?.productId?.toString() || `item-${index}`)}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <TextView style={styles.emptyText}>No items to display</TextView>
            </View>
          }
        />
      )}

      {/* Variant Modal */}
      <Modal
        visible={showVariantModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <Pressable
            onPress={() => setShowVariantModal(false)}
            style={styles.modalCloseButton}
          >
            <View style={styles.modalCloseIcon}>
              <Icon name="close" family="AntDesign" size={18} color="green" />
            </View>
          </Pressable>

          <View style={styles.modalContent}>
            {selectedProduct?.ProductVarient?.map((v: any, index: number) => (
              <View key={index} style={styles.variantItem}>
                <Image
                  source={{ uri: selectedProduct?.image || selectedProduct?.primary_image?.[0] }}
                  style={styles.variantImage}
                />
                <View style={styles.variantInfo}>
                  <TextView style={styles.variantName}>
                    {selectedProduct.name || selectedProduct.productName}
                  </TextView>
                  <TextView style={styles.variantWeight}>
                    {v.stock} {v.unit}
                  </TextView>
                  <View style={styles.variantPriceRow}>
                    <TextView style={styles.variantPrice}>₹{v.price}</TextView>
                    {v.originalPrice && (
                      <TextView style={styles.variantOldPrice}>
                        ₹{v.originalPrice}
                      </TextView>
                    )}
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    const productId = selectedProduct.id?.toString() || selectedProduct.productId?.toString();
                    updateCartQty(productId, v._id, 1);
                    setShowVariantModal(false);
                  }}
                  style={styles.variantAddButton}
                >
                  <TextView style={styles.variantAddText}>Add</TextView>
                </Pressable>
              </View>
            ))}
            {selectedProduct?.variants?.map((v: any, index: number) => (
              <View key={index} style={styles.variantItem}>
                <Image
                  source={{ uri: selectedProduct?.image || selectedProduct?.primary_image?.[0] }}
                  style={styles.variantImage}
                />
                <View style={styles.variantInfo}>
                  <TextView style={styles.variantName}>
                    {selectedProduct.name || selectedProduct.productName}
                  </TextView>
                  <TextView style={styles.variantWeight}>
                    {v.stock} {v.unit}
                  </TextView>
                  <View style={styles.variantPriceRow}>
                    <TextView style={styles.variantPrice}>₹{v.price}</TextView>
                    {v.originalPrice && (
                      <TextView style={styles.variantOldPrice}>
                        ₹{v.originalPrice}
                      </TextView>
                    )}
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    const productId = selectedProduct.id?.toString() || selectedProduct.productId?.toString();
                    updateCartQty(productId, v._id, 1);
                    setShowVariantModal(false);
                  }}
                  style={styles.variantAddButton}
                >
                  <TextView style={styles.variantAddText}>Add</TextView>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Favorites;
