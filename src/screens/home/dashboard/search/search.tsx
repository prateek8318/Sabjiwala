import React, { FC, useEffect, useMemo, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  Pressable,
  PermissionsAndroid,
  Platform,
  Modal,
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import styles from './search.styles';
import { HomeStackProps } from '../../../../@types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../constant/dimentions';
import { Colors, Fonts, Icon, Images, Typography } from '../../../../constant';
import { Header, TextView } from '../../../../components';
import InputText from '../../../../components/InputText/TextInput';
import ApiService, { IMAGE_BASE_URL } from '../../../../service/apiService';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';

type SearchScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'Search'
>;

const { width } = Dimensions.get('window');

const Search: FC = () => {
  const navigation = useNavigation<SearchScreenNavigationType>();
  const route = useRoute<any>();

  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceText, setVoiceText] = useState('Listening...');
  const animationValues = useRef(Array(5).fill(0).map(() => new Animated.Value(0))).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    const query = searchQuery.toLowerCase();
    return allProducts.filter((item) =>
      (item.name || item.productName || '')
        .toLowerCase()
        .includes(query)
    );
  }, [allProducts, searchQuery]);

  const buildImageUrl = (rawPath: any) => {
    if (!rawPath) return null;

    // Handle array inputs by picking the first entry
    if (Array.isArray(rawPath)) {
      return buildImageUrl(rawPath[0]);
    }

    // Accept objects with common url keys
    const path =
      typeof rawPath === 'string'
        ? rawPath.trim()
        : rawPath?.url || rawPath?.uri || rawPath?.path || rawPath?.image;

    if (!path) return null;

    if (path.startsWith('http')) return path;

    let cleaned = path.replace(/\\/g, '/').replace(/^\//, '');
    if (!cleaned.startsWith('public/')) {
      cleaned = `public/${cleaned}`;
    }

    const finalUrl = ApiService.getImage(cleaned);
    console.log('[Search] buildImageUrl cleaned ->', cleaned, 'url ->', finalUrl);
    return finalUrl;
  };

  // Normalize incoming product with the same image logic as dashboard cards
  const normalizeProduct = (product: any) => {
    const variant =
      product?.ProductVarient?.[0] || product?.variants?.[0] || {};

    // Priority: variant images → primary_image array → images array
    const preferredImages =
      (Array.isArray(variant?.images) && variant.images.length > 0
        ? variant.images
        : null) ||
      (Array.isArray(product?.primary_image) &&
      product.primary_image.length > 0
        ? product.primary_image
        : null) ||
      (Array.isArray(product?.images) && product.images.length > 0
        ? product.images
        : []);

    const rawImage = Array.isArray(preferredImages)
      ? preferredImages[0]
      : preferredImages;

    let normalizedImage =
      typeof rawImage === 'string'
        ? rawImage.replace(/\\/g, '/').replace(/^\//, '')
        : '';

    if (normalizedImage && !normalizedImage.startsWith('public/')) {
      normalizedImage = `public/${normalizedImage}`;
    }

    const image =
      (normalizedImage && `${IMAGE_BASE_URL}${normalizedImage}`) ||
      buildImageUrl(rawImage) ||
      'https://via.placeholder.com/100x100.png?text=No+Image';

    console.log('[Search] normalizeProduct rawImage:', rawImage, 'normalizedImage:', normalizedImage, 'finalImage:', image);

    const price =
      variant?.price ??
      product?.price ??
      product?.variants?.[0]?.price ??
      product?.ProductVarient?.[0]?.price ??
      '0';

    return {
      ...product,
      _id: product?._id || product?.id || '',
      image,
      price,
    };
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getSubCategoryProducts('all');
      console.log('[Search] loadProducts response keys:', Object.keys(res?.data || {}));

      const apiData =
        res.data?.paginateData ||
        res.data?.products ||
        res.data?.productData ||
        res.data?.data ||
        res.data?.items ||
        [];

      console.log('[Search] raw apiData length:', Array.isArray(apiData) ? apiData.length : 'not array');

      const normalized = Array.isArray(apiData)
        ? apiData.map(normalizeProduct)
        : [];
      setAllProducts(normalized);
      console.log('[Search] normalized products length:', normalized.length);
    } catch (error) {
      console.log('Search load error:', error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    
    // Set up voice event listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().finally(() => {
        Voice.removeAllListeners();
        stopAnimation();
      });
    };
  }, []);

  useEffect(() => {
    if (route.params?.startVoice) {
      handleMicPress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.startVoice]);

  const requestMicPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const startAnimation = () => {
    const animations = animationValues.map((value) => {
      return Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
          delay: 100,
        }),
      ]);
    });

    animationRef.current = Animated.loop(
      Animated.stagger(100, animations)
    );
    animationRef.current.start();
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationValues.forEach(value => value.setValue(0));
    }
  };

  const onSpeechResults = (event: SpeechResultsEvent) => {
    const value = event.value?.[0] || '';
    setSearchQuery(value);
    setVoiceText(`Heard: ${value}`);
    
    // Auto-close after 2 seconds if no more speech
    if (value) {
      setTimeout(() => {
        if (listening) {
          setListening(false);
          setShowVoiceModal(false);
          stopAnimation();
        }
      }, 2000);
    }
  };

  const onSpeechError = (error: any) => {
    console.log('Speech error:', error);
    setVoiceText('Error: Could not recognize speech');
    setListening(false);
    stopAnimation();
    
    // Auto-close on error after 2 seconds
    setTimeout(() => {
      setShowVoiceModal(false);
    }, 2000);
  };

  const onSpeechStart = () => {
    setVoiceText('Listening...');
    startAnimation();
  };

  const onSpeechEnd = () => {
    setListening(false);
    setShowVoiceModal(false);
    stopAnimation();
  };

  const handleMicPress = async () => {
    if (listening) {
      await stopVoiceRecognition();
      return;
    }

    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      return;
    }

    try {
      setVoiceText('Listening...');
      setShowVoiceModal(true);
      await Voice.start('en-US');
      setListening(true);
    } catch (error) {
      console.log('Voice start error:', error);
      setListening(false);
      setShowVoiceModal(false);
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      await Voice.stop();
      setListening(false);
      setShowVoiceModal(false);
      stopAnimation();
    } catch (error) {
      console.log('Error stopping voice recognition:', error);
    }
  };

  const renderVoiceModal = () => (
    <Modal
      transparent
      visible={showVoiceModal}
      animationType="fade"
      onRequestClose={stopVoiceRecognition}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Icon
            family="FontAwesome"
            name="microphone"
            size={40}
            color={Colors.PRIMARY[300]}
          />
          
          <Text style={styles.listeningText}>
            {voiceText}
          </Text>
          
          <View style={styles.voiceWave}>
            {animationValues.map((value, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.wave,
                  {
                    height: 30,
                    transform: [
                      {
                        scaleY: value.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1.5],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.micButton}
            onPress={stopVoiceRecognition}
          >
            <Icon
              family="FontAwesome"
              name="microphone-slash"
              size={30}
              color="white"
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={stopVoiceRecognition}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderItem = ({ item }: { item: any }) => {
    console.log('[Search] renderItem image:', item?.image, 'id:', item?._id);
    const image = item?.image;
    const price = item?.price ?? '0';

    return (
      <Pressable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          marginHorizontal: wp(4),
          marginVertical: hp(0.8),
          borderRadius: 12,
          padding: wp(3),
          elevation: 1,
        }}
        onPress={() =>
          // @ts-ignore navigation type is loosely defined in stack
          navigation.navigate('ProductDetail', { productId: item._id })
        }
      >
        <Image
          source={{ uri: image || '' }}
          style={{ width: 64, height: 64, borderRadius: 10 }}
          resizeMode="cover"
        />
        <View style={{ marginLeft: wp(3), flex: 1 }}>
          <TextView
            style={{ fontSize: 14, fontWeight: '700', color: '#212121' }}
            numberOfLines={1}
          >
            {item.name || item.productName || 'Unknown'}
          </TextView>
          <TextView style={{ marginTop: 4, color: Colors.PRIMARY[300] }}>
            ₹ {price}
          </TextView>
        </View>
        <Icon
          family="Entypo"
          name="chevron-right"
          size={20}
          color={Colors.PRIMARY[300]}
        />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <Header />
        {renderVoiceModal()}

        <View style={{ marginTop: hp(2) }}>
          <View style={styles.searchBox}>
            <View style={styles.searchView}>
              <Icon
                family="EvilIcons"
                name="search"
                color={Colors.PRIMARY[100]}
                size={30}
              />
              <InputText
                value={searchQuery}
                //@ts-ignore
                inputStyle={[styles.inputView]}
                placeHolderTextStyle={Colors.PRIMARY[500]}
                placeholder="Search for Grocery"
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
            <Pressable
              onPress={handleMicPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: wp(3),
                paddingVertical: hp(1),
              }}
            >
              <View style={{ width: 1, height: '100%', backgroundColor: Colors.PRIMARY[400], marginRight: wp(2) }} />
              <Icon
                family="FontAwesome"
                name="microphone"
                color={listening ? Colors.PRIMARY[100] : Colors.PRIMARY[300]}
                size={22}
              />
            </Pressable>
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.PRIMARY[100]} />
          </View>
        ) : filteredProducts.length === 0 && searchQuery.trim() ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <TextView style={{ color: '#000', fontSize: 16 }}>
              No Product Found
            </TextView>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.imgSearchView}>
            <Image source={Images.img_search} style={styles.imgSearch} />
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingVertical: hp(2) }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Search;
