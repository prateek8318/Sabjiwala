import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../../.././../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../../constant/dimentions';

const styles = StyleSheet.create({
  listProduct: {
    flex: 1,
    marginBottom: hp(3),
  },
  cardProduct: {
    width: wp(37),
    borderRadius: 12,
    marginRight: hp(1),
    marginTop:hp(2),
    alignSelf: 'center',
    backgroundColor: Colors.PRIMARY[300],
  },
  cardProductImage: {
    width: wp(37),
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.SECONDARY[300],
    resizeMode: 'cover',
  },
  imgFlashView: {
    position: 'absolute',
    top: 2,
    left: 2,
  },

  imgFlash: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  imgHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  imgTradeMarkView: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  imgTradeMark: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  cardProductPriceView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: hp(1),
  },
  cardProductPriceText: {
    fontFamily: Fonts.Medium,
    fontSize: wp(3),
    color: Colors.PRIMARY[400],
  },
  cardProductPriceDiscount: {
    fontFamily: Fonts.Medium,
    fontSize: wp(3),
    color: Colors.PRIMARY[400],
    textDecorationLine: 'underline line-through',
  },
  offerView: {
    backgroundColor: Colors.PRIMARY[600],
    borderRadius: 50,
    paddingHorizontal: hp(1),
  },
  offerTxt: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular12,
  },
  txtProduct: {
    fontFamily: Fonts.Medium,
    fontSize: wp(3),
    color: Colors.PRIMARY[400],
    marginLeft: hp(1),
  },
  quantityView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: hp(1),
    marginBottom: hp(1),
  },
  ratingView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txtRating: {
    fontFamily: Fonts.Regular,
    fontSize: wp(2),
    marginLeft: hp(.5),
  },
  addButtonView: {
    width: 75,
    height: 25,
    marginRight: hp(1),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addProductButon: {
    height: 50,
    width: 120,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtAdd: {
    color: Colors.PRIMARY[300],
    ...Typography.H5Medium16,
  },
  optionView: {
    width: 75,
    height: 25,
    backgroundColor: Colors.PRIMARY[600],
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtOption: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular13,
  },
});

export default styles;
