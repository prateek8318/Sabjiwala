import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FlatList,
  Pressable,
  View,
  Image,
  Dimensions,
  Animated,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, TextView } from '../../../components';
import styles from './catogaries.styles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { Colors } from '../../../constant';
import ApiService, { IMAGE_BASE_URL } from '../../../service/apiService';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

type HomeStackProps = {
  Catogaries: undefined;
  subCategoryList: { categoryId: string; categoryName: string };
  // Add other screen names and their params here
};

type CatogariesScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'Catogaries'
>;

interface Category {
  _id: string;
  name: string;
  image?: string;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;
const FALLBACK_IMAGE = 'https://via.placeholder.com/300x150.png?text=No+Image';

const Catogaries = () => {
  const navigation = useNavigation<CatogariesScreenNavigationType>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getCategory();

      if (response.status === 200 && response.data?.success) {
        setCategories(response.data.data || []);
      } else {
        Toast.show({
          type: 'error',
          text1: response.data?.message || 'Failed to load categories',
        });
      }
    } catch (error: any) {
      console.log('Get Categories Error:', error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
      // Set header options when screen is focused
      navigation.setOptions({
        headerLeft: () => (
          <Pressable 
            onPress={() => navigation.goBack()}
            style={({pressed}) => ({
              opacity: pressed ? 0.5 : 1,
              marginLeft: 15,
              padding: 5
            })}
          >
            <Icon name="arrow-left" size={24} color={Colors.PRIMARY[400]} />
          </Pressable>
        ),
      });
    }, [navigation])
  );

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
        <View key={idx} style={[styles.shimmerCardWrapper, { width: ITEM_WIDTH }]}>
          <ShimmerPlaceholder style={styles.shimmerImage} />
          <View style={styles.shimmerInfo}>
            <ShimmerPlaceholder style={styles.shimmerLinePrimary} />
            <ShimmerPlaceholder style={styles.shimmerLineSecondary} />
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const CategoryCard = ({ item }: { item: Category }) => {
    const [uri, setUri] = useState(() => {
      const raw = item.image || '';
      const cleaned = raw.replace(/\\/g, '/').replace(/^\//, '');
      const imagePath = cleaned ? `${IMAGE_BASE_URL}${cleaned}` : null;
      return imagePath || FALLBACK_IMAGE;
    });

    const handleError = () => setUri(FALLBACK_IMAGE);

    return (
      <Pressable
        style={[styles.itemCatMainView, { width: ITEM_WIDTH }]}
        onPress={() =>
          navigation.navigate('subCategoryList', {
            categoryId: item._id,
            categoryName: item.name,
          })
// navigation.navigate("BottomStackNavigator", { screen: "MyOrder" })
        }
      >
        <View style={styles.itemCatView}>
          <Image
            source={{ uri }}
            style={styles.categoryImage}
            resizeMode="cover"
            onError={handleError}
          />
          <View style={styles.blurContainer}>
            <TextView style={styles.itemCatTxt} numberOfLines={2}>
              {item.name}
            </TextView>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderCat = ({ item }: { item: Category }) => <CategoryCard item={item} />;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.PRIMARY[100] }}
      edges={['top', 'left', 'right']}
    >
      <View style={[styles.container, { flex: 1 }]}>
        <Header title="Categories" isBack={true} />

        <View style={{ flex: 1 }}>
          {loading ? (
            renderShimmerGrid()
          ) : (
            <FlatList
              data={categories}
              numColumns={2}
              keyExtractor={item => item._id}
              renderItem={renderCat}
              contentContainerStyle={[styles.flatListContent, { flexGrow: 1 }]}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <TextView style={styles.emptyText}>No categories found</TextView>
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Catogaries;
