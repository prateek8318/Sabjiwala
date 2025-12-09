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
import ApiService from '../../../service/apiService';
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

  useEffect(() => {
    (async () => {
      try {
        const res = await ApiService.getProductDetail(productId);
        if (res?.status === 200 && res.data?.success) {
          const productData = res.data.productData;
          setProduct(productData);

          const options = productData.variants?.map((v: any, index: number) => ({
            id: index,
            label: `${v.weight || v.stock || 1} ${v.unit || 'kg'}`,
            price: v.price || 0,
            mrp: v.mrp || v.originalPrice || v.price || 0,
            variantId: v._id,
          })) || [];

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
  const img = product.images?.[0] ? `http://167.71.232.245:8539/${product.images[0]}` : '';

  // Get product images for carousel
  const productImages = product?.images?.length > 0
    ? product.images.map((image: string) => `http://167.71.232.245:8539/${image}`)
    : img ? [img] : [];

  const info = product.info || {};

  const updateCart = async (newQty: number) => {
    try {
      if (newQty > 0) {
        await ApiService.addToCart(product._id, selectedVariant.variantId, newQty.toString());
      } else {
        await ApiService.removeCartItem(product._id, selectedVariant.variantId);
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
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 30,
        minWidth: 100,
        marginRight: 12,
        alignItems: 'center',
      }}
    >
      <Text style={{
        color: selectedQty === item.id ? '#fff' : '#000',
        fontWeight: selectedQty === item.id ? '600' : '500',
        fontSize: 14,
      }}>
        {String(item.label || '')}
      </Text>
      <Text style={{
        color: selectedQty === item.id ? '#fff' : '#4CAF50',
        fontWeight: 'bold',
        fontSize: 13,
        marginTop: 4,
      }}>
        ₹{String(item.price || 0)}
      </Text>
    </Pressable>
  );

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
            <Icon name="arrow-left" family="Feather" size={28} color="#000" />
          </Pressable>

          {/* Heart Icon (Favorite) */}
          <Pressable onPress={toggleFavorite} style={styles.heartBtn}>
            <Icon
              name={isFavorite ? "heart" : "heart-outline"}
              family="Ionicons"
              size={28}
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
        </View>

        {/* Name, Rating & Share */}
        <View style={styles.nameRatingRow}>
          <View style={styles.nameRatingContainer}>
            <Text style={styles.productName}>{String(product.name || '')}</Text>

            {/* Rating sirf tab dikhe jab rating > 0 ho */}
            {product.rating > 0 && (
              <View style={styles.ratingContainer}>
                <Icon
                  family="AntDesign"
                  name="star"
                  color={Colors.PRIMARY[400] || "#4CAF50"}
                  size={16}
                />
                <Text style={styles.ratingText}>{String(product.rating)}</Text>
              </View>
            )}
          </View>

          {/* Share Button - Fixed: ab black dot nahi aayega */}
          <Pressable onPress={handleShare} style={styles.shareBtn}>
            <Icon name="share-2" family="Feather" size={24} color="#000" />
          </Pressable>
        </View>
        <Text style={styles.weightText}>{String(weight || '')}</Text>

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

        {/* Additional Info */}
        {info && typeof info === 'object' && Object.keys(info).length > 0 ? (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Additional Info</Text>
            {Object.keys(info).map((key) => {
              const value = info[key];
              // Convert value to string if it's not already
              const displayValue = value !== null && value !== undefined
                ? (typeof value === 'object' ? JSON.stringify(value) : String(value))
                : '';
              return (
                <View key={key} style={styles.infoRow}>
                  <Text style={styles.infoKey}>{String(key || '')}</Text>
                  <Text style={styles.infoValue}>{displayValue}</Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom Add to Cart Bar – Untouched */}
      <View style={styles.bottomCartBar}>
        <LinearGradient colors={['#E8F5E8', '#C8E6C9']} style={styles.cartGradient}>
          {cartQty === 0 ? (
            <Pressable onPress={handleAddToCart} style={[styles.addToCartBtn, { flex: 1 }]}>
              <Text style={styles.addToCartText}>Add to Cart</Text>
              <Icon name="chevron-right" family="Entypo" size={26} color="#000" />
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