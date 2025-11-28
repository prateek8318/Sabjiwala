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
import { FC } from 'react';
import _ from 'lodash';
import { widthPercentageToDP as wp } from '../../../../../constant/dimentions';
import styles from './productCard.styles';
import { Colors, Icon, Images, Typography } from '../../../../../constant';
import { TextView } from '../../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

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

  const renderProductItem = ({ item }: { item: (typeof cardArray)[0] }) => {
    return (
      <Pressable
        style={styles.cardProduct}
        onPress={() => navigation.navigate('ProductDetail')}
      >
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

          <View style={styles.imgHeart}>
            <Icon
              name="heart"
              family="AntDesign"
              size={30}
              color={Colors.PRIMARY[700]}
            />
          </View>
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
          {type === 'OFFER' && (
            <View>
              <LinearGradient
                colors={[Colors.PRIMARY[200], Colors.PRIMARY[100]]}
                style={[
                  styles.addButtonView,
                  {
                    borderTopLeftRadius: 50,
                    borderTopRightRadius: 50,
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
            </View>
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
        keyExtractor={item => item.id.toString()}
        horizontal={horizontal && horizontal}
        numColumns={numOfColumn && numOfColumn}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: wp(2) }}
      />
    </View>
  );
};

export default ProductCard;
