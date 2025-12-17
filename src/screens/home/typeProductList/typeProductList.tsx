import React, { useEffect, useState, useCallback, useRef } from 'react';
import { SafeAreaView, View, Animated, StyleSheet, ScrollView } from 'react-native';
import { Header, TextView } from '../../../components';
import ApiService, { IMAGE_BASE_URL } from '../../../service/apiService';
import ProductCard from '../dashboard/components/ProductCard/productCard';
import { Product, ProductCardItem } from '../../../@types';
import styles from './typeProductList.styles';
import LinearGradient from 'react-native-linear-gradient';

type TypeProductListProps = {
  route?: {
    params?: {
      type?: string;
      title?: string;
    };
  };
};

const TypeProductList = ({ route }: TypeProductListProps) => {
  const type = route?.params?.type || 'frequentlyBought';
  const title = route?.params?.title || 'Products';

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductCardItem[]>([]);

  const ShimmerPlaceholder = ({ style }: { style?: any }) => {
    const shimmerValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }, [shimmerValue]);

    const translateX = shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-120, 120],
    });

    return (
      <View style={[styles.shimmerBase, style]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={['#f0f0f0', '#e2e2e2', '#f0f0f0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    );
  };

  const renderShimmerGrid = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.shimmerGrid}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <View key={idx} style={styles.shimmerCardWrapper}>
          <ShimmerPlaceholder style={styles.shimmerImage} />
          <View style={styles.shimmerInfo}>
            <ShimmerPlaceholder style={styles.shimmerLinePrimary} />
            <ShimmerPlaceholder style={styles.shimmerLineSecondary} />
            <View style={styles.shimmerRow}>
              <ShimmerPlaceholder style={styles.shimmerChip} />
              <ShimmerPlaceholder style={styles.shimmerChipSmall} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const transformProductToCard = useCallback((product: Product): ProductCardItem => {
    const variant =
      (product as any)?.ProductVarient?.[0] ||
      (product as any)?.variants?.[0] ||
      {};

    const preferredImages =
      (Array.isArray(variant?.images) && variant.images.length > 0
        ? variant.images
        : null) ||
      (Array.isArray((product as any)?.primary_image) && (product as any)?.primary_image.length > 0
        ? (product as any)?.primary_image
        : null) ||
      (Array.isArray((product as any)?.images) && (product as any)?.images.length > 0
        ? (product as any)?.images
        : []);

    const imageUrl = preferredImages?.[0] || '';
    const normalizedImage = imageUrl ? imageUrl.replace(/\\/g, '/') : '';
    const fullImageUrl = normalizedImage ? IMAGE_BASE_URL + normalizedImage : '';

    const weightValue =
      (variant as any)?.weight ??
      (product as any)?.weight ??
      (variant as any)?.stock ??
      (product as any)?.stock ??
      1;
    const unitValue = (variant as any)?.unit ?? (product as any)?.unit ?? '';

    return {
      id: (product as any)?._id || '',
      name: (product as any)?.productName || (product as any)?.name || 'Product',
      image: fullImageUrl,
      price: (variant as any)?.price || (product as any)?.price || 0,
      oldPrice: (variant as any)?.originalPrice || (product as any)?.mrp || 0,
      discount: (variant as any)?.discount ? `₹${(variant as any).discount} OFF` : '',
      weight: `${weightValue} ${unitValue}`.trim(),
      rating: (product as any)?.rating || 4.5,
      options: `${(((product as any)?.ProductVarient || (product as any)?.variants || []).length || 0)} Option${(((product as any)?.ProductVarient || (product as any)?.variants || []).length || 0) > 1 ? 's' : ''}`,
      variantId:
        (variant as any)?._id ||
        (product as any)?.ProductVarient?.[0]?._id ||
        (product as any)?.variants?.[0]?._id ||
        '',
      ProductVarient: (product as any)?.ProductVarient || (product as any)?.variants || [],
    };
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ApiService.getTypeBasedProduct(type);
      const apiProducts: Product[] =
        (res?.data?.paginateData as any) ||
        (res?.data?.data as any) ||
        (res?.data?.products as any) ||
        (res?.data?.items as any) ||
        (res?.data as any) ||
        [];
      const cards = Array.isArray(apiProducts) ? apiProducts.map(transformProductToCard) : [];
      setProducts(cards);
    } catch (err) {
      console.log('TypeProductList load error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [transformProductToCard, type]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={title} />

      {loading ? (
        renderShimmerGrid()
      ) : products.length === 0 ? (
        <View style={styles.emptyState}>
          <TextView style={styles.emptyText}>No products found</TextView>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          <ProductCard cardArray={products} horizontal={false} numOfColumn={2} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default TypeProductList;

