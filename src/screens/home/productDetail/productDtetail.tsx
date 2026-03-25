import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  ScrollView,
  Pressable,
  Text,
  FlatList,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../../constant/dimentions';
import { Colors, Fonts, Icon, Images } from '../../../constant';
import ApiService, { IMAGE_BASE_URL } from '../../../service/apiService';
import styles from './productDetail.styles';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackProps } from '../../../@types';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<HomeStackProps, 'ProductDetail'>;

const ProductDetail = () => {
  const route = useRoute();
  const { productId } = route.params as { productId: string };
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(0);
  const [qtyOptions, setQtyOptions] = useState<any[]>([]);
  const [cartQty, setCartQty] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({ highlights: true, info: true });
  const [updatingCart, setUpdatingCart] = useState(false);
  // Track loading states for individual operations
  const [operationLoading, setOperationLoading] = useState<{[key: string]: 'add' | 'remove' | null}>({});
  const carouselRef = useRef<FlatList<string> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await ApiService.getProductDetail(productId);
        if (res?.status === 200 && res.data?.success) {
          const productData = res.data.productData;
          setProduct(productData);

          const rawVariants =
            productData.variants?.length
              ? productData.variants
              : productData.ProductVarient || [];

          // If no variants, create a single default option so Add to Cart stays enabled
          const fallbackOption = {
            id: 0,
            label: `${productData.stock || 1} ${productData.unit || 'kg'}`,
            price: productData.price || productData.mrp || 0,
            mrp: productData.mrp || productData.price || 0,
            // No variantId for option-less products; send only productId to API
            variantId: undefined,
          };

          const options = rawVariants.length
            ? rawVariants.map((v: any, index: number) => ({
                id: index,
                // Use variant name primarily (e.g. "500g", "1kg", "packof2"),
                // fallback to weight + unit if name is missing
                label: v.name || `${v.weight || v.stock || 1} ${v.unit || 'kg'}`,
                price: v.price || 0,
                mrp: v.mrp || v.originalPrice || v.price || 0,
                variantId: v._id,
                images: Array.isArray(v.images) ? v.images : [],
              }))
            : [fallbackOption];

          setQtyOptions(options);
          if (options.length > 0) setSelectedQty(0); // Auto select first
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const loadCartQuantity = React.useCallback(
    async (variantIndex: number) => {
      try {
        if (!product) return;
        const pid = (
          product?._id ||
          product?.id ||
          productId
        )?.toString();
          const selected = qtyOptions[variantIndex] || qtyOptions[0];
          const vid =
            selected?.variantId ||
            product?.variants?.[variantIndex]?._id ||
            product?.variants?.[0]?._id ||
            product?.ProductVarient?.[variantIndex]?._id ||
            product?.ProductVarient?.[0]?._id ||
            product?.variantId ||
            undefined;
        if (!pid) return;

        const res = await ApiService.getCart();
        const cartItems =
          res?.data?.cart?.products ||
          res?.data?.products ||
          res?.data?.items ||
          [];

        const vidStr = vid?.toString();

        const match = cartItems.find((i: any) => {
          const itemPid =
            i?.productId?._id?.toString() ||
            i?.productId?.toString() ||
            i?._id?.toString() ||
            i?.id?.toString();
          const itemVid =
            i?.variantId?._id?.toString() ||
            i?.variantId?.toString() ||
            i?.ProductVarient?._id?.toString();

          if (vidStr) {
            return itemPid === pid && itemVid === vidStr;
          }
          return itemPid === pid;
        });

        setCartQty(match?.quantity || 0);
      } catch (e) {
        console.log('loadCartQuantity error', e);
      }
    },
    [product, qtyOptions]
  );

  useEffect(() => {
    loadCartQuantity(selectedQty);
  }, [selectedQty, loadCartQuantity]);

  // Load wishlist status
  useEffect(() => {
    (async () => {
      try {
        const res = await ApiService.getWishlist();
        let items = [];
        if (res?.data?.wishlist?.items) {
          items = res.data.wishlist.items;
        } else if (res?.data?.wishlist && Array.isArray(res.data.wishlist)) {
          items = res.data.wishlist;
        } else if (res?.data?.items) {
          items = res.data.items;
        }
        const wishlistIds = items.map((i: any) => i.productId?.toString() || i._id?.toString()).filter(Boolean);
        setIsFavorite(wishlistIds.includes(productId.toString()));
      } catch (e) {
        console.log('Error loading wishlist:', e);
      }
    })();
  }, [productId]);

  // Auto-slide product images carousel every 3 seconds
  const selectedVariant = qtyOptions[selectedQty] || qtyOptions[0] || {};

  // Safe price fallback – variant → product (null-safe) → 0
  const price = selectedVariant.price
    ? selectedVariant.price
    : product?.price
      ? product.price
      : product?.variants?.[0]?.price || 0;

  const mrp = selectedVariant.mrp
    ? selectedVariant.mrp
    : product?.mrp
      ? product.mrp
      : selectedVariant.price
        ? selectedVariant.price
        : product?.price || 0;

  const weight =
    selectedVariant.label ||
    (product?.variants?.[0]
      ? `${product.variants[0].weight || 1} ${product.variants[0].unit || 'kg'}`
      : '1 kg');

  const buildImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Normalize slashes but keep the "public" prefix since the server exposes it
    const clean = path.replace(/\\/g, '/');
    const normalized = clean.startsWith('/') ? clean.slice(1) : clean;
    return `${IMAGE_BASE_URL}${normalized}`;
  };

  // Prefer images of currently selected variant, then fall back to product images
  const variantImages =
    Array.isArray((selectedVariant as any)?.images) && (selectedVariant as any).images.length > 0
      ? (selectedVariant as any).images
          .map((img: string) => buildImageUrl(img))
          .filter(Boolean)
      : [];

  const productBaseImages =
    Array.isArray((product as any)?.images) && (product as any).images.length > 0
      ? (product as any).images
          .map((img: string) => buildImageUrl(img))
          .filter(Boolean)
      : [];

  const fallbackImg = productBaseImages[0] || '';

  // Final list of images for main carousel
  const productImages =
    variantImages.length > 0
      ? variantImages
      : productBaseImages.length > 0
        ? productBaseImages
        : fallbackImg
          ? [fallbackImg]
          : [];

  // Null-safe info/details when product is not yet loaded
  const info = product?.info || {};
  const details = product?.details || {};

  useEffect(() => {
    const totalImages = productImages.length;

    if (totalImages <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % totalImages;
        if (carouselRef.current) {
          try {
            carouselRef.current.scrollToIndex({ index: nextIndex, animated: true });
          } catch (e) {
            // ignore scroll errors
          }
        }
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [productImages.length]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4CAF50" />;
  if (!product) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>Product not found</Text>;

  const highlightRows = [
    { label: 'Unit', value: weight },
    { label: 'Storage Tips', value: info.storageTips || details.storageTips },
    { label: 'Nutrient Value & Benefits', value: details.nutrientValue || info.nutrientValue },
    { label: 'About', value: details.about || product?.about },
    { label: 'Description', value: details.description || product?.description },
    { label: 'Health Benefits', value: details.healthBenefits || product?.healthBenefits },
  ];

  const infoRows = [
    { label: 'Shelf Life', value: info.shelfLife || details.shelfLife },
    { label: 'Return Policy', value: info.returnPolicy || details.returnPolicy },
    { label: 'Storage Tips', value: info.storageTips || details.storageTips },
    { label: 'Country of origin', value: info.country || details.country },
    { label: 'Customer Care Details', value: info.help || details.help },
    { label: 'Disclaimer', value: info.disclaimer || details.disclaimer },
    { label: 'Seller', value: info.seller || details.seller },
    { label: 'Seller FSSAI', value: info.fssai || details.fssai },
  ];

  const filterRows = (rows: { label: string; value: any }[]) =>
    rows.filter(({ value }) => value !== undefined && value !== null && String(value).trim().length > 0);

  const filteredHighlights = filterRows(highlightRows);
  const filteredInfo = filterRows(infoRows);

  const toggleSection = (key: 'highlights' | 'info') =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const updateCart = async (newQty: number) => {
    // Prevent multiple simultaneous updates
    if (updatingCart) return;
    
    try {
      setUpdatingCart(true);
      
      const productIdentifier = (
        product?._id ||
        product?.id ||
        productId
      )?.toString();

      const variantId =
        selectedVariant.variantId ||
        product?.variants?.[selectedQty]?._id ||
        product?.variants?.[0]?._id ||
        product?.ProductVarient?.[selectedQty]?._id ||
        product?.ProductVarient?.[0]?._id ||
        product?.variantId ||
        undefined;

      const finalVariantId = variantId?.toString();
      const operationKey = finalVariantId ? `${productIdentifier}:${finalVariantId}` : productIdentifier;
      const operationType = newQty > cartQty ? 'add' : 'remove';
      
      // Set operation-specific loading state
      setOperationLoading(prev => ({ ...prev, [operationKey]: operationType }));

      if (!productIdentifier) return;
      
      // Make API call first
      if (newQty > 0) {
        await ApiService.addToCart(productIdentifier, finalVariantId, newQty.toString());
      } else {
        await ApiService.removeCartItem(productIdentifier, finalVariantId);
      }
      
      // Update UI after successful API call
      setCartQty(newQty);
      
      // Reload cart data to ensure synchronization across all variants
      // This ensures that when switching variants, the correct quantity is shown
      await loadCartQuantity(selectedQty);
    } catch (error) {
      console.log(error);
      // On error, reload cart to ensure correct state
      await loadCartQuantity(selectedQty);
    } finally {
      setUpdatingCart(false);
      // Clear operation-specific loading state
      const productIdentifier = (
        product?._id ||
        product?.id ||
        productId
      )?.toString();
      const variantId =
        selectedVariant.variantId ||
        product?.variants?.[selectedQty]?._id ||
        product?.variants?.[0]?._id ||
        product?.ProductVarient?.[selectedQty]?._id ||
        product?.ProductVarient?.[0]?._id ||
        product?.variantId ||
        undefined;
      const finalVariantId = variantId?.toString();
      const operationKey = finalVariantId ? `${productIdentifier}:${finalVariantId}` : productIdentifier;
      setOperationLoading(prev => ({ ...prev, [operationKey]: null }));
    }
  };

  const handleAddToCart = () => updateCart(1);

  // Toggle favorite
  const toggleFavorite = async () => {
    try {
      const productIdStr = productId.toString();
      if (isFavorite) {
        await ApiService.deleteWishlist(productIdStr);
        setIsFavorite(false);
      } else {
        await ApiService.addToWishlist(productIdStr);
        setIsFavorite(true);
      }
    } catch (err) {
      console.log('Error toggling wishlist:', err);
    }
  };

  // Share product
const handleShare = async () => {
  try {
    const deepLink = `sabjiwala://product/${productId}`;
    const webUrl = `http://159.89.146.245:5010/api/user/product/${productId}`;
    const shareMessage = `Check out ${product.name} - ₹${price} on SabjiWala!\n${webUrl}\n\nOr open in app: ${deepLink}`;

    await Share.share({
      message: shareMessage,
      title: product.name,
    });
  } catch (error) {
    console.log('Error sharing:', error);
  }
};

  // Render carousel images
  const renderCarouselImage = ({ item, index }: any) => (
    <Image
      source={{ uri: item }}
      style={styles.mainImg}
      resizeMode="cover"
      key={index}
    />
  );

  const renderQty = ({ item }: any) => (
    <Pressable
      onPress={() => setSelectedQty(item.id)}
      style={{
        borderWidth: 1.5,
        borderColor: selectedQty === item.id ? '#4CAF50' : '#E0E0E0',
        backgroundColor: selectedQty === item.id ? '#4CAF50' : '#fff',
        paddingVertical: 4,          
        paddingHorizontal: 16,
        borderRadius: 25,
        marginRight: 12,
        alignItems: 'center',        
        justifyContent: 'center',    
      }}
    >
      <Text
        style={{
          color: selectedQty === item.id ? '#fff' : '#000',
          fontWeight: '600',
          fontSize: 14,
          textAlign: 'center',      
        }}
      >
        {item.label}
      </Text>
    </Pressable>
  );

  // Render yellow star rating component
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View style={styles.starRatingContainer}>
        {[...Array(fullStars)].map((_, index) => (
          <Icon
            key={`full-${index}`}
            family="AntDesign"
            name="star"
            color="#FFD700"
            size={16}
            style={styles.starIcon}
          />
        ))}
        {hasHalfStar && (
          <Icon
            key="half"
            family="AntDesign"
            name="star"
            color="#FFD700"
            size={16}
            style={styles.starIcon}
          />
        )}
        {[...Array(emptyStars)].map((_, index) => (
          <Icon
            key={`empty-${index}`}
            family="AntDesign"
            name="staro"
            color="#FFD700"
            size={16}
            style={styles.starIcon}
          />
        ))}
        {rating > 0 && (
          <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
        )}
      </View>
    );
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(14) + insets.bottom }}
      >
        {/* Product Image Carousel */}
        <View style={styles.imgContainer}>
          <FlatList
            ref={carouselRef}
            data={productImages}
            renderItem={renderCarouselImage}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImageIndex(index);
            }}
            style={styles.carouselContainer}
          />

          {/* Back Button */}
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" family="Feather" size={22} color="#000" />
          </Pressable>

          {/* Heart Icon (Favorite) */}
          <Pressable onPress={toggleFavorite} style={styles.heartBtn}>
            <Icon
              name={isFavorite ? "heart" : "heart-outline"}
              family="Ionicons"
              size={22}
              color={isFavorite ? "#FF4444" : "#fff"}
            />
          </Pressable>

          {/* Image Indicators */}
          {productImages.length > 1 ? (
            <View style={styles.imageIndicators}>
              {productImages.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentImageIndex === index && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          ) : null}

          {/* Trademark Symbol - Bottom Left */}
          <View style={styles.imgTradeMarkView}>
            <Image source={Images.ic_trademark} style={styles.imgTradeMark} />
          </View>
        </View>

        {/* Name & Share */}
        <View style={styles.nameRatingRow}>
          <View style={styles.nameRatingContainer}>
            <Text style={styles.productName}>{String(product.name || '')}</Text>
          </View>

          {/* Share Button */}
          <Pressable onPress={handleShare} style={styles.shareBtn}>
            <Icon name="share-2" family="Feather" size={20} color="#000" />
          </Pressable>
        </View>

        {/* Weight & Rating Row */}
        <View style={styles.weightRatingRow}>
          <Text style={styles.weightText}>{String(weight || '')}</Text>
          {product.rating > 0 && renderStarRating(product.rating)}
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.finalPrice}>₹{String(price || 0)}</Text>
          {mrp > price ? <Text style={styles.strikePrice}>₹{String(mrp)}</Text> : null}
          {mrp > price ? <Text style={styles.saveText}>Save ₹{String(mrp - price)}</Text> : null}
        </View>

        {/* Quantity Options */}
        <FlatList
          data={qtyOptions}
          renderItem={renderQty}
          keyExtractor={(i) => i.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: wp(4), marginTop: hp(1) }}
        />

        {/* Product Detail Accordion Cards */}
        {(filteredHighlights.length > 0 || filteredInfo.length > 0) ? (
          <View style={styles.productDetailWrapper}>
            <Text style={styles.productDetailTitle}>Product Detail</Text>

            {filteredHighlights.length > 0 ? (
              <View style={styles.sectionContainer}>
                <Pressable style={styles.sectionHeader} onPress={() => toggleSection('highlights')}>
                  <Text style={styles.sectionTitle}>Highlights</Text>
                  <Icon
                    family="Feather"
                    name={expandedSections.highlights ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color="#000"
                  />
                </Pressable>

                {expandedSections.highlights && (
                  <View style={styles.sectionCard}>
                    {filteredHighlights.map(({ label, value }, index) => {
                      const isLast = index === filteredHighlights.length - 1;
                      return (
                        <View key={`${label}-${index}`} style={[styles.sectionRow, isLast && styles.sectionRowLast]}>
                          <Text style={styles.sectionLabel}>{label}</Text>
                          <Text style={styles.sectionValue}>{String(value)}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : null}

            {filteredInfo.length > 0 ? (
              <View style={styles.sectionContainer}>
                <Pressable style={styles.sectionHeader} onPress={() => toggleSection('info')}>
                  <Text style={styles.sectionTitle}>Info</Text>
                  <Icon
                    family="Feather"
                    name={expandedSections.info ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color="#000"
                  />
                </Pressable>

                {expandedSections.info && (
                  <View style={styles.sectionCard}>
                    {filteredInfo.map(({ label, value }, index) => {
                      const isLast = index === filteredInfo.length - 1;
                      return (
                        <View key={`${label}-${index}`} style={[styles.sectionRow, isLast && styles.sectionRowLast]}>
                          <Text style={styles.sectionLabel}>{label}</Text>
                          <Text style={styles.sectionValue}>{String(value)}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom Add to Cart Bar */}
      <View
        style={[
          styles.bottomCartBar,
          {
            minHeight: hp(8) + insets.bottom,
            paddingBottom: Math.max(insets.bottom, hp(1.2)),
          },
        ]}
      >
        <LinearGradient colors={['#FFFFFF', '#FFFFFF']} style={styles.cartGradient}>
          {cartQty === 0 ? (
            (() => {
              const productIdentifier = (
                product?._id ||
                product?.id ||
                productId
              )?.toString();
              const variantId =
                selectedVariant.variantId ||
                product?.variants?.[selectedQty]?._id ||
                product?.variants?.[0]?._id ||
                product?.ProductVarient?.[selectedQty]?._id ||
                product?.ProductVarient?.[0]?._id ||
                product?.variantId ||
                undefined;
              const finalVariantId = variantId?.toString();
              const operationKey = finalVariantId ? `${productIdentifier}:${finalVariantId}` : productIdentifier;
              const isLoading = updatingCart || operationLoading[operationKey] === 'add';
              
              return (
                <Pressable 
                  onPress={handleAddToCart} 
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={['#5A875C', '#015304']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.addToCartBtn, { flex: 1, opacity: isLoading ? 0.5 : 1 }]}
                  >
                    <Text style={[styles.addToCartText, { color: '#fff' }]}>
                      {isLoading ? 'Adding...' : 'Add to Cart'}
                    </Text>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />
                    ) : (
                      <Icon name="chevron-right" family="Entypo" size={26} color="#fff" />
                    )}
                  </LinearGradient>
                </Pressable>
              );
            })()
          ) : (
            <View style={styles.cartContentRow}>
              <Pressable
                onPress={() => (navigation as any).navigate('BottomStackNavigator', { screen: 'Cart' })}
                style={styles.viewCartButton}
              >
                <Icon name="shopping-cart" family="Feather" size={26} color="#000" />
                <Text style={styles.viewCartText} numberOfLines={1}>
                  View Cart
                </Text>
              </Pressable>

              <View style={styles.quantityControls}>
                {(() => {
                  const productIdentifier = (
                    product?._id ||
                    product?.id ||
                    productId
                  )?.toString();
                  const variantId =
                    selectedVariant.variantId ||
                    product?.variants?.[selectedQty]?._id ||
                    product?.variants?.[0]?._id ||
                    product?.ProductVarient?.[selectedQty]?._id ||
                    product?.ProductVarient?.[0]?._id ||
                    product?.variantId ||
                    undefined;
                  const finalVariantId = variantId?.toString();
                  const operationKey = finalVariantId ? `${productIdentifier}:${finalVariantId}` : productIdentifier;
                  const isLoading = updatingCart || operationLoading[operationKey] === 'remove';
                  
                  return (
                    <Pressable
                      onPress={() => updateCart(cartQty - 1)}
                      disabled={isLoading}
                      style={[
                        styles.quantityButton,
                        { backgroundColor: isLoading ? '#f5f5f5' : '#fff', opacity: isLoading ? 0.5 : 1 },
                      ]}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Text style={{ fontSize: 16, color: '#000', fontWeight: '600' }}>-</Text>
                      )}
                    </Pressable>
                  );
                })()}

                <Text style={styles.quantityValue}>
                  {String(cartQty)}
                </Text>

                {(() => {
                  const productIdentifier = (
                    product?._id ||
                    product?.id ||
                    productId
                  )?.toString();
                  const variantId =
                    selectedVariant.variantId ||
                    product?.variants?.[selectedQty]?._id ||
                    product?.variants?.[0]?._id ||
                    product?.ProductVarient?.[selectedQty]?._id ||
                    product?.ProductVarient?.[0]?._id ||
                    product?.variantId ||
                    undefined;
                  const finalVariantId = variantId?.toString();
                  const operationKey = finalVariantId ? `${productIdentifier}:${finalVariantId}` : productIdentifier;
                  const isLoading = updatingCart || operationLoading[operationKey] === 'add';
                  
                  return (
                    <Pressable
                      onPress={() => updateCart(cartQty + 1)}
                      disabled={isLoading}
                      style={[
                        styles.quantityButton,
                        { backgroundColor: isLoading ? '#f5f5f5' : '#fff', opacity: isLoading ? 0.5 : 1 },
                      ]}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Text style={{ fontSize: 16, color: '#000', fontWeight: '600' }}>+</Text>
                      )}
                    </Pressable>
                  );
                })()}
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetail;
