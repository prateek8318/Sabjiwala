import {
  ActivityIndicator,
  TouchableOpacity,
  TextStyle,
  View,
  ViewStyle,
  FlatList,
  Image,
  Text,
  Pressable,
} from 'react-native';
import { FC, useState, useEffect } from 'react';
import _ from 'lodash';
import { widthPercentageToDP as wp } from '../../../../../../constant/dimentions';
import styles from './productCard.styles';
import {
  Colors,
  Fonts,
  Icon,
  Images,
  Typography,
} from '../../../../../../constant';
import { TextView } from '../../../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import ApiService from '../../../../../../service/apiService';

interface ProductCardProps {
  cardArray?: any;
  type?: string;
  horizontal?: boolean;
  onAddAction?: any;
  numOfColumn?: number;
}

const ProductCard: FC<ProductCardProps> = ({
  cardArray,
  type,
  horizontal,
  onAddAction,
  numOfColumn,
}) => {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const res = await ApiService.getWishlist();
        console.log('Category ProductCard - Wishlist response:', res?.data);
        
        // Handle different response structures
        let items = [];
        if (res?.data?.wishlist?.items) {
          items = res.data.wishlist.items;
        } else if (res?.data?.wishlist && Array.isArray(res.data.wishlist)) {
          items = res.data.wishlist;
        } else if (res?.data?.items) {
          items = res.data.items;
        } else if (res?.data?.data?.items) {
          items = res.data.data.items;
        }
        
        const ids = items.map((i: any) => i.productId?.toString()).filter(Boolean);
        console.log('Category ProductCard - Loaded wishlist IDs:', ids);
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
      const productIdStr = productId.toString();
      console.log('Category ProductCard - Toggle wishlist - productId:', productIdStr);
      console.log('Current wishlist before toggle:', Array.from(wishlist));
      
      const newList = new Set(wishlist);
      const isFavorite = newList.has(productIdStr);

      if (isFavorite) {
        // remove - delete from wishlist
        console.log('Removing from wishlist...');
        await ApiService.deleteWishlist(productIdStr);
        newList.delete(productIdStr);
        setWishlist(newList);
        console.log('Wishlist after remove:', Array.from(newList));
      } else {
        // add - add to wishlist
        console.log('Adding to wishlist...');
        await ApiService.addToWishlist(productIdStr);
        newList.add(productIdStr);
        setWishlist(newList);
        console.log('Wishlist after add:', Array.from(newList));
      }

      // Reload wishlist from server to ensure sync
      setTimeout(async () => {
        try {
          const res = await ApiService.getWishlist();
          let items = [];
          if (res?.data?.wishlist?.items) {
            items = res.data.wishlist.items;
          } else if (res?.data?.wishlist && Array.isArray(res.data.wishlist)) {
            items = res.data.wishlist;
          } else if (res?.data?.items) {
            items = res.data.items;
          }
          const ids = items.map((i: any) => i.productId?.toString()).filter(Boolean);
          console.log('Category ProductCard - Reloaded wishlist IDs:', ids);
          setWishlist(new Set(ids));
        } catch (e) {
          console.log("Error reloading wishlist", e);
        }
      }, 500);
    } catch (err) {
      console.log("wishlist toggle error", err);
      // On error, reload wishlist to sync with server
      try {
        const res = await ApiService.getWishlist();
        let items = [];
        if (res?.data?.wishlist?.items) {
          items = res.data.wishlist.items;
        } else if (res?.data?.wishlist && Array.isArray(res.data.wishlist)) {
          items = res.data.wishlist;
        } else if (res?.data?.items) {
          items = res.data.items;
        }
        const ids = items.map((i: any) => i.productId?.toString()).filter(Boolean);
        setWishlist(new Set(ids));
      } catch (e) {
        console.log("Error reloading wishlist", e);
      }
    }
  };

  const renderProductItem = ({ item }: { item: (typeof cardArray)[0] }) => {
    const productId = item.id?.toString() || item._id?.toString();
    const isFavorite = wishlist.has(productId);
    
    return (
      <Pressable style={styles.cardProduct}>
        <View style={{ position: 'relative' }}>
          <View>
            <Image
              source={{ uri: item.image }}
              style={styles.cardProductImage}
            />
          </View>
          {type === 'LIMITED' && (
            <View style={styles.imgFlashView}>
              <Image source={Images.ic_flash} style={styles.imgFlash} />
            </View>
          )}

          <Pressable
            onPress={e => {
              e.stopPropagation();
              const productId = item.id?.toString() || item._id?.toString();
              console.log('Category ProductCard - Toggle wishlist:', productId);
              toggleWishlist(productId);
            }}
            style={styles.imgHeart}
            hitSlop={10}
          >
            <Icon
              name={isFavorite ? 'heart' : 'hearto'}
              family="AntDesign"
              size={20}
              color={isFavorite ? '#E53935' : Colors.PRIMARY[700]}
            />
          </Pressable>
          <View style={styles.imgTradeMarkView}>
            <Image source={Images.ic_trademark} style={styles.imgTradeMark} />
          </View>
        </View>
        <View style={styles.cardProductPriceView}>
          <View>
            <TextView style={styles.cardProductPriceText}>
              ₹{item.price}
              <TextView style={styles.cardProductPriceDiscount}>
                {' '}
                ₹{item.oldPrice}
              </TextView>
            </TextView>
          </View>
          <View style={styles.offerView}>
            <TextView style={styles.offerTxt}>{item.discount}</TextView>
          </View>
        </View>
        <View>
          <Text style={styles.txtProduct}>{item.name}</Text>
        </View>
        <View style={styles.quantityView}>
          <View>
            <TextView style={{ fontFamily: Fonts.Regular, fontSize: wp(2.5) }}>
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
          {type === 'OFFER' && (
            <Pressable onPress={() => onAddAction()}>
              <LinearGradient
                colors={[Colors.PRIMARY[200], Colors.PRIMARY[100]]}
                style={[
                  styles.addButtonView,
                  {
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  },
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0 }}
              >
                <TextView style={styles.txtAdd}>Add</TextView>
              </LinearGradient>
              <View style={styles.optionView}>
                <TextView style={styles.txtOption}>{item.options}</TextView>
              </View>
            </Pressable>
          )}
          {type !== 'OFFER' && (
            <View>
              <LinearGradient
                colors={[Colors.PRIMARY[200], Colors.PRIMARY[100]]}
                style={styles.addProductButon}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0 }}
              >
                <TextView style={styles.txtAdd}>Add</TextView>
              </LinearGradient>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.listProduct}>
      <FlatList
        data={cardArray}
        renderItem={renderProductItem}
        keyExtractor={item => (item.id?.toString() || item._id?.toString() || Math.random().toString())}
        horizontal={horizontal && horizontal}
        numColumns={numOfColumn && numOfColumn}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: wp(2) }}
      />
    </View>
  );
};

export default ProductCard;
