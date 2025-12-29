import React, { FC, useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  FlatList,
  RefreshControl,
  Modal,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './dashboard.styles';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


import {
  CommonLoader,
  TextView,
  LinearButton,
  BannerCarousel,
} from '../../../components';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../constant/dimentions';
import { Colors, Icon, Images } from '../../../constant';
// 🔹 Local Category Icons Mapping (fallback + "All")
export const CategoryIcons: Record<string, any> = {
  all: require('../../../assets/images/catogaries/all.png'),
  bread1: require('../../../assets/images/catogaries/bread.png'),
  vegetables: require('../../../assets/images/catogaries/vegetables.png'),
  milk: require('../../../assets/images/catogaries/milk.png'),
  egg: require('../../../assets/images/catogaries/egg.png'),
};

// 🔹 Static rotating search placeholders (can be extended if needed)
const SEARCH_PLACEHOLDERS = [
  'Search for Grocery',
  'Search for Beverages',
  'Search for Dairy & Bakery',
];

const TAB_BAR_BASE_STYLE = {
  height: 80,
  borderTopWidth: 0,
  backgroundColor: 'transparent',
};

import InputText from '../../../components/InputText/TextInput';
import ProductCard from './components/ProductCard/productCard';
import ApiService, { IMAGE_BASE_URL } from '../../../service/apiService';
import { Product, ProductCardItem, SubCategory } from '../../../@types';
import { LocalStorage } from '../../../helpers/localstorage';
import { reverseGeocode } from '../../../helpers/geocoding';
import { SafeAreaView } from 'react-native-safe-area-context';

type DashboardScreenNavigationType = NativeStackNavigationProp<any, 'Dashboard'>;

const Dashboard: FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationType>();

  const [categories, setCategories] = useState<SubCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [products, setProducts] = useState<ProductCardItem[]>([]);
  const [banners, setBanners] = useState<string[]>([]);
  const [exploreSections, setExploreSections] = useState<any[]>([]);
  const [dealBanner, setDealBanner] = useState<string[]>([]);


  const [dealOfTheDay, setDealOfTheDay] = useState<ProductCardItem[]>([]);
  const [recommended, setRecommended] = useState<ProductCardItem[]>([]);
  const [favorite, setFavorite] = useState<ProductCardItem[]>([]);
  const [freshFood, setFreshFood] = useState<ProductCardItem[]>([]);
  const [userAddress, setUserAddress] = useState<string>('Fetching location...');
  // Remember if we already have a valid address so it doesn't get overwritten by placeholder text
  const [hasResolvedAddress, setHasResolvedAddress] = useState(false);
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
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [recentlyAddedProducts, setRecentlyAddedProducts] = useState<any[]>([]);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const bounceValue = useRef(new Animated.Value(0)).current;
  const [isTabHidden, setIsTabHidden] = useState(false);
  const lastScrollY = useRef(0);
  const [searchPlaceholderIndex, setSearchPlaceholderIndex] = useState(0);
  const searchPlaceholderAnim = useRef(new Animated.Value(1)).current;

  // Build clean image URL from API response (PURA "public/..." path rakhna hai)
  const buildCategoryImageUrl = (rawPath?: string) => {
    if (!rawPath) {
      return null;
    }

    const cleaned = rawPath
      .replace(/\\/g, '/')
      .replace(/^\//, '');

    return `${IMAGE_BASE_URL}${cleaned}`;
  };

  // 🔹 Rotate search placeholder with fade-up animation
  useEffect(() => {
    if (SEARCH_PLACEHOLDERS.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      // Fade out current text
      Animated.timing(searchPlaceholderAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        // Change text
        setSearchPlaceholderIndex(prev => (prev + 1) % SEARCH_PLACEHOLDERS.length);

        // Fade in new text
        searchPlaceholderAnim.setValue(0);
        Animated.timing(searchPlaceholderAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [searchPlaceholderAnim]);

  // Prefer dynamic image from API; fallback to local icon map + "All"
  const getCategoryImageSource = (item: SubCategory) => {
    if (item._id === 'all') return CategoryIcons['all'];

    const dynamicUri = buildCategoryImageUrl(item.image);
    if (dynamicUri) return { uri: dynamicUri };

    const key = item.name?.toLowerCase().replace(/ /g, '') || '';
    return CategoryIcons[key] || CategoryIcons['all'];
  };


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

      // Agar koi bhi address select / default mil gaya ho toh
      // "Tap to set location" ka placeholder kabhi mat dikhana.
      const formatted =
        formatAddress(primary) ||
        primary?.address || // backend se consolidated address aa rha ho toh
        primary?.addressType || // kam se kam "Home / Work" dikh jaye
        'Saved address';

      setSelectedAddressId(primary?._id || null);
      setUserAddress(formatted);
      setHasResolvedAddress(true);
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
        if (!hasResolvedAddress) {
          setUserAddress('Tap to set location');
        }
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
        if (!hasResolvedAddress) {
          setUserAddress('Tap to set location');
        }
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
      setHasResolvedAddress(true);

    } catch (err: any) {
      console.error('fetchUserLocation FAILED:', err);
      console.error('Error message:', err.message);
      if (!hasResolvedAddress) {
        setUserAddress('H-146, Sector-63, Noida');
      }
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

      // Yahan bhi selected address ke baad placeholder text nahi aana chahiye
      const formatted =
        formatAddress(addr) ||
        addr?.address ||
        addr?.addressType ||
        'Saved address';
      setUserAddress(formatted);
      setHasResolvedAddress(true);
    } finally {
      setShowAddressPicker(false);
    }
  };

  // Load cached user image immediately (no network)
  const loadCachedUser = useCallback(async () => {
    try {
      let saved = await LocalStorage.read('@user');
      if (saved) {
        // Agar purana data string form me ho (double stringify), toh parse karne ki koshish karo
        if (typeof saved === 'string') {
          try {
            saved = JSON.parse(saved);
          } catch (e) {
            // ignore parse error
          }
        }

        if (saved?.profileImage) {
          setProfileImage(saved.profileImage);
        }
      }
    } catch (err) {
      console.log('loadCachedUser error', err);
    }
  }, []);

  const handleNotificationPress = useCallback(async () => {
    try {
      const token = await LocalStorage.read('fcm_token');
      console.log('[FCM] dashboard icon token', token || 'no token saved');
    } catch (err) {
      console.log('[FCM] dashboard icon token read error', err);
    }
    navigation.navigate('Notifications');
  }, [navigation]);

  useEffect(() => {
    const tabNavigator = navigation.getParent?.()?.getParent?.();
    if (!tabNavigator) return;

    if (isTabHidden) {
      tabNavigator.setOptions({
        tabBarStyle: [{ ...TAB_BAR_BASE_STYLE }, { display: 'none' }],
      });
    } else {
      tabNavigator.setOptions({
        tabBarStyle: TAB_BAR_BASE_STYLE,
      });
    }

    return () => {
      tabNavigator.setOptions({ tabBarStyle: TAB_BAR_BASE_STYLE });
    };
  }, [isTabHidden, navigation]);
  // Fetch Static Home Content (Banners + Categories + Explore)
  const fetchStaticContent = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await ApiService.getHomeStaticData();

      const data = response.data.data;

      // Banners - Process and build full URLs
      const processedBanners = (data.banners || []).map((banner: any) => {
        const raw = banner?.image || '';
        const cleaned = raw.replace(/\\/g, '/').replace(/^\//, '');
        return cleaned ? `${IMAGE_BASE_URL}${cleaned}` : '';
      }).filter((url: string) => url !== '');
      setBanners(processedBanners);

      // Categories (SubCategories)
      const apiCats: SubCategory[] = data.categories || [];
      const allCat: SubCategory = { _id: 'all', name: 'All' };
      //       setCategories([allCat, ...apiCats]);

      const mappedGroceryCards = apiCats.map((item: SubCategory) => {
        const raw = item.image || '';
        const cleaned = raw.replace(/\\/g, '/').replace(/^\//, '');
        const finalUrl = cleaned ? `${IMAGE_BASE_URL}${cleaned}` : undefined;
        console.log('GroceryCard Image → id:', item?._id, '| name:', item?.name, '| raw:', raw, '| final:', finalUrl);
        return {
          id: item._id,
          name: item.name,
          image: finalUrl,
        };
      });
      setGroceryCards(mappedGroceryCards);

      // Explore Sections
      setExploreSections(data.explore || []);

      // Deal Banner - Handle both single object and array
      let processedDealBanners: string[] = [];
      if (data.dealBanner) {
        // If dealBanner is an array
        if (Array.isArray(data.dealBanner)) {
          processedDealBanners = data.dealBanner
            .map((banner: any) => {
              const raw = banner?.image || '';
              const cleaned = raw.replace(/\\/g, '/').replace(/^\//, '');
              return cleaned ? `${IMAGE_BASE_URL}${cleaned}` : '';
            })
            .filter((url: string) => url !== '');
        }
        // If dealBanner is a single object
        else if (data.dealBanner.image) {
          const raw = data.dealBanner.image;
          const cleaned = raw.replace(/\\/g, '/').replace(/^\//, '');
          const finalUrl = cleaned ? `${IMAGE_BASE_URL}${cleaned}` : '';
          if (finalUrl) {
            processedDealBanners = [finalUrl];
          }
        }
      }
      console.log('DealBanner Images → processed:', processedDealBanners);
      setDealBanner(processedDealBanners);
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
        const variant = product?.ProductVarient?.[0] || product?.variants?.[0] || {};
        const preferredImages =
          (Array.isArray(variant?.images) && variant.images.length > 0
            ? variant.images
            : null) ||
          (Array.isArray(product?.primary_image) && product.primary_image.length > 0
            ? product.primary_image
            : null) ||
          (Array.isArray(product?.images) && product.images.length > 0
            ? product.images
            : []);

        const normalizedImages =
          (preferredImages || [])
            .map((img: string) => (img || '').replace(/\\/g, '/').replace(/^\//, ''))
            .filter(Boolean)
            .map((img: string) => `${IMAGE_BASE_URL}${img}`);

        const rawImage = preferredImages?.[0] || '';
        const normalizedImage = rawImage ? rawImage.replace(/\\/g, '/').replace(/^\//, '') : '';
        const fullImageUrl = normalizedImage ? IMAGE_BASE_URL + normalizedImage : '';

        const weightValue =
          variant?.weight ??
          product?.weight ??
          variant?.stock ??
          product?.stock ??
          1;
        const unitValue = variant?.unit ?? product?.unit ?? '';

        return {
          id: product?._id || '',
          name: product?.productName || product?.name || 'Product',
          image: fullImageUrl,
          images: normalizedImages,
          price: variant?.price || product?.price || 0,
          oldPrice: variant?.originalPrice || product?.mrp || 0,
          discount: variant?.discount ? `₹${variant.discount} OFF` : '',
          weight: `${weightValue} ${unitValue}`.trim(),
          rating: product?.rating || 4.5,
          options: `${(product?.ProductVarient || product?.variants || []).length} Option${((product?.ProductVarient || product?.variants || []).length || 0) > 1 ? 's' : ''}`,
          variantId:
            variant?._id ||
            product?.ProductVarient?.[0]?._id ||
            product?.variants?.[0]?._id ||
            '',
          ProductVarient: product?.ProductVarient || product?.variants || [],
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
      (async () => {
        const hasSaved = await fetchSavedAddress();
        if (!hasSaved) {
          fetchUserLocation();
        }
      })();
    }, [loadCachedUser])
  );

  const loadCart = useCallback(async () => {
  try {
    const res = await ApiService.getCart();
    const cartData =
      res?.data?.cart?.products ||
      res?.data?.products ||
      res?.data?.items ||
      res?.data?.data?.items ||
      [];

    const newCartItems = Array.isArray(cartData) ? cartData : [];
    setCartItems(newCartItems);

    // 🔹 Critical fix: Jab cart empty ho jaye, recentlyAddedProducts bhi clear kar do
    if (newCartItems.length === 0) {
      setRecentlyAddedProducts([]);
    } else if (recentlyAddedProducts.length > 0) {
      // Sirf delay se clear karo jab cart me items ho (animation ke liye)
      setTimeout(() => setRecentlyAddedProducts([]), 1200);
    }
  } catch (err) {
    console.log('Cart load error:', err);
    setCartItems([]);
    setRecentlyAddedProducts([]); // Error par bhi clear
  }
}, [recentlyAddedProducts.length]);

  // Refresh cart when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCart();
    });
    return unsubscribe;
  }, [navigation, loadCart]);

  // Also load cart on initial mount
  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

  useEffect(() => {
    if (!lastAddedId) return;
    bounceValue.setValue(0);
    Animated.sequence([
      Animated.timing(bounceValue, {
        toValue: -12,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.spring(bounceValue, {
        toValue: 0,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [lastAddedId, bounceValue]);

  const handleProductAdded = (product: any) => {
    const productImage =
      product?.image ||
      product?.variants?.[0]?.images?.[0] ||
      product?.ProductVarient?.[0]?.images?.[0] ||
      product?.primary_image?.[0];

    const productWithImage = {
      ...product,
      image: productImage,
    };

    setRecentlyAddedProducts(prev => {
      const filtered = prev.filter(
        p => (p.id || p._id) !== (product.id || product._id)
      );
      return [productWithImage, ...filtered].slice(0, 3);
    });

    setLastAddedId(
      (product.id || product._id || Date.now().toString()).toString()
    );

    const newCartItem = {
      productId: {
        _id: product.id || product._id,
        name: product.name,
        images: [
          product.image ||
          product?.variants?.[0]?.images?.[0] ||
          product?.ProductVarient?.[0]?.images?.[0],
        ].filter(Boolean),
      },
      quantity: 1,
    };

    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item =>
          (item.productId?._id || item.productId) ===
          (product.id || product._id)
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 1) + 1,
        };
        return updated;
      }
      return [newCartItem, ...prev];
    });

    loadCart();
  };

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
    const imageSource = getCategoryImageSource(item);

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
          source={imageSource}
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


  // 🔹 Render Explore Section Cards
  const renderDealProduct = ({ item }: { item: any }) => {
    const exploreSectionId = item._id;
    const exploreSectionName = item.name;
    const discountValue = item.discountValue || 0;
    const discountType = item.discountType || 'percentage';

    // Build image URL - match existing pattern
    const rawImage = item.image || '';
    const normalizedImage = rawImage ? rawImage.replace('public\\', '').replace(/\\/g, '/') : '';
    const fullImageUrl = normalizedImage ? IMAGE_BASE_URL + normalizedImage : '';

    return (
      <Pressable
        style={styles.cardDealMainView}
        onPress={() => {
          if (exploreSectionId) {
            navigation.navigate('ExploreListing', {
              exploreSectionId,
              exploreSectionName,
            });
          }
        }}
      >
        <View style={styles.cardDealView}>
          <View style={styles.cardDealOfferView}>
            <TextView style={styles.cardDealTxtOffer}>
              {discountType === 'percentage' ? `UP TO ${discountValue}% OFF` : `UP TO ₹${discountValue} OFF`}
            </TextView>
          </View>
          <View style={styles.cardDealImageWrapper}>
            {fullImageUrl ? (
              <Image
                source={{ uri: fullImageUrl }}
                style={styles.cardDealImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.cardDealImagePlaceholder}>
                <Icon
                  family="MaterialCommunityIcons"
                  name="image-off"
                  color={Colors.PRIMARY[200]}
                  size={24}
                />
              </View>
            )}
          </View>
        </View>
        <TextView style={styles.cardDealTxtProduct}>{exploreSectionName}</TextView>
      </Pressable>
    );
  };

  // 🔹 Grocery Section
  const renderGroceryKitchen = () => (
    <View style={styles.productHeadingMainView}>
      <View style={styles.productHeadingHeadingView}>
        <TextView style={styles.txtProductHeading}>Grocery & Kitchen</TextView>
        <Pressable
          onPress={() => navigation.navigate('BottomStackNavigator', { screen: 'Catogaries' })}
          style={{

          }}
        >
          <TextView style={{ color: "#000", fontSize: 14, fontWeight: "800" }}>
            view more
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
              navigation.navigate('Catogaries', {
                screen: 'subCategoryList',
                params: {
                  categoryId: item.id,
                  categoryName: item.name,
                },
              })
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
              navigation.navigate('Catogaries', {
                screen: 'subCategoryList',
                params: {
                  categoryId: item.id,
                  categoryName: item.name,
                },
              })
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


  // Profile image normalize: agar server se pure URL aaye to direct use,
  // warna IMAGE_BASE_URL + relative path (jo '@user.profileImage' me aa raha hai)
  const headerProfileImage = profileImage
    ? (profileImage.startsWith('http') || profileImage.startsWith('file:')
      ? profileImage
      : `${IMAGE_BASE_URL}${profileImage}`)
    : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s';
  const cartItemCount = (cartItems || []).reduce(
    (sum, item) => sum + (item?.quantity || 1),
    0,
  ) || recentlyAddedProducts.length;

  const searchPlaceholderAnimatedStyle = {
    opacity: searchPlaceholderAnim,
    transform: [
      {
        translateY: searchPlaceholderAnim.interpolate({
          inputRange: [0, 2],
          outputRange: [4, 0], // हल्का सा fade-up effect
        }),
      },
    ],
  };

  const handleScroll = useCallback(
    (event: any) => {
      const currentOffset = event?.nativeEvent?.contentOffset?.y ?? 0;
      const diff = currentOffset - lastScrollY.current;

      if (currentOffset <= 10) {
        if (isTabHidden) setIsTabHidden(false);
        lastScrollY.current = currentOffset;
        return;
      }

      if (diff > 8 && !isTabHidden) {
        setIsTabHidden(true);
      } else if (diff < -8 && isTabHidden) {
        setIsTabHidden(false);
      }

      lastScrollY.current = currentOffset;
    },
    [isTabHidden],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.PRIMARY[100] }}
      edges={['top']}
    >
      <View style={styles.container}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: hp(6) }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          stickyHeaderIndices={[1]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* 🔹 Header */}
          <View
            style={[
              styles.headerContainer,
              { paddingTop: hp(0) },
            ]}
          >
            <Image
              source={require('../../../assets/images/style.png')}
              style={{
                width: '100%',
                height: hp(9),
                opacity: 0.6,
                position: 'absolute',
                top: 0,
                resizeMode: 'contain',
              }}
            />
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
                      style={[styles.actionButton, { marginRight: hp(0.8) }]}
                    />
                  </Pressable>
                  <Pressable onPress={handleNotificationPress}>
                    <Image
                      source={Images.ic_notificaiton}
                      style={[styles.actionButton, { marginLeft: hp(0.5), marginRight: hp(0.5) }]}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* 🔹 Sticky Search + Categories (with gradient background) */}
          <LinearGradient
            colors={['#5A875C', '#015304']}
            start={{ x: 1, y: 1.3 }}
            end={{ x: 1, y: 0.2 }}
            style={styles.stickyHeaderContainer}
          >
            <View style={styles.searchBox} pointerEvents="box-none">
              <Pressable
                style={[styles.searchView, { flex: 1 }]}
                hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
                onPress={() => navigation.navigate('Search')}
              >
                <Icon
                  family="EvilIcons"
                  name="search"
                  color={Colors.PRIMARY[300]}
                  size={34}
                  style={{ marginTop: hp(-1) }}
                />
                <Animated.View style={[{ flex: 1 }, searchPlaceholderAnimatedStyle]}>
                  <InputText
                    value={''}
                    inputStyle={styles.inputView}
                    editable={false}
                    placeHolderTextStyle={Colors.PRIMARY[300]}
                    placeholder={SEARCH_PLACEHOLDERS[searchPlaceholderIndex]}
                  />
                </Animated.View>
              </Pressable>
              <Pressable
                style={styles.micView}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                onPress={() => navigation.navigate('Search', { startVoice: true })}
              >
                <View style={styles.divider} />
                <Icon
                  family="FontAwesome"
                  name="microphone"
                  color={Colors.PRIMARY[300]}
                  size={20}
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
          </LinearGradient>

          {/* Products */}
          <View>
            <View style={styles.groceryCard}>
              <View style={styles.cardMainView}>
                <View>
                  <TextView style={styles.txtOffer}>
                    50% OFF on {'\n'}Fresh grocery
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
              {/* 🔹 Product List */}
              <ProductCard
                cardArray={products}
                type="OFFER"
                horizontal
                onProductAdded={handleProductAdded}
              />

            </View>
          </View>





          {/*  EXPLORE BUTTON */}
          <View style={styles.buttonView}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('BottomStackNavigator', { screen: 'Catogaries' })
              }
            >
              <LinearGradient
                colors={['#5A875C', '#015304']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: '100%', // follow responsive width from buttonView so not too wide on tablets
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 999,
                  paddingVertical: hp(1.5), // responsive height
                  paddingHorizontal: wp(1),
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
                    fontFamily: 'Poppins-Regular',
                    fontSize: wp(4.5), // responsive font size
                    fontWeight: '400',
                    marginLeft: wp(1.2),
                  }}
                >
                  Explore
                </TextView>

                <Icon
                  name="chevron-right"
                  family="MaterialCommunityIcons"
                  size={22}
                  color="#FFFFFF"
                  style={{ marginLeft: wp(1.5) }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {/* 🔹 Grocery Section */}
          <View>{renderGroceryKitchen()}</View>


          {/* Frequently Bought → recommendedProducts */}
          <View>
            <View style={styles.productHeadingMainView}>
              <View style={styles.productHeadingHeadingView}>
                <TextView style={styles.txtProductHeading}>Frequently Bought</TextView>
                <Pressable
                  onPress={() =>
                    navigation.navigate('TypeProductList', {
                      type: 'frequentlyBought',
                      title: 'Frequently Bought',
                    })
                  }
                  style={{

                  }}
                >
                  <TextView style={{ color: "#000", fontSize: 14, fontWeight: "800" }}>
                    view more
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
              // API: recommendedProducts
              cardArray={recommended}
              horizontal
              type="BOUGHT"
              onProductAdded={handleProductAdded}
            />
          </View>


          {/* 🔹 Deal Of The Day - Explore Sections */}
          <View>
            <Image source={Images.img_deal} style={styles.imgDeal} />
            <FlatList
              data={exploreSections.slice(0, 6)}                    // ← Max 6 explore sections
              renderItem={renderDealProduct}
              contentContainerStyle={{ alignSelf: 'center', marginTop: hp(2), marginBottom: hp(2) }}
              numColumns={3}
              keyExtractor={(item) => item._id}
            />
          </View>


          {/* Dynamic Banner Below Deal of the Day */}
          {banners.length > 0 && (
            <View style={{ marginTop: hp(0) }}>
              <BannerCarousel
                banners={banners}
                height={hp(25)}
                autoScrollInterval={3000}
              />
            </View>
          )}

          {/* 🔹 Popular Products → favoriteProducts */}
          <View>
            <View style={styles.productHeadingMainView}>
              <View style={styles.productHeadingHeadingView}>
                <TextView style={styles.txtProductHeading}>Popular Products</TextView>
                <Pressable
                  onPress={() =>
                    navigation.navigate('TypeProductList', {
                      type: 'popularProduct',
                      title: 'Popular Products',
                    })
                  }
                  style={{

                  }}
                >
                  <TextView style={{ color: "#000", fontSize: 14, fontWeight: "800" }}>
                    view more
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
              // API: favoriteProducts
              cardArray={favorite}
              horizontal
              type="BOUGHT"
              onProductAdded={handleProductAdded}
            />
          </View>

          {/* Fresh Fruits Section */}
          <View style={{ marginTop: hp(2) }}>
            <View style={styles.productHeadingMainView}>
              <View style={styles.productHeadingHeadingView}>
                <TextView style={styles.txtProductHeading}>Fresh Fruits</TextView>
                <Pressable
                  onPress={() =>
                    navigation.navigate('TypeProductList', {
                      type: 'freshFruits',
                      title: 'Fresh Fruits',
                    })
                  }
                  style={{

                  }}
                >
                  <TextView style={{ color: "#000", fontSize: 14, fontWeight: "800" }}>
                    view more
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
              onProductAdded={handleProductAdded}
            />
          </View>

          {/* Bottom Banner with Explore */}
          <View>
            {dealBanner.length > 0 && (
              <View style={{ marginTop: hp(0) }}>
                <BannerCarousel
                  banners={dealBanner}
                  height={hp(25)}
                  autoScrollInterval={3000}
                />
              </View>
            )}
            {/*  EXPLORE BUTTON */}
            <View style={styles.buttonView}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('BottomStackNavigator', { screen: 'Catogaries' })
                }
              >
                <LinearGradient
                  colors={['#5A875C', '#015304']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: '100%', // follow responsive width from buttonView so not too wide on tablets
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 30,
                    paddingVertical: hp(1.5), // responsive height
                    paddingHorizontal: wp(3),
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.2,
                    shadowRadius: 10,
                    marginTop: hp(-1.5),
                  }}
                >
                  <TextView
                    style={{
                      color: '#FFFFFF',
                      fontSize: wp(4.5), // responsive font size
                      fontFamily: 'Poppins-Regular',
                      fontWeight: '400',
                      marginLeft: wp(1.2),
                    }}
                  >
                    Explore
                  </TextView>

                  <Icon
                    name="chevron-right"
                    size={24}
                    color="#ffffff"
                    family="MaterialCommunityIcons"
                    style={{ marginLeft: wp(1.2) }}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Deal Banner Above Limited Time Deals */}


          {/* 🔹 Limited Time deals */}
          <View>
            <View style={styles.productHeadingMainView}>
              <View style={styles.productHeadingHeadingView}>
                <TextView style={styles.txtProductHeading}>
                  Limited Time deals
                </TextView>
                <Pressable
                  onPress={() =>
                    navigation.navigate('TypeProductList', {
                      type: 'limitedDeals',
                      title: 'Limited Time Deals',
                    })
                  }
                  style={{

                  }}
                >
                  <TextView style={{ color: "#000", fontSize: 14, fontWeight: "800" }}>
                    view more
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
              cardArray={dealOfTheDay}
              type="LIMITED"
              horizontal
              onProductAdded={handleProductAdded}
            />
          </View>
        </Animated.ScrollView>

        {cartItems.length > 0 && (
          <Pressable
            onPress={() =>
              navigation.navigate('BottomStackNavigator', { screen: 'Cart' })
            }
            style={styles.floatingCartButton}
          >
            <LinearGradient
              colors={['#5A875C', '#015304']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cartGradient}
            >
              <View style={styles.cartButtonContent}>
                <View style={styles.stackedImagesContainer}>
                  {(() => {
                    let productsToShow: any[] = [];

                    if (recentlyAddedProducts.length > 0) {
                      // newest product should appear at the front
                      productsToShow = recentlyAddedProducts
                        .slice(-3)
                        .reverse()
                        .map(p => ({
                          image:
                            p?.image ||
                            p?.variants?.[0]?.images?.[0] ||
                            p?.ProductVarient?.[0]?.images?.[0] ||
                            p?.primary_image?.[0],
                        }));
                    } else if (cartItems.length > 0) {
                      productsToShow = cartItems
                        .slice(-3)
                        .reverse()
                        .map(item => {
                          const product = item?.productId || item?.product;
                          return {
                            image:
                              product?.images?.[0] ||
                              product?.primary_image?.[0] ||
                              product?.image ||
                              item?.image,
                          };
                        });
                    }

                    return productsToShow.map((product, index) => {
                      const imageUri = product?.image
                        ? ApiService.getImage(product.image)
                        : null;
                      const Container: any = index === 0 ? Animated.View : View;

                      return (
                        <Container
                          key={index}
                          style={[
                            styles.cartProductImageContainer,
                            index > 0 && styles.stackedImage,
                            index === 0 && { transform: [{ translateY: bounceValue }] },
                            { zIndex: 10 - index },
                          ]}
                        >
                          {imageUri ? (
                            <Image
                              source={{ uri: imageUri }}
                              style={styles.cartProductImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.cartProductImagePlaceholder} />
                          )}
                        </Container>
                      );
                    });
                  })()}
                </View>

                <View style={styles.cartTextBlock}>
                  <TextView style={styles.cartButtonText}>View Cart</TextView>
                </View>
                <View style={styles.arrowCircle}>
                  <Icon
                    name="chevron-forward"
                    family="Ionicons"
                    size={18}
                    color="#fff"
                  />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        )}

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
      </View>
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

  const normalizedImages =
    (preferredImages || [])
      .map((img: string) => (img || '').replace(/\\/g, '/').replace(/^\//, ''))
      .filter(Boolean)
      .map((img: string) => `${IMAGE_BASE_URL}${img}`);

  const imageUrl = preferredImages?.[0] || '';
  const normalizedImage = imageUrl ? imageUrl.replace(/\\/g, '/').replace(/^\//, '') : '';
  const fullImageUrl = normalizedImage ? IMAGE_BASE_URL + normalizedImage : '';

  const weightValue =
    variant?.weight ??
    (product as any)?.weight ??
    variant?.stock ??
    (product as any)?.stock ??
    1;
  const unitValue = variant?.unit ?? (product as any)?.unit ?? '';

  return {
    id: (product as any)?._id || '',
    name: (product as any)?.productName || (product as any)?.name || 'Product',
    image: fullImageUrl,
    images: normalizedImages,
    price: variant?.price || (product as any)?.price || 0,
    oldPrice: variant?.originalPrice || (product as any)?.mrp || 0,
    discount: variant?.discount ? `₹${variant.discount} OFF` : '',
    weight: `${weightValue} ${unitValue}`.trim(),
    rating: parseFloat(Number((product as any)?.rating || 4.5).toFixed(2)),
    options: `${((product as any)?.ProductVarient || (product as any)?.variants || []).length} Option${(((product as any)?.ProductVarient || (product as any)?.variants || []).length || 0) > 1 ? 's' : ''}`,
    variantId:
      variant?._id ||
      (product as any)?.ProductVarient?.[0]?._id ||
      (product as any)?.variants?.[0]?._id ||
      '',
    ProductVarient: (product as any)?.ProductVarient || (product as any)?.variants || [],
  };
};