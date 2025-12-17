import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  ScrollView,
  SafeAreaView,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<HomeStackProps, 'ProductDetail'>;

const ProductDetail = () => {
  const route = useRoute();
  const { productId } = route.params as { productId: string };
  const navigation = useNavigation<NavProp>();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(0);
  const [qtyOptions, setQtyOptions] = useState<any[]>([]);
  const [cartQty, setCartQty] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({ highlights: true, info: true });

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
                label: `${v.weight || v.stock || 1} ${v.unit || 'kg'}`,
                price: v.price || 0,
                mrp: v.mrp || v.originalPrice || v.price || 0,
                variantId: v._id,
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

  // Initial favorite status: check wishlist so heart is red if product already in favorites
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      try {
        const res = await ApiService.getWishlist();

        // Handle different response structures similar to other screens
        let items: any[] = [];
        if (res?.data?.wishlist?.items && Array.isArray(res.data.wishlist.items)) {
          items = res.data.wishlist.items;
        } else if (res?.data?.wishlist && Array.isArray(res.data.wishlist)) {
          items = res.data.wishlist;
        } else if (res?.data?.items && Array.isArray(res.data.items)) {
          items = res.data.items;
        } else if (res?.data?.data?.items && Array.isArray(res.data.data.items)) {
          items = res.data.data.items;
        }

        const ids = items
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

        setIsFavorite(ids.includes(productId.toString()));
      } catch (e) {
        console.log('loadFavoriteStatus error', e);
      }
    };

    loadFavoriteStatus();
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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4CAF50" />;
  if (!product) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>Product not found</Text>;


  const selectedVariant = qtyOptions[selectedQty] || qtyOptions[0] || {};

  // Safe price fallback – variant → product fallback → 0
  const price = selectedVariant.price
    ? selectedVariant.price
    : product.price
      ? product.price
      : product.variants?.[0]?.price || 0;

  const mrp = selectedVariant.mrp
    ? selectedVariant.mrp
    : product.mrp
      ? product.mrp
      : selectedVariant.price
        ? selectedVariant.price
        : product.price || 0;

  const weight = selectedVariant.label ||
    (product.variants?.[0]
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

  const fallbackImg = buildImageUrl(product.images?.[0]);

  // Get product images for carousel; if only one image, duplicate so carousel still scrolls
  const baseImages = product?.images?.length > 0
    ? product.images.map((image: string) => buildImageUrl(image)).filter(Boolean)
    : fallbackImg
      ? [fallbackImg]
      : [];

  const productImages = baseImages.length > 1
    ? baseImages
    : baseImages.length === 1
      ? [baseImages[0], baseImages[0]]
      : [];

  const info = product.info || {};
  const details = product.details || {};

  const highlightRows = [
    { label: 'Unit', value: weight },
    { label: 'Storage Tips', value: info.storageTips || details.storageTips },
    { label: 'Nutrient Value & Benefits', value: details.nutrientValue || info.nutrientValue },
    { label: 'About', value: details.about || product.about },
    { label: 'Description', value: details.description || product.description },
    { label: 'Health Benefits', value: details.healthBenefits || product.healthBenefits },
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
    try {
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

      if (!productIdentifier) return;
      if (newQty > 0) {
        await ApiService.addToCart(productIdentifier, finalVariantId, newQty.toString());
      } else {
        await ApiService.removeCartItem(productIdentifier, finalVariantId);
      }
      setCartQty(newQty);
    } catch (error) {
      console.log(error);
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
      const productUrl = `http://167.71.232.245:8539/product/${productId}`;
      const shareMessage = `Check out ${product.name} - ₹${price} on SabjiWala!\n${productUrl}`;

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(12) }}>
        {/* Product Image Carousel */}
        <View style={styles.imgContainer}>
          <FlatList
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
            <Icon name="share-2" family="Feather" size={24} color="#000" />
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
          contentContainerStyle={{ paddingHorizontal: wp(4), marginTop: hp(2) }}
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

      {/* Bottom Add to Cart Bar – Untouched */}
      <View style={styles.bottomCartBar}>
        <LinearGradient colors={['#FFFFFF', '#FFFFFF']} style={styles.cartGradient}>
          {cartQty === 0 ? (
            <Pressable
              onPress={handleAddToCart}
              style={[styles.addToCartBtn, { flex: 1, backgroundColor: '#1B5E20' }]}
            >
              <Text style={[styles.addToCartText, { color: '#fff' }]}>Add to Cart</Text>
              <Icon name="chevron-right" family="Entypo" size={26} color="#fff" />
            </Pressable>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, padding: 10 }}>
              <Pressable
                onPress={() => (navigation as any).navigate('BottomStackNavigator', { screen: 'Cart' })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#ccc',
                }}
              >
                <Icon name="shopping-cart" family="Feather" size={26} color="#000" />
                <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#000' }}>
                  View Cart
                </Text>
              </Pressable>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable
                  onPress={() => updateCart(cartQty - 1)}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 4,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, color: '#000', fontWeight: '600' }}>-</Text>
                </Pressable>

                <Text style={{ marginHorizontal: 12, fontSize: 16, fontWeight: '600', color: '#000' }}>
                  {String(cartQty)}
                </Text>

                <Pressable
                  onPress={() => updateCart(cartQty + 1)}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 4,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, color: '#000', fontWeight: '600' }}>+</Text>
                </Pressable>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetail;