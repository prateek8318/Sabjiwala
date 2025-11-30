
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

const qtyOptions = [
  { id: 0, label: '500 gm' },
  { id: 1, label: '1 Kg' },
  { id: 2, label: '1 Kg X 2' },
];

const ProductDetail = () => {
  const route = useRoute();
  const { productId } = route.params as { productId: string };

  const navigation = useNavigation<NavProp>();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await ApiService.getProductDetail(productId);
        if (res?.status === 200 && res.data?.success) {
          setProduct(res.data.productData);
        }
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4CAF50" />;
  if (!product) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>Product not found</Text>;

  const img = product.images?.[0] ? `http://167.71.232.245:8539/${product.images[0]}` : '';
  const price = product.price || 0;
  const mrp = product.mrp || 0;
  const weight = product.variants?.[selectedQty]?.weight || '1 Kg';
  const info = product.info || {};
  const handleAddToCart = async () => {
    try {
      const res = await ApiService.addToCart(
        product._id,
        product.variants[selectedQty]?._id,
        "1"   // default quantity
      );

      if (res?.status === 200 && res.data.success) {
        alert("Added to cart successfully!");
        navigation.navigate('Cart');
      } else {
        alert("Failed to add item!");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong!");
    }
  };


  const renderQty = ({ item }: any) => (
    <Pressable
      onPress={() => setSelectedQty(item.id)}
      style={[styles.qtyBtn, selectedQty === item.id && styles.qtyBtnActive]}>
      <Text style={[styles.qtyText, selectedQty === item.id && styles.qtyTextActive]}>
        {item.label}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(12) }}>

        <View style={styles.imgContainer}>
          <Image source={{ uri: img }} style={styles.mainImg} resizeMode="cover" />
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" family="Feather" size={28} color="#000" />
          </Pressable>
        </View>

        {/* Name */}
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.weightText}>{weight}</Text>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.finalPrice}>₹{price}</Text>
          {mrp > price && <Text style={styles.strikePrice}>₹{mrp}</Text>}
          <Text style={styles.saveText}>You Save ₹{mrp - price}</Text>
        </View>


        {/* Quantity */}
        <FlatList
          data={qtyOptions}
          renderItem={renderQty}
          keyExtractor={i => i.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: wp(4), marginTop: hp(2) }}
        />


        {/* Additional Info (full details) */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Additional Info</Text>

          {Object.keys(info).map((key) => (
            <View key={key} style={styles.infoRow}>
              <Text style={styles.infoKey}>{key}</Text>
              <Text style={styles.infoValue}>{info[key]}</Text>
            </View>
          ))}

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Price</Text>
            <Text style={styles.infoValue}>₹{price}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>MRP</Text>
            <Text style={styles.infoValue}>₹{mrp}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Rating</Text>
            <Text style={styles.infoValue}>{product.rating || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Available</Text>
            <Text style={styles.infoValue}>{product.isAvailable ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Return</Text>
            <Text style={styles.infoValue}>{product.isReturnAvailable ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Tags</Text>
            <Text style={styles.infoValue}>{product.tags?.join(', ') || '—'}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Add to Cart Bar (exactly like screenshot) */}
      <View style={styles.bottomCartBar}>
        <LinearGradient colors={['#E8F5E8', '#C8E6C9']} style={styles.cartGradient}>
          <View style={styles.cartLeft}>
            <Icon name="shopping-cart" family="Feather" size={26} color="#000" />
            <Text style={styles.cartPrice}>₹{price}</Text>
          </View>
          <Pressable onPress={handleAddToCart} style={styles.addToCartBtn}>

            <Text style={styles.addToCartText}>Add to Cart</Text>
            <Icon name="chevron-right" family="Entypo" size={26} color="#000" />
          </Pressable>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetail;