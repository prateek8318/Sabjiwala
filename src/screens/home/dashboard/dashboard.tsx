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
  Modal,
} from 'react-native';
import styles from './dashboard.styles';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
export const CategoryIcons: Record<string, any> = {
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
import { LocalStorage } from '../../../helpers/localstorage';
import { reverseGeocode } from '../../../helpers/geocoding';

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
  const [userAddress, setUserAddress] = useState<string>('Fetching location...');
  const [addressList, setAddressList] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState<string>('Delivery In 10 Mins');
  const [loading, setLoading] = useState<boolean>(false);
  const [productLoading, setProductLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [groceryCards, setGroceryCards] = useState<
    { id: string; name: string; image?: string }[]
  >([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);


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
  const formatAddress = (addr: any) => {
    if (!addr) return '';
    const parts: string[] = [];
    if (addr.houseNoOrFlatNo) parts.push(addr.houseNoOrFlatNo);
    if (addr.floor) parts.push(`Floor ${addr.floor}`);
    if (addr.landmark) parts.push(addr.landmark);
    if (addr.city) parts.push(addr.city);
    if (addr.pincode) parts.push(addr.pincode);
    return parts.filter(Boolean).join(', ');
  };

  const fetchSavedAddress = async () => {
    try {
      const res = await ApiService.getAddresses();
      const list = res?.data?.address?.[0]?.addresses || [];
      setAddressList(list);
      if (!Array.isArray(list) || list.length === 0) return false;

      const storedId = await LocalStorage.read('@selectedAddressId');
      const matched = list.find((item: any) => item?._id === storedId);
      const primary = matched || list.find((item: any) => item?.isDefault) || list[0];
      const formatted = formatAddress(primary) || 'Tap to set location';

      setSelectedAddressId(primary?._id || null);
      setUserAddress(formatted);
      if (primary?._id) {
        await LocalStorage.save('@selectedAddressId', primary._id);
      }
      return true;
    } catch (err) {
      console.log('fetchSavedAddress error:', err);
      return false;
    }
  };

  const fetchUserLocation = async () => {
    try {
      console.log('Fetching user profile...');
      const res = await ApiService.getUserProfile();
  
      console.log('Full Response:', JSON.stringify(res.data, null, 2));
  
      const user = res.data.user || res.data;
  
      if (!user) {
        console.log('No user data found');
        setUserAddress('Tap to set location');
        return;
      }

      if (user.profileImage) {
        setProfileImage(user.profileImage);
      }
  
      const lat = user.lat || user.location?.coordinates?.[1];
      const lng = user.long || user.location?.coordinates?.[0];
  
      console.log('Extracted Lat:', lat);
      console.log('Extracted Lng:', lng);
  
      if (!lat || !lng) {
        console.log('No coordinates found in user data');
        setUserAddress('Tap to set location');
        return;
      }
  
      // Agar backend ne address diya ho
      if (user.address && user.address.trim()) {
        console.log('Address from backend:', user.address);
        setUserAddress(user.address);
        return;
      }
  
      const geoData = await reverseGeocode(Number(lat), Number(lng));
      const shortAddress =
        geoData.landmark ||
        [geoData.houseNumber, geoData.landmark, geoData.city].filter(Boolean).join(', ') ||
        geoData.formattedAddress ||
        'Current Location';

      setUserAddress(shortAddress);
  
    } catch (err: any) {
      console.error('fetchUserLocation FAILED:', err);
      console.error('Error message:', err.message);
      setUserAddress('H-146, Sector-63, Noida');
    }
  };

  const handleAddressSelect = async (addr: any) => {
    try {
      if (addr?._id) {
        try {
          await ApiService.setDefaultAddress(addr._id);
        } catch (e) {
          console.log('setDefaultAddress failed, continuing:', e);
        }
        await LocalStorage.save('@selectedAddressId', addr._id);
      }
      setSelectedAddressId(addr?._id || null);
      setUserAddress(formatAddress(addr) || 'Tap to set location');
    } finally {
      setShowAddressPicker(false);
    }
  };

  // Load cached user image immediately (no network)
  const loadCachedUser = useCallback(async () => {
    try {
      const saved = await LocalStorage.read('@user');
      if (saved) {
        if (saved?.profileImage) setProfileImage(saved.profileImage);
      }
    } catch (err) {
      console.log('loadCachedUser error', err);
    }
  }, []);
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
    (async () => {
      await loadCachedUser();
      const hasSaved = await fetchSavedAddress();
      if (!hasSaved) {
        fetchUserLocation();
      }
    })();
  }, []);

  useEffect(() => {
    fetchProducts(selectedCat);
  }, [selectedCat]);

  // Refresh profile image whenever we return to this screen
  useFocusEffect(
    useCallback(() => {
      loadCachedUser();
      fetchUserLocation();
    }, [loadCachedUser])
  );

  // 🧠 Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories(true);
    fetchStaticContent(true);
    fetchHomeProductContent(true);
    fetchProducts(selectedCat);
    (async () => {
      const hasSaved = await fetchSavedAddress();
      if (!hasSaved) {
        fetchUserLocation();
      }
    })();

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


  // 🔹 Render Deal Cards
  const renderDealProduct = ({ item }: { item: ProductCardItem }) => (

    <View style={styles.cardDealMainView}>
      <View style={styles.cardDealView}>
        <View style={styles.cardDealOfferView}>
          <TextView style={styles.cardDealTxtOffer}>{item.discount}</TextView>
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


  const headerProfileImage = profileImage
    ? (profileImage.startsWith('http') ? profileImage : `${IMAGE_BASE_URL}${profileImage}`)
    : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s';

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
                <Image source={{ uri: headerProfileImage }} style={styles.profilePic} />
              </Pressable>
              <Pressable onPress={() => setShowAddressPicker(true)}>
                <TextView style={styles.txtDelivery}>{deliveryTime}</TextView>
                <View style={styles.addressView}>
                  <Icon family="EvilIcons" name="location" color={Colors.PRIMARY[300]} size={24} />
                  <TextView style={styles.txtAddress} numberOfLines={1}>
                    {userAddress}
                  </TextView>
                  <Icon family="Entypo" name="chevron-down" color={Colors.PRIMARY[300]} size={24} />
                </View>
              </Pressable>
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
          <View style={styles.searchBox}>
            <Pressable
              style={[styles.searchView, { flex: 1 }]}
              onPress={() => navigation.navigate('Search')}
            >
              <Icon
                family="EvilIcons"
                name="search"
                color={Colors.PRIMARY[300]}
                size={30}
              />
              <InputText
                value={''}
                inputStyle={styles.inputView}
                editable={false}
                placeHolderTextStyle={Colors.PRIMARY[300]}
                placeholder="Search"
              />
            </Pressable>
            <Pressable
              style={styles.micView}
              onPress={() => navigation.navigate('Search', { startVoice: true })}
            >
              <View style={styles.divider} />
              <Icon
                family="FontAwesome"
                name="microphone"
                color={Colors.PRIMARY[300]}
                size={24}
              />
            </Pressable>
          </View>

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
                fontSize: 14,  // screen width के हिसाब से font size
                fontWeight: '400',
                marginRight: wp(1),  // horizontal spacing responsive
                top: -hp(0.2),       // vertical alignment responsive
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
            cardArray={favorite}
            horizontal
            type="BOUGHT"
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
        <ProductCard cardArray={recommended} horizontal type="BOUGHT" />
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
          <ProductCard cardArray={dealOfTheDay} type="LIMITED" horizontal />
        </View>
      </ScrollView>

      {/* Address Picker */}
      <Modal
        visible={showAddressPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddressPicker(false)}
      >
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setShowAddressPicker(false)}>
          <View
            style={{
              backgroundColor: '#fff',
              marginTop: hp(12),
              marginHorizontal: wp(4),
              borderRadius: 14,
              padding: wp(4),
              maxHeight: hp(50),
            }}
          >
            <TextView style={{ fontSize: 18, fontWeight: '700', color: '#000', marginBottom: hp(1) }}>
              Select delivery address
            </TextView>

            <ScrollView>
              {addressList.map((addr) => {
                const isSelected = selectedAddressId === addr._id;
                return (
                  <Pressable
                    key={addr._id}
                    onPress={() => handleAddressSelect(addr)}
                    style={{
                      paddingVertical: hp(1.6),
                      borderBottomWidth: 1,
                      borderColor: '#eee',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: wp(2),
                    }}
                  >
                    <Icon
                      family="MaterialCommunityIcons"
                      name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={22}
                      color={isSelected ? Colors.PRIMARY[100] : '#999'}
                    />
                    <View style={{ flex: 1 }}>
                      <TextView style={{ color: '#000', fontWeight: '700' }}>
                        {addr.addressType || 'Home'}
                      </TextView>
                      <TextView style={{ color: '#555', marginTop: 2 }}>
                        {formatAddress(addr)}
                      </TextView>
                    </View>
                  </Pressable>
                );
              })}

              {addressList.length === 0 && (
                <TextView style={{ color: '#666', marginTop: hp(1) }}>
                  No saved addresses. Add one first.
                </TextView>
              )}
            </ScrollView>

            <LinearButton
              title="Add Address"
              onPress={() => {
                setShowAddressPicker(false);
                navigation.navigate('AddAddress');
              }}
              style={{ marginTop: hp(2) }}
            />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Dashboard;

// 🔹 Transform API product → ProductCardItem
const transformProductToCard = (product: Product): ProductCardItem => {
  const variant =
    (product as any)?.ProductVarient?.[0] ||
    (product as any)?.variants?.[0] ||
    {};
  const images =
    variant?.images ||
    (product as any)?.primary_image ||
    (product as any)?.images ||
    [];
  const imageUrl = images?.[0] || '';

  return {
    id: (product as any)?._id || '',
    name: (product as any)?.productName || (product as any)?.name || 'Product',
    image: imageUrl ? IMAGE_BASE_URL + imageUrl : '',
    price: variant?.price || (product as any)?.price || 0,
    oldPrice: variant?.originalPrice || (product as any)?.mrp || 0,
    discount: variant?.discount ? `₹${variant.discount} OFF` : '',
    weight: `${variant?.stock || 1} ${variant?.unit || ''}`,
    rating: 4.5,
    options: `${((product as any)?.ProductVarient || (product as any)?.variants || []).length} Option${(((product as any)?.ProductVarient || (product as any)?.variants || []).length || 0) > 1 ? 's' : ''}`,
  };
};