import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  View,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { Header, TextView } from '../../../components';
import styles from './catogaries.styles';
import { useNavigation } from '@react-navigation/native';
import { HomeStackProps } from '../../../@types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { Colors, Icon } from '../../../constant';
import ApiService, { IMAGE_BASE_URL } from '../../../service/apiService';

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderCat = ({ item }: { item: Category }) => {
    const imagePath = item.image
      ? `${IMAGE_BASE_URL}${item.image.replace('public\\', '').replace(/\\/g, '/')}`
      : null;

    return (
      <Pressable
        style={[styles.itemCatMainView, { width: ITEM_WIDTH }]}
        onPress={() =>
          navigation.navigate('subCategoryList', {
            categoryId: item._id,
            categoryName: item.name,
          })
        }
      >
        <View style={styles.itemCatView}>
          <Image
            source={{
              uri:
                imagePath ||
                'https://via.placeholder.com/300x150.png?text=No+Image',
            }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
          <TextView style={styles.itemCatTxt} numberOfLines={2} ellipsizeMode="tail">
            {item.name}
          </TextView>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Categories" isBack={true} />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY[300]} />
        </View>
      ) : (
        <FlatList
          data={categories}
          numColumns={2}
          keyExtractor={item => item._id}
          renderItem={renderCat}
          contentContainerStyle={styles.flatListContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <TextView style={styles.emptyText}>No categories found</TextView>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Catogaries;
