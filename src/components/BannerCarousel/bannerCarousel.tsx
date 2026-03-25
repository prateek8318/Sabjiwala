import React, { useRef, useEffect } from 'react';
import { View, Image, FlatList, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp } from '../../constant/dimentions';

interface BannerCarouselProps {
  banners: string[];
  height?: number;
  autoScrollInterval?: number;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  height = 200,
  autoScrollInterval = 3000,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const currentIndex = useRef(0);
  const carouselWidth = wp(95);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % banners.length;
      try {
        flatListRef.current?.scrollToIndex({
          index: currentIndex.current,
          animated: true,
        });
      } catch (error) {
        // Fallback to scrollToOffset if scrollToIndex fails
        flatListRef.current?.scrollToOffset({
          offset: currentIndex.current * carouselWidth,
          animated: true,
        });
      }
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [banners.length, autoScrollInterval]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      currentIndex.current = viewableItems[0].index || 0;
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (banners.length === 0) {
    return null;
  }

  // Single banner - no carousel needed
  if (banners.length === 1) {
    return (
      <View style={[styles.container, { height }]}>
        <Image
          source={{ uri: banners[0] }}
          style={[styles.bannerImage, { width: carouselWidth, height }]}
          resizeMode="cover"
          onError={(error) => {
            console.log('Banner image load error:', error.nativeEvent.error);
            console.log('Failed URL:', banners[0]);
          }}
        />
      </View>
    );
  }

  // Multiple banners - carousel
  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `banner-${index}`}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={[styles.bannerImage, { width: carouselWidth, height }]}
            resizeMode="cover"
            onError={(error) => {
              console.log('Banner carousel image load error:', error.nativeEvent.error);
              console.log('Failed URL:', item);
            }}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: carouselWidth,
          offset: carouselWidth * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp(95),
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 16,
  },
  bannerImage: {
    width: wp(95),
  },
});

export default BannerCarousel;
