import {
  ActivityIndicator,
  TouchableOpacity,
  TextStyle,
  View,
  ViewStyle,
  FlatList,
  Image,
  Text,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import { FC, useRef } from 'react';
import _ from 'lodash';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';
import styles from './productCard.styles';
import { Colors, Icon, Images, Typography } from '../../../../../constant';
import { TextView } from '../../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import ApiService, { IMAGE_BASE_URL } from '../../../../../service/apiService';
import { useFavorites } from '../../../../../context/FavoritesContext';
interface ProductCardProps {
  cardArray?: any;
  type?: string;
  horizontal?: boolean;
  numOfColumn?: number;
  onProductAdded?: (product: any) => void;
}

// 🔹 Small image carousel component – shows up to 2 images with auto fade
const ProductImageCarousel: FC<{ images?: string[]; fallbackImage?: string }> = ({
  images,
  fallbackImage,
}) => {
  const validImages = (images && images.length > 0 ? images : []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!validImages.length) {
      return;
    }

    const maxImages = Math.min(validImages.length, 3); // sirf 2 image auto carousel

    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0.6,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setIndex(prev => (prev + 1) % maxImages);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [fadeAnim, validImages.length]);

  const currentUri =
    validImages[index] ||
    validImages[0] ||
    fallbackImage ||
    '';

  if (!currentUri) {
    return <View style={styles.cardProductImage} />;
  }

  return (
    <Animated.Image
      source={{ uri: currentUri }}
      style={[styles.cardProductImage, { opacity: fadeAnim }]}
      resizeMode="cover"
    />
  );
};

const ProductCard: FC<ProductCardProps> = ({
  cardArray,
  type,
  horizontal,
  numOfColumn,
  onProductAdded,
}) => {
  const navigation = useNavigation<any>();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [cartMap, setCartMap] = useState<{ [key: string]: number }>({});
  // Store variant info for each product in cart: productId -> { variantId, variantData, quantity }
  const [cartVariantMap, setCartVariantMap] = useState<{ [key: string]: { variantId?: string; variantData?: any; quantity: number } }>({});
  // Wishlist is the single source of truth for favorites

  const buildImageUrl = (path?: string) => {
    if (!path) return '';
    if (typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    const clean = path.replace(/\\/g, '/');
    const normalized = clean.startsWith('/') ? clean.slice(1) : clean;
    return `${IMAGE_BASE_URL}${normalized}`;
  };

  // Load cart function
  const loadCart = useCallback(async () => {
    try {
      const res = await ApiService.getCart();
      const map: any = {};
      const variantMap: any = {};

      const cartItems =
        res?.data?.cart?.products ||
        res?.data?.products ||
        res?.data?.items ||
        [];

      cartItems.forEach((i: any) => {
        const pid =
          i?.productId?._id ||
          i?.productId ||
          i?._id ||
          i?.id ||
          '';
        if (pid) {
          map[pid.toString()] = i.quantity || 0;
          // Store variant info - variantId can be object with _id or just string
          const variantIdObj = i?.variantId;
          const variantId = variantIdObj?._id || variantIdObj || undefined;
          // variantData should be the full variant object if available
          const variantData = variantIdObj && typeof variantIdObj === 'object' ? variantIdObj : undefined;
          variantMap[pid.toString()] = {
            variantId: variantId,
            variantData: variantData,
            quantity: i.quantity || 0,
          };
        }
      });

      setCartMap(map);
      setCartVariantMap(variantMap);
    } catch (e) {
      console.log('loadCart error:', e);
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Reload cart when screen comes into focus (e.g., when returning from cart screen)
  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

  const extractWishlistIds = useCallback((items: any[] = []) => {
    return items
      .map((i: any) =>
        (
          i?.productId?._id ||
          i?.productId ||
          i?.product?.id ||
          i?.product?._id ||
          i?._id ||
          i?.id
        )?.toString(),
      )
      .filter(Boolean);
  }, []);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const res = await ApiService.getWishlist();
        console.log('Dashboard ProductCard - Wishlist response:', res?.data);

        // Handle different response structures (keep in sync with Favorites screen)
        let items: any[] = [];
        if (res?.data?.wishlist?.items && Array.isArray(res.data.wishlist.items)) {
          // Case: res.data.wishlist.items (array)
          items = res.data.wishlist.items;
        } else if (res?.data?.wishlist && Array.isArray(res.data.wishlist)) {
          // Case: res.data.wishlist is array directly
          items = res.data.wishlist;
        } else if (res?.data?.wishlist?.products && Array.isArray(res.data.wishlist.products)) {
          // Case: res.data.wishlist.products
          items = res.data.wishlist.products;
        } else if (res?.data?.data?.items && Array.isArray(res.data.data.items)) {
          items = res.data.data.items;
        } else if (res?.data?.items && Array.isArray(res.data.items)) {
          items = res.data.items;
        } else if (Array.isArray(res?.data)) {
          items = res.data;
        }

        const ids = extractWishlistIds(items);
        console.log('Dashboard ProductCard - Loaded wishlist IDs:', ids);
        setWishlist(new Set(ids));
      } catch (e) {
        console.log("wishlist load error", e);
      }
    };
    loadWishlist();
  }, [extractWishlistIds]);

  // Get the FavoritesContext
  const { refreshFavorites } = useFavorites();

  // Toggle favorite
  const toggleWishlist = async (productId: string) => {
    try {
      const productIdStr = productId.toString();
      console.log('Toggle wishlist - productId:', productIdStr);

      const newList = new Set(wishlist);
      const isFavorite = newList.has(productIdStr);
      let success = false;

      if (isFavorite) {
        // remove - delete from wishlist
        console.log('Removing from wishlist...');
        await ApiService.deleteWishlist(productIdStr);
        newList.delete(productIdStr);
        success = true;
      } else {
        // add - add to wishlist
        console.log('Adding to wishlist...');
        await ApiService.addToWishlist(productIdStr);
        newList.add(productIdStr);
        success = true;
      }

      // Update local state
      setWishlist(newList);
      
      // Refresh the favorites count in the bottom tab
      if (success) {
        await refreshFavorites();
      }

    } catch (err) {
      console.log("wishlist toggle error", err);
      // On error, reload wishlist to sync with server
      try {
        const res = await ApiService.getWishlist();
        let items: any[] = [];
        if (res?.data?.wishlist?.items && Array.isArray(res.data.wishlist.items)) {
          items = res.data.wishlist.items;
        } else if (res?.data?.wishlist && Array.isArray(res.data.wishlist)) {
          items = res.data.wishlist;
        } else if (res?.data?.wishlist?.products && Array.isArray(res.data.wishlist.products)) {
          items = res.data.wishlist.products;
        } else if (res?.data?.data?.items && Array.isArray(res.data.data.items)) {
          items = res.data.data.items;
        } else if (res?.data?.items && Array.isArray(res.data.items)) {
          items = res.data.items;
        } else if (Array.isArray(res?.data)) {
          items = res.data;
        }
        const ids = extractWishlistIds(items);
        setWishlist(new Set(ids));
        // Refresh favorites count even on error to ensure sync
        await refreshFavorites();
      } catch (e) {
        console.log("Error reloading wishlist", e);
      }
    }
  };

  // Update cart qty
 const updateCartQty = async (
  productId: string,
  variantId: string | undefined,
  qty: number,
  productItem?: any,
) => {
  try {
    const pid = productId?.toString();
    if (!pid) {
      console.log('updateCartQty: No productId provided');
      return;
    }
    const vid = variantId ? variantId.toString() : undefined;

    if (qty > 0) {
      // Optimistic add/update
      setCartMap(prev => ({ ...prev, [pid]: qty }));

      if (vid && productItem) {
        const variantData = [...(productItem?.ProductVarient || []), ...(productItem?.variants || [])].find(
          (v: any) => v._id === vid
        );
        if (variantData) {
          setCartVariantMap(prev => ({
            ...prev,
            [pid]: { variantId: vid, variantData, quantity: qty },
          }));
        }
      } else if (!vid && productItem) {
        setCartVariantMap(prev => ({
          ...prev,
          [pid]: { variantId: undefined, variantData: undefined, quantity: qty },
        }));
      }

      // Notify parent only when adding first item (qty === 1)
      if (onProductAdded && productItem && qty === 1) {
        onProductAdded(productItem);
      }

      // API call
      ApiService.addToCart(pid, vid, qty.toString())
        .then(() => loadCart())
        .catch(() => loadCart());
    } else {
      // Optimistic remove
      setCartMap(prev => {
        const next = { ...prev };
        delete next[pid];
        return next;
      });
      setCartVariantMap(prev => {
        const next = { ...prev };
        delete next[pid];
        return next;
      });

      // Notify parent that product was removed
      if (onProductAdded && productItem) {
        onProductAdded({ ...productItem, removed: true });
      }

      // API call
      ApiService.removeCartItem(pid, vid)
        .then(() => loadCart())
        .catch(() => loadCart());
    }
  } catch (e) {
    console.log('updateCartQty error:', e);
  }
};

  const getProductId = useCallback(
    (item: any) =>
      (
        item?.id ??
        item?._id ??
        item?.productId?._id ??
        item?.productId
      )?.toString(),
    [],
  );

  const renderProductItem = ({ item }: { item: any }) => {
    const productId = getProductId(item);
    const isFavorite = productId ? wishlist.has(productId) : false;
    const cartQty = productId ? cartMap[productId] || 0 : 0;
    // Get cart variant info if product is in cart
    const cartVariantInfo = productId ? cartVariantMap[productId] : undefined;

    // 👉 Variant logic: agar 0 variants hai to simple ADD button,
    // warna option button (modal open karega)
    const hasVariants =
      (item?.variants && item.variants.length > 0) ||
      (item?.ProductVarient && item.ProductVarient.length > 0);

    // Get selected variant from cart, or use first variant, or undefined
    const selectedVariant = cartVariantInfo?.variantId
      ? [...(item?.ProductVarient || []), ...(item?.variants || [])].find(
        (v: any) => v._id === cartVariantInfo.variantId
      )
      : undefined;

    // For products without variants, variantId should be undefined
    const firstVariantId = hasVariants
      ? (selectedVariant?._id ||
        item?.variantId ||
        item?.ProductVarient?.[0]?._id ||
        item?.variants?.[0]?._id ||
        undefined)
      : undefined;

    // Use selected variant data if in cart, otherwise use default
    const displayVariant = selectedVariant || item?.ProductVarient?.[0] || item?.variants?.[0] || {};

    // Display price from selected variant if in cart, otherwise from item
    // cartVariantInfo?.variantData can have price/mrp directly, or we need to use selectedVariant
    const displayPrice = cartVariantInfo?.variantData?.price
      || selectedVariant?.price
      || item?.price
      || 0;
    const displayOldPrice = cartVariantInfo?.variantData?.originalPrice
      || cartVariantInfo?.variantData?.mrp
      || selectedVariant?.originalPrice
      || selectedVariant?.mrp
      || item?.oldPrice
      || 0;

    // Calculate discount - format it properly as "₹X OFF"
    const calculateDiscount = () => {
      // First check if discount is already formatted (contains "OFF" or "₹")
      const variantDiscount = selectedVariant?.discount || cartVariantInfo?.variantData?.discount;
      if (variantDiscount) {
        // If it's already a string with "OFF" or "₹", return as is
        if (typeof variantDiscount === 'string' && (variantDiscount.includes('OFF') || variantDiscount.includes('₹'))) {
          return variantDiscount;
        }
        // If it's a number, format it
        if (typeof variantDiscount === 'number' || !isNaN(Number(variantDiscount))) {
          return `₹${variantDiscount} OFF`;
        }
        return variantDiscount;
      }

      // Check item discount
      if (item?.discount) {
        if (typeof item.discount === 'string' && (item.discount.includes('OFF') || item.discount.includes('₹'))) {
          return item.discount;
        }
        if (typeof item.discount === 'number' || !isNaN(Number(item.discount))) {
          return `₹${item.discount} OFF`;
        }
        return item.discount;
      }

      // Calculate discount from price difference
      if (displayOldPrice > displayPrice) {
        const discountAmount = Math.round(displayOldPrice - displayPrice);
        return discountAmount > 0 ? `₹${discountAmount} OFF` : '';
      }

      return '';
    };

    const displayDiscount = calculateDiscount();

    // Ensure weight always shows (even if API missed it for some cards)
    const weightText = (() => {
      // If variant is selected from cart, use that variant's weight
      if (selectedVariant) {
        const weightValue = selectedVariant?.weight ?? selectedVariant?.stock ?? item?.weight ?? 1;
        const unitValue = selectedVariant?.unit ?? item?.unit ?? 'kg';
        return `${weightValue} ${unitValue}`.trim();
      }

      // For products with variants, use the first variant's weight
      const variant = item?.ProductVarient?.[0] || item?.variants?.[0];
      if (variant) {
        const weightValue = variant?.weight ?? variant?.stock ?? item?.weight ?? 1;
        const unitValue = variant?.unit ?? item?.unit ?? 'kg';
        return `${weightValue} ${unitValue}`.trim();
      }

      // For products without variants, use the product's weight
      if (item?.weight || item?.stock) {
        return `${item.weight || item.stock} ${item.unit || 'kg'}`.trim();
      }

      // Default fallback
      return '1 kg';
    })();

    return (
      <Pressable
        style={styles.cardProduct}
        onPress={() =>
          navigation.navigate('ProductDetail', { productId })
        }
      >
        <View style={{ position: 'relative' }}>
          <ProductImageCarousel images={item.images} fallbackImage={item.image} />

          {type === 'LIMITED' && (
            <View style={styles.imgFlashView}>
              <Image source={Images.ic_flash} style={styles.imgFlash} />
            </View>
          )}

          {/* Favorite */}
          <Pressable
            onPress={e => {
              e.stopPropagation();
              if (!productId) return;
              console.log('Heart pressed for productId:', productId);
              console.log('Is in wishlist?', wishlist.has(productId));
              toggleWishlist(productId);
            }}
            style={styles.imgHeart}
            hitSlop={8}
          >
            <Icon
              name={wishlist.has(productId) ? 'heart' : 'hearto'}
              family="AntDesign"
              size={18}
              color={wishlist.has(productId) ? '#E53935' : '#888'}
            />
          </Pressable>


          <View style={styles.imgTradeMarkView}>
            <Image source={Images.ic_trademark} style={styles.imgTradeMark} />
          </View>
        </View>

        {/* ====== PRICE SECTION - FINAL CLEAN VERSION ====== */}
        <View style={styles.cardProductPriceView}>
          <View style={styles.priceMainRow}>
            <TextView style={styles.cardProductPriceText}>₹{displayPrice}</TextView>

            {(displayOldPrice > displayPrice || displayDiscount) && (
              <>
                {displayOldPrice > displayPrice && (
                  <TextView style={styles.cardProductPriceDiscount}>
                    ₹{displayOldPrice}
                  </TextView>
                )}
                {displayDiscount && (
                  <View style={styles.offerView}>
                    <TextView style={styles.offerTxt}>{displayDiscount}</TextView>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        <Text style={styles.txtProduct}>{item.name}</Text>

        <View style={styles.quantityView}>
          <View>
            <TextView style={{ ...Typography.BodyRegular13, fontSize: 12, fontWeight: '700' }}>
              {weightText}
            </TextView>
            <View style={styles.ratingView}>
              <Icon
                family="AntDesign"
                name="star"
                color={Colors.PRIMARY[400]}
                size={15}
              />
              <TextView style={styles.txtRating}>{Number(item.rating).toFixed(2)}</TextView>
            </View>
          </View>

          {/* ===== FIXED BLOCK START ===== */}
          {type === 'OFFER' ? (
            cartQty > 0 ? (
              // ✅ If item is in cart, show quantity controls
              <View style={{ marginTop: 8, alignItems: 'flex-end', borderRadius: 12, borderColor: "#F5F5F5" }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {/* --- Minus Button --- */}
                  <Pressable
                    onPress={e => {
                      e.stopPropagation();
                      const pid = getProductId(item);
                      if (!pid) return;
                      updateCartQty(
                        pid,
                        firstVariantId,
                        cartQty - 1,
                        item,
                      );
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
                      marginLeft: wp(2),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: hp(2),
                        color: '#000',
                        fontWeight: '600',
                        marginBottom: 2,
                      }}
                    >
                      -
                    </Text>
                  </Pressable>

                  {/* Quantity Text */}
                  <Text
                    style={{
                      fontSize: hp(2),
                      fontWeight: '600',
                      color: '#000',
                      minWidth: wp(2),
                      textAlign: 'center',
                    }}
                  >
                    {cartQty}
                  </Text>

                  {/* --- Plus Button --- */}
                  <Pressable
                    onPress={e => {
                      e.stopPropagation();
                      const pid = getProductId(item);
                      if (!pid) return;
                      updateCartQty(
                        pid,
                        firstVariantId,
                        cartQty + 1,
                        item,
                      );
                    }}
                    style={{
                      height: hp(3),
                      width: hp(3),
                      marginRight: hp(1),
                      borderRadius: hp(3),
                      borderWidth: 1,
                      borderColor: '#000',
                      backgroundColor: '#fff',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: hp(2),
                        color: '#000',
                        fontWeight: '600',
                        marginBottom: 1,
                      }}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : hasVariants ? (
              // ✅ Jisme variant hoga → upar ADD (half width), niche OPTIONS
              <View>
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
                </Pressable>

                <Pressable
                  onPress={e => {
                    e.stopPropagation();
                    setSelectedProduct(item);
                    setShowVariantModal(true);
                  }}
                  style={styles.optionView}
                >
                  <TextView style={styles.txtOption}>{item.options}</TextView>
                </Pressable>
              </View>
            ) : (
              // ✅ Jisme 0 variants honge → sirf Add button (style: addProductButon)
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  if (!productId) {
                    console.log('No productId found');
                    return;
                  }
                  console.log('Add button clicked - productId:', productId, 'variantId:', firstVariantId);
                  // Call without await for instant response
                  updateCartQty(productId, firstVariantId, 1, item).catch((error) => {
                    console.log('Error adding to cart:', error);
                  });
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
            )
          ) : (
            <View style={{ marginTop: 8, alignItems: 'flex-end', borderRadius: 12, borderColor: "#F5F5F5" }}>
              {cartQty > 0 ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {/* --- Minus Button --- */}
                  <Pressable
                    onPress={e => {
                      e.stopPropagation();
                      const pid = getProductId(item);
                      if (!pid) return;
                      updateCartQty(
                        pid,
                        firstVariantId,
                        cartQty - 1,
                      );
                    }}
                    style={{
                      height: hp(3),      // Small height
                      width: hp(3),       // Same width
                      borderRadius: hp(3), // Fully round
                      borderWidth: 1,
                      borderColor: '#000',
                      backgroundColor: '#fff',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: wp(2),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: hp(2),
                        color: '#000',
                        fontWeight: '600',
                        marginBottom: 2, // perfect vertical balance
                      }}
                    >
                      -
                    </Text>
                  </Pressable>

                  {/* Quantity Text */}
                  <Text
                    style={{
                      fontSize: hp(2),
                      fontWeight: '600',
                      color: '#000',
                      minWidth: wp(2),
                      textAlign: 'center',
                    }}
                  >
                    {cartQty}
                  </Text>

                  {/* --- Plus Button --- */}
                  <Pressable
                    onPress={e => {
                      e.stopPropagation();
                      const pid = getProductId(item);
                      if (!pid) return;
                      updateCartQty(
                        pid,
                        firstVariantId,
                        cartQty + 1,
                        item,
                      );
                    }}
                    style={{
                      height: hp(3),
                      width: hp(3),
                      marginRight: hp(1),
                      borderRadius: hp(3),
                      borderWidth: 1,
                      borderColor: '#000',
                      backgroundColor: '#fff',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: hp(2),
                        color: '#000',
                        fontWeight: '600',
                        marginBottom: 1,
                      }}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>
              ) : (
                hasVariants ? (
                  // ✅ Jisme variant hoga → upar ADD (half width), niche OPTIONS (option button style)
                  <View>
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
                    </Pressable>

                    <Pressable
                      onPress={e => {
                        e.stopPropagation();
                        setSelectedProduct(item);
                        setShowVariantModal(true);
                      }}
                      style={styles.optionView}
                    >
                      <TextView style={styles.txtOption}>{item.options}</TextView>
                    </Pressable>
                  </View>
                ) : (
                  // ✅ Jisme 0 variants honge → sirf Add button
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      const pid = getProductId(item);
                      if (!pid) {
                        console.log('No productId found');
                        return;
                      }
                      console.log('Add button clicked - productId:', pid, 'variantId:', firstVariantId);
                      // Call without await for instant response
                      updateCartQty(pid, firstVariantId, 1, item).catch((error) => {
                        console.log('Error adding to cart:', error);
                      });
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
                )
              )}
            </View>


          )}

        </View>
      </Pressable>
    );
  };

  const isGrid = !horizontal && (numOfColumn ?? 1) > 1;




  return (
    <View style={styles.listProduct}>
      {horizontal ? (
        // HORIZONTAL LIST
        <FlatList
          data={cardArray}
          renderItem={renderProductItem}
          keyExtractor={(item) => (item?.id ?? item?._id)?.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: wp(3), paddingVertical: hp(1) }}
          key="horizontal"
        />
      ) : (
        // GRID LIST (2 columns) – columnWrapperStyle supported only here
        <FlatList
          data={cardArray}
          renderItem={({ item }) => (
            <View style={{ width: '50%', paddingHorizontal: wp(1.5) }}>
              {renderProductItem({ item })}
            </View>
          )}
          keyExtractor={(item) => (item?.id ?? item?._id)?.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: hp(3) }}
          showsVerticalScrollIndicator={false}
          key="grid-2"
        />
      )}
      <Modal
        visible={showVariantModal}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          {/* Backdrop tap to close */}
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setShowVariantModal(false)}
          />

          {/* Variant List + Close button (styled like Figma) */}
          <View
            style={{
              backgroundColor: '#fff',

              maxHeight: hp(80), // ← responsive max height
              paddingBottom: hp(4),
              paddingTop: hp(3),
              paddingHorizontal: 16,
            }}
          >
            {/* Floating Close button */}
            <Pressable
              onPress={() => setShowVariantModal(false)}
              style={{
                position: 'absolute',
                top: -hp(9.5),
                alignSelf: 'center',
              }}
            >
              <View
                style={{
                  height: 46,
                  width: 46,
                  borderRadius: 26,
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: Colors.PRIMARY[200],
                  elevation: 6,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.18,
                  shadowRadius: 4,
                }}
              >
                <Icon
                  name="close"
                  family="AntDesign"
                  size={20}
                  color={Colors.PRIMARY[400]}
                />
              </View>
            </Pressable>
            {[...(selectedProduct?.ProductVarient || []), ...(selectedProduct?.variants || [])].map((v: any, index: number) => {
              const firstVariantImage =
                Array.isArray(v?.images) && v.images.length > 0
                  ? buildImageUrl(v.images[0])
                  : '';
              const fallbackProductImage = selectedProduct?.image || '';
              const finalImageUri = firstVariantImage || fallbackProductImage;

              return (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#DFF0D8',
                    borderRadius: 10,
                    marginBottom:
                      index ===
                        ([...(selectedProduct?.ProductVarient || []), ...(selectedProduct?.variants || [])].length - 1)
                        ? 0
                        : 12,
                    gap: 16
                  }}
                >
                  {/* Product Image */}
                  <Image
                    source={finalImageUri ? { uri: finalImageUri } : undefined}
                    style={{ width: 60, height: 50, borderRadius: 8 }}
                  />

                  {/* Variant Info */}
                  <View style={{ flex: 1 }}>
                    <TextView style={{ color: '#000' }}>{selectedProduct.name}</TextView>

                    {/* Weight and Price in same row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                      <TextView style={{ color: '#000' }}>
                        {v.name || `${v.stock || ''} ${v.unit || ''}`.trim()}
                      </TextView>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextView style={{ color: '#000', fontWeight: '700' }}>₹{v.price}</TextView>
                        {v.originalPrice && (
                          <TextView
                            style={{
                              color: '#000',
                              textDecorationLine: 'line-through',
                              marginLeft: 6
                            }}
                          >
                            ₹{v.originalPrice}
                          </TextView>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Quantity Controls or Add Button */}
                  {(() => {
                    const pid = getProductId(selectedProduct);
                    const vid = v?._id;
                    const cartItem = pid ? cartVariantMap[pid] : null;
                    const isCurrentVariant = cartItem?.variantId === vid;
                    const quantity = isCurrentVariant ? cartItem.quantity : 0;

                    if (quantity > 0) {
                      return (
                        <LinearGradient
                          colors={['#5A875C', '#015304']}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            borderRadius: 20,
                            paddingHorizontal: 2,
                            paddingVertical: 4,
                            minWidth: 60,
                            justifyContent: 'space-between'
                          }}>
                          <Pressable
                            onPress={() => {
                              if (!pid) return;
                              updateCartQty(pid, vid, quantity - 1, selectedProduct);
                            }}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderWidth: 1,
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                            }}
                          >
                            <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>-</Text>
                          </Pressable>

                          <Text style={{ minWidth: 20, textAlign: 'center', fontWeight: '700', color: '#fff', fontSize: 14 }}>
                            {quantity}
                          </Text>

                          <Pressable
                            onPress={() => {
                              if (!pid) return;
                              updateCartQty(pid, vid, quantity + 1, selectedProduct);
                            }}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderWidth: 1,
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                            }}
                          >
                            <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>+</Text>
                          </Pressable>
                        </LinearGradient>
                      );
                    }

                    return (
                      <Pressable
                        onPress={async () => {
                          if (!pid) return;
                          // Optimistically update variant map
                          setCartVariantMap(prev => ({
                            ...prev,
                            [pid]: {
                              variantId: vid,
                              variantData: v,
                              quantity: 1,
                            },
                          }));
                          await updateCartQty(pid, vid, 1, selectedProduct);
                        }}
                      >
                        <LinearGradient
                          colors={['#5A875C', '#015304']}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderRadius: 20,
                            minWidth: 60,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                            Add
                          </Text>
                        </LinearGradient>
                      </Pressable>
                    );
                  })()}
                </View>
              )
            })}
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default ProductCard;
