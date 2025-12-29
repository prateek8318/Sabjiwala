import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, FlatList, Pressable, ActivityIndicator, RefreshControl, Modal, Vibration } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useFavorites } from '../../../context/FavoritesContext';
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
  const { refreshFavorites } = useFavorites();
  const [isLoading, setIsLoading] = useState(true);
  
  // Refresh favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshFavorites();
      loadFavorites();
    }, [])
  );
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingProducts, setUpdatingProducts] = useState<{ [key: string]: boolean }>({});
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [updatingFavorites, setUpdatingFavorites] = useState<{ [key: string]: boolean }>({});
  const [cartMap, setCartMap] = useState<{ [key: string]: number }>({});
  const [cartVariantMap, setCartVariantMap] = useState<{ [key: string]: { variantId?: string; variantData?: any; quantity: number } }>({});
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({});
  const [showVariantOptions, setShowVariantOptions] = useState<{ [key: string]: boolean }>({});
  const [productVariants, setProductVariants] = useState<{ [key: string]: any[] }>({});

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, []);

  // Load favorites
  const loadFavorites = async () => {
    try {
      setIsLoading(true);
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
        const transformedProducts = await Promise.all(items.map(async (item: any) => {
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
        const validProducts = transformedProducts.filter(Boolean);

        console.log('Final products array:', validProducts);
        console.log('Products count:', validProducts.length);

        setFavoriteProducts(validProducts);
        setWishlist(new Set(validProducts.map(p => p.id)));
        setRefreshing(false);
        setIsLoading(false);
        return;
      }

      // Transform function similar to dashboard
      const transformProduct = (product: any, productId: string) => {
        const variant = product.ProductVarient?.[0] || product.variants?.[0];
        const imagePath = variant?.images?.[0] || product.primary_image?.[0] || product.images?.[0] || '';


        const cleanPath = imagePath
          .replace(/\\/g, '/')
          .replace(/^\//, '');

        const finalUrl = imagePath ? `${IMAGE_BASE_URL}${cleanPath}` : '';
        console.log('Favorites Image → id:', productId, '| name:', product?.name || product?.productName, '| raw:', imagePath, '| final:', finalUrl);

        // Normalize weight so it never renders empty on larger screens
        const weightValue =
          variant?.weight ??
          product?.weight ??
          variant?.stock ??
          product?.stock ??
          1;
        const unitValue = variant?.unit ?? product?.unit ?? '';

        return {
          id: product._id || product.id || productId,
          productId: productId,
          name: product.productName || product.name || 'Unknown Product',
          image: finalUrl,
          price: variant?.price || product.price || 0,
          oldPrice: variant?.originalPrice || product.mrp || product.oldPrice || 0,
          discount: variant?.discount ? `₹${variant.discount} OFF` : '',
          weight: `${weightValue} ${unitValue}`.trim(),
          rating: product.rating || 4.7,
          ProductVarient: product.ProductVarient || product.variants || [],
          variants: product.variants || product.ProductVarient || [],
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
      setRefreshing(false);
    }
  };


  // Load cart
  const loadCart = useCallback(async () => {
    try {
      const res = await ApiService.getCart();
      console.log('Cart API Response:', res);

      const map: { [key: string]: number } = {};
      const variantMap: { [key: string]: any } = {};

      // Handle different response structures
      const cartItems = res?.data?.cart?.products ||
        res?.data?.products ||
        res?.data?.items || [];

      console.log('Cart Items:', cartItems);

      cartItems.forEach((item: any) => {
        const pid = item?.productId?._id || item?.productId || item?._id || '';
        if (pid) {
          const variantId = item?.variantId?._id || item?.variantId;
          const quantity = Number(item.quantity) || 0;

          if (variantId) {
            // For products with variants
            variantMap[pid] = {
              variantId,
              variantData: item.variantId,
              quantity: quantity
            };
          } else {
            // For products without variants
            map[pid] = (map[pid] || 0) + quantity;
          }
        }
      });

      console.log('Cart Map:', map);
      console.log('Variant Map:', variantMap);

      setCartMap(map);
      setCartVariantMap(variantMap);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, []);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        await loadFavorites();
        await loadCart();
        await refreshFavorites();
      };
      loadData();
    }, [refreshFavorites])
  );

  // Toggle favorite - Remove from favorites
  const toggleWishlist = async (productId: string) => {
    const productIdStr = productId.toString();
    
    // Don't do anything if already processing
    if (updatingFavorites[productIdStr]) return;
    
    try {
      // Set loading state for this product
      setUpdatingFavorites(prev => ({ ...prev, [productIdStr]: true }));
      
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

      // Small delay before reloading to show feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload from server to ensure consistency
      await loadFavorites();
      // Refresh the favorites count in the tab bar
      await refreshFavorites();
    } catch (err: any) {
      console.log('=== DELETE ERROR ===');
      console.log('Error:', err);
      console.log('Error response:', err?.response?.data);
      console.log('Error message:', err?.message);

      // On error, reload to sync with server
      await loadFavorites();
    } finally {
      // Clear loading state
      setUpdatingFavorites(prev => {
        const newState = { ...prev };
        delete newState[productIdStr];
        return newState;
      });
    }
  };


  // Update cart qty
  const updateCartQty = async (productId: string, variantId: string, newQty: number) => {
    try {
      // Set loading state for this specific product
      setUpdatingProducts(prev => ({ ...prev, [productId]: true }));
      Vibration.vibrate(50);

      if (newQty < 0) return;

      // Update UI immediately for better UX
      const isVariant = variantId !== productId;
      if (isVariant) {
        setCartVariantMap(prev => ({
          ...prev,
          [productId]: {
            variantId,
            quantity: newQty,
            variantData: prev[productId]?.variantData
          }
        }));
      } else {
        setCartMap(prev => ({
          ...prev,
          [productId]: newQty
        }));
      }

      // Make API call
      if (newQty === 0) {
        await ApiService.removeCartItem(productId, isVariant ? variantId : undefined);
      } else {
        await ApiService.addToCart(
          productId,
          isVariant ? variantId : undefined,
          newQty.toString()
        );
      }

      // Refresh cart data in the background
      loadCart().catch(console.error);
    } catch (error) {
      console.error('Error updating cart:', error);
      setShowVariantOptions(prev => ({
        ...prev,
        [productId]: false
      }));
      return;
    }

    // If not showing, fetch variants and show
    try {
      const res = await ApiService.getProductVariants(productId);
      const variants = res?.data?.variants || [];

      setProductVariants(prev => ({
        ...prev,
        [productId]: variants
      }));

      setShowVariantOptions(prev => ({
        ...prev,
        [productId]: true
      }));
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (productId: string, change: number) => {
    setProductQuantities(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + change);

      // If quantity is 0, hide variant options
      if (newQty === 0 && showVariantOptions[productId]) {
        setShowVariantOptions(prev => ({
          ...prev,
          [productId]: false
        }));
      }

      return {
        ...prev,
        [productId]: newQty
      };
    });
  };

  // Add to cart function
  const addToCart = async (productId: string, variantId: string) => {
    try {
      const quantity = productQuantities[productId] || 1;
      await ApiService.addToCart(productId, variantId, quantity.toString());

      // Update cart map
      setCartMap(prev => ({
        ...prev,
        [productId]: (prev[productId] || 0) + quantity
      }));

      // Hide variant options after adding to cart
      setShowVariantOptions(prev => ({
        ...prev,
        [productId]: false
      }));

      // Reload cart to ensure sync
      await loadCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const renderProductItem = ({ item }: { item: any }) => {
    if (!item) {
      console.log('renderProductItem: item is null/undefined');
      return null;
    }

    const productId = (item.productId?.toString() || item.id?.toString());
    const isFavorite = wishlist.has(productId);

    // Get variants if available
    const variants = item.ProductVarient || item.variants || [];
    const hasVariants = variants.length > 0;

    // Get the first variant as default if available
    const variant = variants[0] || {};

    // Extract variant data with fallbacks
    const imageUrl = variant?.image || item.image || '';
    const productName = item.name || item.productName || 'Unknown Product';
    const price = variant?.price || item.price || 0;
    const oldPrice = variant?.oldPrice || item.oldPrice || 0;
    const discount = item.discount || (oldPrice > price ? `₹${Math.round(oldPrice - price)} OFF` : '');
    const weight = variant?.weight || variant?.stock || item.weight || 'N/A';
    const rating = item.rating || 4.7;
    const variantName = variant?.name || variant?.variantName || '';
    const variantUnit = variant?.unit || '';
    const variantDisplay = variantName && variantUnit ? `${variantName} ${variantUnit}` : variantName || '';

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
            style={[styles.imgHeart, { justifyContent: 'center', alignItems: 'center' }]}
            hitSlop={10}
            disabled={updatingFavorites[productId]}
          >
            {updatingFavorites[productId] ? (
              <ActivityIndicator size="small" color="#E53935" />
            ) : (
              <Icon
                name="heart"
                family="AntDesign"
                size={26}
                color="#E53935"
              />
            )}
          </Pressable>

          <View style={styles.imgTradeMarkView}>
            <Image source={Images.ic_trademark} style={styles.imgTradeMark} />
          </View>
        </View>

        {/* Price */}
        <View style={styles.cardProductPriceView}>
          <View style={styles.priceRow}>
            <TextView style={styles.cardProductPriceText}>₹{price}</TextView>
            {oldPrice > price && (
              <TextView style={styles.cardProductPriceDiscount}>₹{oldPrice}</TextView>
            )}
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
              <TextView style={styles.txtRating}>{Number(rating).toFixed(2)}</TextView>
            </View>
          </View>

          {/* Add Button or Variant Selector */}
          <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
            {cartMap[productId] > 0 || cartVariantMap[productId]?.quantity > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pressable
                  onPress={e => {
                    e.stopPropagation();
                    updateCartQty(productId, undefined, (cartMap[productId] || cartVariantMap[productId]?.quantity || 0) - 1);
                  }}
                  style={{
                    height: hp(3),
                    width: hp(3),
                    borderRadius: hp(3),
                    borderWidth: 1,
                    borderColor: '#000',
                    backgroundColor: '#fff',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: hp(2), color: '#000', fontWeight: '600', marginBottom: 2 }}>-</Text>
                </Pressable>

                <Text style={{ fontSize: hp(2), fontWeight: '600', color: '#000' }}>
                  {cartMap[productId] || cartVariantMap[productId]?.quantity || 0}
                </Text>

                <Pressable
                  onPress={e => {
                    e.stopPropagation();
                    updateCartQty(productId, undefined, (cartMap[productId] || cartVariantMap[productId]?.quantity || 0) + 1);
                  }}
                  style={{
                    height: hp(3),
                    width: hp(3),
                    borderRadius: hp(3),
                    borderWidth: 1,
                    borderColor: '#000',
                    backgroundColor: '#fff',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: hp(2), color: '#000', fontWeight: '600' }}>+</Text>
                </Pressable>
              </View>
            ) : hasVariants ? (
              <Pressable
                onPress={e => {
                  e.stopPropagation();
                  setSelectedProduct(item);
                  setShowVariantModal(true);
                }}
              >
                <LinearGradient
                  colors={['#5A875C', '#015304']}
                  style={styles.addButtonView}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0 }}
                >
                  <TextView style={styles.txtAdd}>Add</TextView>
                </LinearGradient>
                <View style={styles.optionView}>
                  <TextView style={styles.txtOption}>{variants.length} Options</TextView>
                </View>
              </Pressable>
            ) : (
              <Pressable
                onPress={e => {
                  e.stopPropagation();
                  updateCartQty(productId, undefined, 1);
                }}
              >
                <LinearGradient
                  colors={['#5A875C', '#015304']}
                  style={styles.addProductButon}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0 }}
                >
                  <TextView style={styles.txtAdd}>Add</TextView>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    );
  };


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
        onShow={() => {
          const allVariants = [...(selectedProduct?.ProductVarient || []), ...(selectedProduct?.variants || [])];
          console.log('Variant Modal Opened');
          console.log('Selected Product:', selectedProduct?.name);
          console.log('Total Variants Count:', allVariants.length);
          console.log('Variants:', allVariants);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowVariantModal(false)} />

          <View style={{
            backgroundColor: '#fff',
            maxHeight: hp(80),
            paddingBottom: hp(4),
            paddingTop: hp(3),
            
            paddingHorizontal: 16,
          }}>
            {/* Close button */}
            <Pressable
              onPress={() => setShowVariantModal(false)}
              style={{ position: 'absolute', top: -hp(9.5), alignSelf: 'center' }}
            >
              <View style={{
                height: 46,
                width: 46,
                borderRadius: 23,
                backgroundColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: Colors.PRIMARY[200],
                elevation: 6,
              }}>
                <Icon name="close" family="AntDesign" size={20} color={Colors.PRIMARY[400]} />
              </View>
            </Pressable>

            {/* Variants list - no duplicates */}
            {Array.from(new Map([...(selectedProduct?.ProductVarient || []), ...(selectedProduct?.variants || [])]
              .map(v => [v._id, v])).values()).map((v: any, index, array) => {
                const variantImage = v.images?.[0]
                  ? `${IMAGE_BASE_URL}${v.images[0].replace(/\\/g, '/').replace(/^\//, '')}`
                  : selectedProduct?.image || '';

                return (
                  <View
                    key={v._id || index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      borderWidth: 1,
                      borderColor: '#DFF0D8',
                      borderRadius: 10,
                      marginBottom: index === array.length - 1 ? 0 : 12,
                      gap: 16,
                    }}
                  >
                    <Image source={{ uri: variantImage }} style={{ width: 60, height: 50, borderRadius: 8 }} />

                    <View style={{ flex: 1 }}>
                      <TextView style={{ color: '#000' }}>{selectedProduct?.name}</TextView>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                        <TextView style={{ color: '#000' }}>
                          {v.stock || v.weight} {v.unit || 'kg'}
                        </TextView>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <TextView style={{ color: '#000', fontWeight: '700' }}>₹{v.price}</TextView>
                          {v.originalPrice > v.price && (
                            <TextView style={{ color: '#000', textDecorationLine: 'line-through', marginLeft: 6 }}>
                              ₹{v.originalPrice}
                            </TextView>
                          )}
                        </View>
                      </View>
                    </View>

                    {(() => {
                      const productId = selectedProduct?.productId || selectedProduct?.id;
                      const currentQty = cartVariantMap[productId]?.variantId === v._id
                        ? cartVariantMap[productId]?.quantity || 0
                        : 0;

                      if (currentQty > 0) {
                        return (
                          <LinearGradient
                            colors={['#5A875C', '#015304']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              borderRadius: 20,
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              gap: 12,
                            }}
                          >
                            <Pressable onPress={() => updateCartQty(productId, v._id, currentQty - 1)}>
                              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>-</Text>
                            </Pressable>
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14, minWidth: 24, textAlign: 'center' }}>
                              {currentQty}
                            </Text>
                            <Pressable onPress={() => updateCartQty(productId, v._id, currentQty + 1)}>
                              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+</Text>
                            </Pressable>
                          </LinearGradient>
                        );
                      }

                      return (
                        <Pressable onPress={() => updateCartQty(productId, v._id, 1)}>
                          <LinearGradient
                            colors={['#5A875C', '#015304']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0 }}
                            style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 }}
                          >
                            <TextView style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Add</TextView>
                          </LinearGradient>
                        </Pressable>
                      );
                    })()}
                  </View>
                );
              })}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Favorites;
