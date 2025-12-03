
import React, { FC, useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  FlatList,
  RefreshControl,
} from 'react-native';
import styles from './dashboard.styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


import {
  CommonLoader,
  TextView,
  LinearButton,
} from '../../../components';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../constant/dimentions';
import { Colors, Icon, Images } from '../../../constant';
// 🔹 Local Category Icons Mapping
export const CategoryIcons = {
  all: require('../../../assets/images/catogaries/all.png'),
  bread1: require('../../../assets/images/catogaries/bread.png'),
  vegetables: require('../../../assets/images/catogaries/vegetables.png'),
  milk: require('../../../assets/images/catogaries/milk.png'),
  egg: require('../../../assets/images/catogaries/egg.png'),
};

// 🔹 Match API category name to local icon
const getCategoryIcon = (name: string) => {
  const key = name.toLowerCase().replace(/ /g, '');
  return CategoryIcons[key] || CategoryIcons['all'];
};

import InputText from '../../../components/InputText/TextInput';
import ProductCard from './components/ProductCard/productCard';
import ApiService, { IMAGE_BASE_URL } from '../../../service/apiService';
import { Product, ProductCardItem, SubCategory } from '../../../@types';

type DashboardScreenNavigationType = NativeStackNavigationProp<any, 'Dashboard'>;

const Dashboard: FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationType>();


  const [categories, setCategories] = useState<SubCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [products, setProducts] = useState<ProductCardItem[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [exploreSections, setExploreSections] = useState<any[]>([]);
  const [dealBanner, setDealBanner] = useState<string>('');


  const [dealOfTheDay, setDealOfTheDay] = useState<ProductCardItem[]>([]);
  const [recommended, setRecommended] = useState<ProductCardItem[]>([]);
  const [favorite, setFavorite] = useState<ProductCardItem[]>([]);
  const [freshFood, setFreshFood] = useState<ProductCardItem[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [productLoading, setProductLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [groceryCards, setGroceryCards] = useState<
    { id: string; name: string; image?: string }[]
  >([]);


  // 🧠 Fetch Categories
  const fetchCategories = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await ApiService.getHomeCategory();
      const subCategories: SubCategory[] = response.data.subCategoryData || [];

      const allCategory: SubCategory = { _id: 'all', name: 'All' };
      setCategories([allCategory, ...subCategories]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch Static Home Content (Banners + Categories + Explore)
  const fetchStaticContent = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await ApiService.getHomeStaticData();

      const data = response.data.data;

      // Banners
      setBanners(data.banners || []);

      // Categories (SubCategories)
      const apiCats: SubCategory[] = data.categories || [];
      const allCat: SubCategory = { _id: 'all', name: 'All' };
      //       setCategories([allCat, ...apiCats]);

      const mappedGroceryCards = apiCats.map((item: SubCategory) => ({
        id: item._id,
        name: item.name,
        image: item.image ? IMAGE_BASE_URL + item.image.replace('public\\', '').replace(/\\/g, '/') : undefined,
      }));
      setGroceryCards(mappedGroceryCards);

      // Explore Sections
      setExploreSections(data.explore || []);

      // Deal Banner
      if (data.dealBanner?.image) {
        setDealBanner(IMAGE_BASE_URL + data.dealBanner.image.replace('public\\', '').replace(/\\/g, '/'));
      }
    } catch (error) {
      console.error('Static content error:', error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const fetchHomeProductContent = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await ApiService.getHomeContent(); // ← ye wala use karo

      const data = response.data.data;

      // Transform each section using same logic as transformProductToCard
      const transform = (product: any): ProductCardItem => {
        const variant = product.ProductVarient?.[0];
        const imagePath = variant?.images?.[0] || product.primary_image?.[0] || '';

        const cleanPath = imagePath
          .replace('public\\', '')
          .replace('public/', 'public/')
          .replace(/\\/g, '/');

        return {
          id: product._id,
          name: product.productName,
          image: imagePath ? IMAGE_BASE_URL + cleanPath : '',
          price: variant?.price || product.price || 0,
          oldPrice: variant?.originalPrice || product.mrp || 0,
          discount: variant?.discount ? `₹${variant.discount} OFF` : '',
          weight: variant ? `${variant.stock || 1} ${variant.unit || ''}` : 'N/A',
          rating: product.rating || 4.5,
          options: `${product.ProductVarient?.length || 0} Option${(product.ProductVarient?.length || 0) > 1 ? 's' : ''}`,
        };
      };

      setDealOfTheDay((data.dealOfTheDay || []).map(transform));
      setRecommended((data.recommendedProducts || []).map(transform));
      setFavorite((data.favoriteProducts || []).map(transform));
      setFreshFood((data.freshFoodProducts || []).map(transform));

    } catch (error) {
      console.error('Error fetching home product content:', error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  // 🧠 Fetch Products
  const fetchProducts = async (subCategoryId: string) => {
    try {
      setProductLoading(true);
      const response = await ApiService.getSubCategoryProducts(subCategoryId);

      if (response.status === 200 && response.data.paginateData) {
        const apiProducts: Product[] = response.data.paginateData;
        const cardItems = apiProducts.map(transformProductToCard);
        setProducts(cardItems);
      } else {
        setProducts([]);
        console.warn('No products found for this category');
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('⚠️ No products found for this category');
        setProducts([]);
      } else {
        console.error('Error fetching products:', error.message);
        setProducts([]);
      }
    } finally {
      setProductLoading(false);
    }
  };

  // 🧠 Initial Load
  useEffect(() => {
    fetchCategories();
    fetchStaticContent();
    fetchHomeProductContent();
  }, []);

  useEffect(() => {
    fetchProducts(selectedCat);
  }, [selectedCat]);

  // 🧠 Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories(true);
    fetchStaticContent(true);
    fetchHomeProductContent(true);
    fetchProducts(selectedCat);

  }, [selectedCat]);

  // 🔹 Render Category
  const renderCategoryItem = ({ item }: { item: SubCategory }) => {
    const isSelected = selectedCat === item._id;

    return (
      <TouchableOpacity
        style={[
          styles.itemCatView,
          {
            borderBottomWidth: isSelected ? 4 : 0,
            borderBottomColor: isSelected ? Colors.PRIMARY[300] : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
        onPress={() => setSelectedCat(item._id)}
      >
        {/* Icon Upar */}
        <Image
          source={getCategoryIcon(item.name)}
          style={{ width: 35, height: 35, marginBottom: 4 }}
          resizeMode="contain"
        />

        {/* Name Niche */}
        <TextView style={[styles.itemCat, { textAlign: 'center' }]}>
          {item.name}
        </TextView>
      </TouchableOpacity>
    );
  };


  const Product2 = [
    {
      id: 1,
      name: 'Tomato',
      image:
        'https://t4.ftcdn.net/jpg/02/49/93/33/360_F_249933303_rB82fjbNuZdT3444cZfutFG1Wau0T1VA.jpg',
      price: 16,
      oldPrice: 30,
      discount: '₹12 OFF',
      weight: '1 pc (1.8-3 kg)',
      rating: 4.7,
      options: '2 Options',
    },
    {
      id: 2,
      name: 'Potato',
      image:
        'https://t3.ftcdn.net/jpg/03/11/01/12/360_F_311011245_9TZ5ZMQVpbFJKoKQYx24rk3zF4RxWfLC.jpg',
      price: 20,
      oldPrice: 35,
      discount: '₹15 OFF',
      weight: '1kg',
      rating: 4.5,
      options: '3 Options',
    },
    {
      id: 3,
      name: 'Apple',
      image:
        'https://t3.ftcdn.net/jpg/02/45/31/34/360_F_245313422_m2qHbcBSzdfdPahVZzB5ZmEBapItiaI1.jpg',
      price: 120,
      oldPrice: 150,
      discount: '₹30 OFF',
      weight: '1kg',
      rating: 4.8,
      options: '1 Option',
    },
  ];

  // 🔹 Render Deal Cards
  const dealProduct = [
    { id: 0, offer: 'UP TO 50% OFF', name: 'Personal Care' },
    { id: 1, offer: 'UP TO 40% OFF', name: 'Cooking Essentials' },
    { id: 2, offer: 'UP TO 30% OFF', name: 'Packaged Food' },
    { id: 3, offer: 'UP TO 20% OFF', name: 'Pet Food & Toys' },
    { id: 4, offer: 'UP TO 10% OFF', name: 'Cleaning Essentials' },
    { id: 5, offer: 'UP TO 50% OFF', name: 'Beverages' },
  ];

  const popularProduct = [
    {
      id: 1,
      name: 'Banana',
      image: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg',
      price: 45,
      oldPrice: 60,
      discount: '₹15 OFF',
      weight: '6 pcs (~1 kg)',
      rating: 4.6,
      options: '2 Options',
    },
    {
      id: 2,
      name: 'Capsicum',
      image: 'https://images.pexels.com/photos/1435899/pexels-photo-1435899.jpeg',
      price: 35,
      oldPrice: 50,
      discount: '₹15 OFF',
      weight: '500 g',
      rating: 4.4,
      options: '3 Options',
    },
  ];

  const renderDealProduct = ({ item }: any) => (

    <View style={styles.cardDealMainView}>
      <View style={styles.cardDealView}>
        <View style={styles.cardDealOfferView}>
          <TextView style={styles.cardDealTxtOffer}>{item.offer}</TextView>
        </View>
      </View>
      <TextView style={styles.cardDealTxtProduct}>{item.name}</TextView>
    </View>
  );

  // 🔹 Grocery Section
  const renderGroceryKitchen = () => (
    <View style={styles.productHeadingMainView}>
      <View style={styles.productHeadingHeadingView}>
        <TextView style={styles.txtProductHeading}>Grocery & Kitchen</TextView>
        <Pressable
          onPress={() => navigation.navigate('BottomStackNavigator', { screen: 'Catogaries' })}
          style={{
            backgroundColor: "#1B5E20",
            paddingHorizontal: 6, // chhota size
            paddingVertical: 4,    // chhota height
            borderRadius: 25,
            marginTop: hp(-3),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#A5D6A7",
          }}
        >
          <TextView style={{ color: "#ffff", fontSize: 10, fontWeight: "700" }}>
            View All
          </TextView>
          <Icon
            name="chevron-right"
            color="#ffffff"
            family="MaterialCommunityIcons"
          />
        </Pressable>
      </View>


      {/* First row */}
      <View style={styles.groceryCardView}>
        {groceryCards.slice(0, 2).map((item) => (
          <Pressable
            key={item.id}
            style={{ alignItems: 'center' }}
            onPress={() =>
              navigation.navigate('CategoryDetail', { categoryId: item.id })
            }
          >
            <View style={styles.groceryCard1}>
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                  resizeMode="cover"
                />
              )}
            </View>
            <TextView style={styles.txtGrocery}>{item.name}</TextView>
          </Pressable>
        ))}
      </View>

      {/* Second row */}
      <View style={styles.groceryCardView}>
        {groceryCards.slice(2, 5).map((item) => (
          <Pressable
            key={item.id}
            style={{ alignItems: 'center' }}
            onPress={() =>
              navigation.navigate('CategoryDetail', { categoryId: item.id })
            }
          >
            <View style={styles.commonGroceryCard}>
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                  resizeMode="cover"
                />
              )}
            </View>
            <TextView style={styles.txtGrocery}>{item.name}</TextView>
          </Pressable>
        ))}
      </View>
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 🔹 Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerMainView}>
            <View style={styles.headerView}>
              <Pressable
                style={styles.profilePicView}
                onPress={() => navigation.navigate('Profile')}
              >
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s',
                  }}
                  style={styles.profilePic}
                />
              </Pressable>
              <View>
                <TextView style={styles.txtDelivery}></TextView>

              </View>
              <View style={styles.actionButtonView}>
                <Pressable onPress={() => navigation.navigate('Wallet')}>
                  <Image
                    source={Images.ic_wallet}
                    style={[styles.actionButton, { marginRight: hp(0.5) }]}
                  />
                </Pressable>
                <Image
                  source={Images.ic_notificaiton}
                  style={[styles.actionButton, { marginLeft: hp(0.5) }]}
                />
              </View>
            </View>
          </View>

          {/* 🔹 Search bar */}
          <Pressable
            style={styles.searchBox}
            onPress={() => navigation.navigate('Search')}
          >
            <View style={styles.searchView}>
              <Icon
                family="EvilIcons"
                name="search"
                color={Colors.PRIMARY[300]}
                size={30}
              />
              <InputText
                value={''}
                inputStyle={[styles.inputView]}
                editable={false}
                placeHolderTextStyle={Colors.PRIMARY[300]}
                placeholder="Search"
              />
            </View>
            <View style={styles.micView}>
              <View style={styles.divider} />
              <Icon
                family="FontAwesome"
                name="microphone"
                color={Colors.PRIMARY[300]}
                size={24}
              />
            </View>
          </Pressable>

          {/* 🔹 Category List */}
          <View style={styles.catListView}>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>

        {/* Products */}
        <View>
          <View style={styles.groceryCard}>
            <View style={styles.cardMainView}>
              <View>
                <TextView style={styles.txtOffer}>
                  50% OFF on Fresh {'\n'}grocery
                </TextView>
                <Image source={Images.ic_code} style={styles.imgCode} />
              </View>
              <View>
                <Image
                  source={Images.ic_vegatable}
                  style={styles.imgVegatable}
                />
              </View>
            </View>
          </View>
        </View>



        {/* 🔹 Product List */}
        <View style={styles.groceryCard}>
          <ProductCard cardArray={products} type="OFFER" horizontal />
        </View>

        {/*  EXPLORE BUTTON */}
        <View style={styles.buttonView}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BottomStackNavigator', { screen: 'Catogaries' })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1B5E20',
              borderWidth: 3,
              borderColor: '#1B5E20',
              borderRadius: 30,
              height: 54,
              paddingHorizontal: 36,
              elevation: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
            }}
          >
            <TextView
              style={{
                color: '#FFFFFF',
                fontSize: 17,
                fontWeight: '400',
                marginRight: 5,
                top: -1,
              }}
            >
              Explore
            </TextView>

            <Icon
              name="chevron-right"
              size={26}
              color="#ffffff"
              family="MaterialCommunityIcons"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>
        {/* 🔹 Grocery Section */}
        <View>{renderGroceryKitchen()}</View>


        {/* Frequently Bought */}
        <View>
          <View style={styles.productHeadingMainView}>
            <View style={styles.productHeadingHeadingView}>
              <TextView style={styles.txtProductHeading}>Frequently Bought</TextView>
              <Pressable
                onPress={() => navigation.navigate('BottomStackNavigator', { screen: 'Catogaries' })}
                style={{
                  backgroundColor: "#1B5E20",
                  paddingHorizontal: 6, // chhota size
                  paddingVertical: 4,    // chhota height
                  borderRadius: 25,
                  marginTop: hp(-3),
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#A5D6A7",
                }}
              >
                <TextView style={{ color: "#ffff", fontSize: 10, fontWeight: "700" }}>
                  View All
                </TextView>
                <Icon
                  name="chevron-right"
                  color="#ffffff"
                  family="MaterialCommunityIcons"
                />
              </Pressable>
            </View>
          </View>
          <ProductCard
            cardArray={Product2}
            horizontal
            type="BOUGHT"
            navigation={navigation}
            onPress={() => navigation.navigate('Products')}  // <-- Yeh line add kar do
          />
        </View>


        {/* 🔹 Deal Of The Day */}
        <View>
          <Image source={Images.img_deal} style={styles.imgDeal} />
          <FlatList
            data={dealOfTheDay}                    // ← Real API data
            renderItem={renderDealProduct}
            contentContainerStyle={{ alignSelf: 'center', marginTop: hp(2) }}
            numColumns={3}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* Deal Banner */}
        <View>
          <Image source={Images.img_banner} style={styles.imgBanner} />
        </View>



        {/* 🔹 Popular Products */}
        <View>
          <View style={styles.productHeadingMainView}>
            <View style={styles.productHeadingHeadingView}>
              <TextView style={styles.txtProductHeading}>Popular Products</TextView>
              <Pressable
                onPress={() => navigation.navigate('BottomStackNavigator', { screen: 'Catogaries' })}
                style={{
                  backgroundColor: "#1B5E20",
                  paddingHorizontal: 6, // chhota size
                  paddingVertical: 4,    // chhota height
                  borderRadius: 25,
                  marginTop: hp(-3),
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#A5D6A7",
                }}
              >
                <TextView style={{ color: "#ffff", fontSize: 10, fontWeight: "700" }}>
                  View All
                </TextView>
                <Icon
                  name="chevron-right"
                  color="#ffffff"
                  family="MaterialCommunityIcons"
                />
              </Pressable>
            </View>
          </View>
          <ProductCard cardArray={popularProduct} horizontal type="BOUGHT" navigation={navigation} />
        </View>

        {/* Fresh Fruits Section */}
        <View style={{ marginTop: hp(2) }}>
          <View style={styles.productHeadingMainView}>
            <View style={styles.productHeadingHeadingView}>
              <TextView style={styles.txtProductHeading}>Fresh Fruits</TextView>
              <Pressable
                onPress={() => navigation.navigate('BottomStackNavigator', { screen: 'Catogaries' })}
                style={{
                  backgroundColor: "#1B5E20",
                  paddingHorizontal: 6, // chhota size
                  paddingVertical: 4,    // chhota height
                  borderRadius: 25,
                  marginTop: hp(-3),
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#A5D6A7",
                }}
              >
                <TextView style={{ color: "#ffff", fontSize: 10, fontWeight: "700" }}>
                  View All
                </TextView>
                <Icon
                  name="chevron-right"
                  color="#ffffff"
                  family="MaterialCommunityIcons"
                />
              </Pressable>
            </View>
          </View>

          {/* Dynamic Data from API */}
          <ProductCard
            cardArray={freshFood}
            horizontal
            type="FRUITS"
          />
        </View>

        {/* Bottom Banner with Explore */}
        <View>
          <Image source={Images.img_banner_off} style={styles.imgBanner} />
          {/*  EXPLORE BUTTON */}
          <View style={styles.buttonView}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('BottomStackNavigator', { screen: 'Catogaries' })}

              style={{
                marginTop: hp(-4),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1B5E20',
                borderWidth: 3,
                borderColor: '#1B5E20',
                borderRadius: 30,
                height: 54,
                paddingHorizontal: 36,
                elevation: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                
              }}
            >
              <TextView
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '500',
                  marginRight: 0,
                  top: -1,
                }}
              >
                Explore
              </TextView>

              <Icon
                name="chevron-right"
                size={28}
                color="#ffffff"
                family="MaterialCommunityIcons"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 🔹 Limited Time deals */}
        <View>
          <View style={styles.productHeadingMainView}>
            <View style={styles.productHeadingHeadingView}>
              <TextView style={styles.txtProductHeading}>
                Limited Time deals
              </TextView>
              <Pressable
                onPress={() => navigation.navigate('BottomStackNavigator', { screen: 'Catogaries' })}
                style={{
                  backgroundColor: "#1B5E20",
                  paddingHorizontal: 6, // chhota size
                  paddingVertical: 4,    // chhota height
                  borderRadius: 25,
                  marginTop: hp(-3),
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#A5D6A7",
                }}
              >
                <TextView style={{ color: "#ffff", fontSize: 10, fontWeight: "700" }}>
                  View All
                </TextView>
                <Icon
                  name="chevron-right"
                  color="#ffffff"
                  family="MaterialCommunityIcons"
                />
              </Pressable>
            </View>
          </View>
          <ProductCard cardArray={popularProduct} type="LIMITED" horizontal />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

// 🔹 Transform API product → ProductCardItem
const transformProductToCard = (product: Product): ProductCardItem => {
  const variant = product.variants[0];
  const imageUrl = variant?.images?.[0] || product.images?.[0] || '';

  return {
    id: product._id,
    name: product.name,
    image: IMAGE_BASE_URL + imageUrl,
    price: variant?.price || product.price || 0,
    oldPrice: variant?.originalPrice || product.mrp || 0,
    discount: variant?.discount ? `₹${variant.discount} OFF` : '',
    weight: `${variant?.stock || 1} ${variant?.unit || ''}`,
    rating: 4.5,
    options: `${product.variants.length} Option${product.variants.length > 1 ? 's' : ''}`,
  };
};