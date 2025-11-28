import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../../.././../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';

const styles = StyleSheet.create({
  groceryCard: {
    width: wp(100),
    backgroundColor: Colors.SECONDARY[200],
    paddingBottom: hp(2),
  },
  cardMainView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: hp(1),
  },
  txtOffer: {
    color: Colors.PRIMARY[400],
    maxWidth: wp(50),
    marginLeft: hp(2),
    ...Typography.H4Semibold20,
  },
  imgCode: {
    width: 150,
    height: 60,
    resizeMode: 'contain',
    marginTop: hp(2),
    marginLeft: hp(2),
  },
  imgVegatable: {
    width: 190,
    height: 180,
    resizeMode: 'contain',
    marginTop: hp(1),
  },
  listProduct: {
    flex: 1,
    marginBottom: hp(3),
  },
  cardProduct: {
    width: wp(50),
    borderRadius: 12,
    marginLeft: hp(1),
    marginRight: hp(1),
    alignSelf: 'center',
    backgroundColor: Colors.PRIMARY[300],
  },
  cardProductImage: {
    width: wp(50),
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.PRIMARY[100],
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
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  cardProductPriceView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: hp(1),
  },
  cardProductPriceText: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[400],
  },
  cardProductPriceDiscount: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[400],
    textDecorationLine: 'underline line-through',
  },
  offerView: {
    backgroundColor: Colors.PRIMARY[600],
    borderRadius: 50,
    paddingVertical: hp(0.5),
    paddingHorizontal: hp(1.5),
  },
  offerTxt: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular12,
  },
  txtProduct: {
    ...Typography.H5Medium16,
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
    ...Typography.BodyRegular13,
    marginLeft: hp(1),
  },
  addButtonView: {
    width: 110,
    height: 25,
    marginRight: hp(1),
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
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
    width: 110,
    height: 25,
    backgroundColor: Colors.PRIMARY[600],
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtOption: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular13,
  },
});

export default styles;
