import {
  ActivityIndicator,
  TouchableOpacity,
  TextStyle,
  View,
  ViewStyle,
  FlatList,
  Image,
  Text,
  Modal,
  Pressable,
} from 'react-native';
import { FC } from 'react';
import _ from 'lodash';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';
import styles from './productCard.styles';
import { Colors, Icon, Images, Typography } from '../../../../../constant';
import { TextView } from '../../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../../../service/apiService';
interface ProductCardProps {
  cardArray?: any;
  type?: string;
  horizontal?: boolean;
  numOfColumn?: number;
}

const ProductCard: FC<ProductCardProps> = ({
  cardArray,
  type,
  horizontal,
  numOfColumn,
}) => {
  const navigation = useNavigation<any>();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [cartMap, setCartMap] = useState<{ [key: string]: number }>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites on mount
  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem('favoriteProducts');
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    };
    load();
  }, []);

  // Load cart
  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await ApiService.getCart();
        const map: any = {};
        res?.data?.items?.forEach((i: any) => {
          map[i.productId] = i.quantity;
        });
        setCartMap(map);
      } catch (e) { }
    };
    loadCart();
  }, []);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const res = await ApiService.getWishlist();
        const ids = res?.data?.items?.map((i: any) => i.productId);
        setWishlist(new Set(ids));
      } catch (e) {
        console.log("wishlist load error", e);
      }
    };
    loadWishlist();
  }, []);

  // Toggle favorite
  const toggleWishlist = async (productId: string) => {
    try {
      const newList = new Set(wishlist);

      if (newList.has(productId)) {
        // remove
        await ApiService.deleteWishlist(productId);
        newList.delete(productId);
      } else {
        // add
        await ApiService.addToWishlist(productId);
        newList.add(productId);
      }

      setWishlist(newList);
    } catch (err) {
      console.log("wishlist toggle error", err);
    }
  };

  // Update cart qty
  const updateCartQty = async (
    productId: string,
    variantId: string,
    qty: number,
  ) => {
    try {
      if (qty > 0) {
        await ApiService.addToCart(productId, variantId, qty.toString());
      } else {
        await ApiService.removeFromCart(productId, variantId);
      }
      setCartMap(prev => ({ ...prev, [productId]: qty }));
    } catch (e) { }
  };

  const renderProductItem = ({ item }: { item: any }) => {
    const isFavorite = favorites.has(item.id.toString());

    return (
      <Pressable
        style={styles.cardProduct}
        onPress={() =>
          navigation.navigate('ProductDetail', { productId: item.id })
        }
      >
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: item.image }} style={styles.cardProductImage} />

          {type === 'LIMITED' && (
            <View style={styles.imgFlashView}>
              <Image source={Images.ic_flash} style={styles.imgFlash} />
            </View>
          )}

          {/* Favorite */}
          <Pressable
            onPress={e => {
              e.stopPropagation();
              toggleWishlist(item.id.toString());
            }}
            style={styles.imgHeart}
            hitSlop={10}
          >
            <Icon
              name={wishlist.has(item.id.toString()) ? 'heart' : 'hearto'}
              family="AntDesign"
              size={26}
              color={wishlist.has(item.id.toString()) ? '#E53935' : '#888'}
            />
          </Pressable>


          <View style={styles.imgTradeMarkView}>
            <Image source={Images.ic_trademark} style={styles.imgTradeMark} />
          </View>
        </View>

        {/* Price */}
        <View style={styles.cardProductPriceView}>
          <View>
            <TextView style={styles.cardProductPriceText}>
              ₹{item.price}
              <TextView style={styles.cardProductPriceDiscount}>
                {' '}₹{item.oldPrice}
              </TextView>
            </TextView>
          </View>
          <View style={styles.offerView}>
            <TextView style={styles.offerTxt}>{item.discount}</TextView>
          </View>
        </View>

        <Text style={styles.txtProduct}>{item.name}</Text>

        <View style={styles.quantityView}>
          <View>
            <TextView style={{ ...Typography.BodyRegular13 }}>
              {item.weight}
            </TextView>
            <View style={styles.ratingView}>
              <Icon
                family="AntDesign"
                name="star"
                color={Colors.PRIMARY[400]}
                size={15}
              />
              <TextView style={styles.txtRating}>{item.rating}</TextView>
            </View>
          </View>

          {/* ===== FIXED BLOCK START ===== */}
          {type === 'OFFER' ? (
            <View>
              <LinearGradient
                colors={[Colors.PRIMARY[200], Colors.PRIMARY[100]]}
                style={[
                  styles.addButtonView,
                  { borderTopLeftRadius: 50, borderTopRightRadius: 50 },
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0 }}
              >
                <TextView style={styles.txtAdd}>Add</TextView>
              </LinearGradient>

              <View style={styles.optionView}>
                <TextView style={styles.txtOption}>{item.options}</TextView>
              </View>
            </View>
          ) : (
            <View style={{ marginTop: 8, alignItems: 'flex-end', borderRadius: 12, borderColor: "#F5F5F5" }}>
              {cartMap[item.id] > 0 ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {/* --- Minus Button --- */}
                  <Pressable
                    onPress={e => {
                      e.stopPropagation();
                      updateCartQty(
                        item.id,
                        item.variants?.[0]?._id || item.id,
                        cartMap[item.id] - 1,
                      );
                    }}
                    style={{
                      height: hp(3),      // Small height
                      width: hp(3),       // Same width
                      borderRadius: hp(3), // Fully round
                      borderWidth: 1,
                      borderColor: '#000',
                      backgroundColor: '#fff',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: hp(2),
                        color: '#000',
                        fontWeight: '600',
                        marginBottom: 2, // perfect vertical balance
                      }}
                    >
                      -
                    </Text>
                  </Pressable>

                  {/* Quantity Text */}
                  <Text
                    style={{
                      fontSize: hp(2),
                      fontWeight: '600',
                      color: '#000',
                      minWidth: wp(2),
                      textAlign: 'center',
                    }}
                  >
                    {cartMap[item.id]}
                  </Text>

                  {/* --- Plus Button --- */}
                  <Pressable
                    onPress={e => {
                      e.stopPropagation();
                      updateCartQty(
                        item.id,
                        item.variants?.[0]?._id || item.id,
                        cartMap[item.id] + 1,
                      );
                    }}
                    style={{
                      height: hp(3),
                      width: hp(3),
                      marginRight: hp(1),
                      borderRadius: hp(3),
                      borderWidth: 1,
                      borderColor: '#000',
                      backgroundColor: '#fff',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: hp(2),
                        color: '#000',
                        fontWeight: '600',
                        marginBottom: 1,
                      }}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={e => {
                    e.stopPropagation();

                    if (item?.variants?.length > 1) {
                      setSelectedProduct(item);
                      setShowVariantModal(true);
                    } else {
                      updateCartQty(
                        item.id,
                        item.variants?.[0]?._id || item.id,
                        1
                      );
                    }
                  }}
                >

                  <LinearGradient
                    colors={[Colors.PRIMARY[200], Colors.PRIMARY[100]]}
                    style={styles.addProductButon}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <TextView style={styles.txtAdd}>Add</TextView>
                  </LinearGradient>
                </Pressable>
              )}
            </View>


          )}

        </View>
      </Pressable>
    );
  };

  const isGrid = !horizontal && (numOfColumn ?? 1) > 1;



  
  return (
    <View style={styles.listProduct}>
      {horizontal ? (
        // HORIZONTAL LIST
        <FlatList
          data={cardArray}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: wp(3), paddingVertical: hp(1) }}
          key="horizontal"
        />
      ) : (
        // GRID LIST (2 columns) – columnWrapperStyle supported only here
        <FlatList
          data={cardArray}
          renderItem={({ item }) => (
            <View style={{ width: '50%', paddingHorizontal: wp(1.5) }}>
              {renderProductItem({ item })}
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: hp(3) }}
          showsVerticalScrollIndicator={false}
          key="grid-2"
        />
      )}
      <Modal
        visible={showVariantModal}
        transparent
        animationType="slide"
      >
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.4)'
        }}>

          {/* Close Button */}
          <Pressable
            onPress={() => setShowVariantModal(false)}
            style={{
              height: 60,
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}
            
          >
            <View style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: Colors.PRIMARY[200]
            }}>
              <Icon name="close" size={18} color="green" />
            </View>
          </Pressable>

          {/* Variant List */}
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: hp(80),        // ← responsive max height
            paddingBottom: hp(4),
          }}>
            {selectedProduct?.variants?.map((v: any, index: number) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#DFF0D8',
                  borderRadius: 10,
                  marginBottom: 12
                }}
              >
                {/* Product Image */}
                <Image
                  source={{ uri: selectedProduct?.image }}
                  style={{ width: 60, height: 60, borderRadius: 8 }}
                />

                {/* Variant Info */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <TextView style={{ color: '#000' }}>{selectedProduct.name}</TextView>
                  <TextView style={{ color: '#000' }}>{v.stock} {v.unit}</TextView>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextView style={{ color: '#000' }}>₹{v.price}</TextView>
                    {v.originalPrice && (
                      <TextView
                        style={{
                          color: '#000',
                          textDecorationLine: 'line-through',
                          marginLeft: 8
                        }}
                      >
                        ₹{v.originalPrice}
                      </TextView>
                    )}
                  </View>
                </View>

                {/* Add Button */}
                <Pressable
                  onPress={() => {
                    updateCartQty(selectedProduct.id, v._id, 1);
                    setShowVariantModal(false);
                  }}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 6,
                    backgroundColor: 'green',
                    borderRadius: 10
                  }}
                >
                  <TextView style={{ color: '#fff' }}>Add</TextView>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default ProductCard;
