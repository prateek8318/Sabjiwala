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

type NavProp = NativeStackNavigationProp<HomeStackProps, 'ProductDetail'>;

const ProductDetail = () => {
  const route = useRoute();
  const { productId } = route.params as { productId: string };
  const navigation = useNavigation<NavProp>();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(0);
  const [qtyOptions, setQtyOptions] = useState<any[]>([]);
  const [cartQty, setCartQty] = useState(0); // New state

  useEffect(() => {
    (async () => {
      try {
        const res = await ApiService.getProductDetail(productId);
        if (res?.status === 200 && res.data?.success) {
          const productData = res.data.productData;
          setProduct(productData);

          const options = productData.variants?.map((v: any, index: number) => ({
            id: index,
            label: v.weight,
            price: v.price,
            mrp: v.mrp,
            variantId: v._id,
          })) || [];

          setQtyOptions(options);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4CAF50" />;
  if (!product) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>Product not found</Text>;

  const selectedVariant = product.variants?.[selectedQty] || {};
  const img = product.images?.[0] ? `http://167.71.232.245:8539/${product.images[0]}` : '';
  const price = selectedVariant.price || 0;
  const mrp = selectedVariant.mrp || 0;
  const weight = selectedVariant.weight || '';
  const info = product.info || {};

  const updateCart = async (newQty: number) => {
    try {
      if (newQty > 0) {
        await ApiService.addToCart(product._id, selectedVariant._id, newQty.toString());
      } else {
        await ApiService.removeFromCart(product._id, selectedVariant._id);
      }
      setCartQty(newQty);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = () => {
    updateCart(1); // Initially add 1
  };

  const renderQty = ({ item }: any) => (
    <Pressable
      onPress={() => setSelectedQty(item.id)}
      style={[
        styles.qtyBtn,
        selectedQty === item.id && styles.qtyBtnActive,
        {
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 8,
          minWidth: 70,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10
        }
      ]}
    >
      <Text
        style={[
          styles.qtyText,
          selectedQty === item.id && styles.qtyTextActive,
          { fontWeight: '500', fontSize: 14, color: selectedQty === item.id ? '#fff' : '#000' }
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.label} | ₹{item.price}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(12) }}>
        {/* Product Image */}
        <View style={styles.imgContainer}>
          <Image source={{ uri: img }} style={styles.mainImg} resizeMode="cover" />
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" family="Feather" size={28} color="#000" />
          </Pressable>
        </View>

        {/* Name & Weight */}
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.weightText}>{weight}</Text>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.finalPrice}>₹{price}</Text>
          {mrp > price && <Text style={styles.strikePrice}>₹{mrp}</Text>}
          {mrp > price && <Text style={styles.saveText}>You Save ₹{mrp - price}</Text>}
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
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Additional Info</Text>
          {Object.keys(info).map((key) => (
            <View key={key} style={styles.infoRow}>
              <Text style={styles.infoKey}>{key}</Text>
              <Text style={styles.infoValue}>{info[key]}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Add to Cart Bar */}
      <View style={styles.bottomCartBar}>
        <LinearGradient colors={['#E8F5E8', '#C8E6C9']} style={styles.cartGradient}>
          {cartQty === 0 ? (
            // Full width Add to Cart button
            <Pressable onPress={handleAddToCart} style={[styles.addToCartBtn, { flex: 1 }]}>
              <Text style={styles.addToCartText}>Add to Cart</Text>
              <Icon name="chevron-right" family="Entypo" size={26} color="#000" />
            </Pressable>
          ) : (
            // Cart icon + quantity selector
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, padding: 10 }}>

              {/* Cart Icon with "View Cart" */}
              <Pressable
                onPress={() => navigation.navigate('BottomStackNavigator', { screen: 'Cart' })}
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

              {/* Quantity Selector */}
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
                  {cartQty}
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
