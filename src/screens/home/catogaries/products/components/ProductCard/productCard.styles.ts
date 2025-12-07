import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../../.././../../constant';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../../../../../constant/dimentions';

const styles = StyleSheet.create({
  listProduct: {
    flex: 1,
    marginBottom: hp(3),
  },
  cardProduct: {
    width: wp(42),               // 2 cards per row with safe gap
    minHeight: hp(30),           // flexible height
    marginBottom: hp(2),
    marginHorizontal: wp(2),
    backgroundColor: Colors.PRIMARY[300],
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.PRIMARY[400],
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardProductImage: {
    width: '100%',
    height: wp(30) * 1.1,         // image height proportional to card width
    resizeMode: 'cover',
  },
  imgFlashView: { position: 'absolute', top: 6, left: 6 },
  imgFlash: { width: 36, height: 36 },
  imgHeart: { position: 'absolute', top: 8, right: 8 },
  imgTradeMarkView: { position: 'absolute', bottom: 8, right: 8 },
  imgTradeMark: { width: 18, height: 18 },
  cardProductPriceView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingTop: hp(1),
  },
  cardProductPriceText: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[400],
  },
  cardProductPriceDiscount: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[400],
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  offerView: {
    backgroundColor: Colors.PRIMARY[600],
    borderRadius: 50,
    paddingVertical: hp(0.4),
    paddingHorizontal: wp(3),
  },
  offerTxt: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular12,
  },
  txtProduct: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[400],
    paddingHorizontal: wp(3),
    marginTop: hp(0.5),
    numberOfLines: 2,
  },
  quantityView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: wp(3),
    paddingBottom: hp(1.5),
    marginTop: hp(1),
  },
  ratingView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.5),
  },
  txtRating: {
    ...Typography.BodyRegular13,
    marginLeft: wp(1),
    color: '#000',
    fontWeight: '600',
  },
  addButtonView: {
    width: wp(20),
    height: hp(4),
    marginRight: hp(1),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addProductButon: {
    height: hp(5),
    width: wp(22),
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionView: {
    width: 80,
    height: 20,
    backgroundColor: Colors.PRIMARY[600],
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtOption: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular13,
    fontSize: 12,
  },
  addButton: {
    width: 80,
    height: 120,
  },
  txtAdd: {
    color: Colors.PRIMARY[300],
    fontSize: 14,
    textAlign: 'center',        // horizontally center
    textAlignVertical: 'center', // vertically center (Android)
    includeFontPadding: false,   // clean centering
  },
});

export default styles;
