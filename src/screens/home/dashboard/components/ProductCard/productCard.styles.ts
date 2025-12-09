import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';

const styles = StyleSheet.create({
  cardProduct: {
    width: wp(36),
    minHeight: hp(32),
    marginBottom: hp(2),
    marginHorizontal: wp(1),
    backgroundColor: Colors.PRIMARY[300],
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.PRIMARY[400],
    overflow: 'hidden',
    justifyContent: 'space-between',
  },

  cardProductImage: {
    width: '100%',
    height: wp(28) * 1.1,
    resizeMode: 'cover',
    top:-4,
  },

  imgFlashView: { position: 'absolute', top: 6, left: 6 },
  imgFlash: { width: 36, height: 36 },
  imgHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',  // thoda background diya taaki clear dikhe achhe se
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  imgTradeMarkView: { position: 'absolute', bottom: 8, right: 8 },
  imgTradeMark: { width: 18, height: 18 },

  // Price Section
  cardProductPriceView: {
    paddingHorizontal: wp(3),
    paddingTop: hp(1),
  },

  cardProductPriceText: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[400],
    fontSize: 18,
    fontWeight: '700',
  },

  priceRowBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.6),
    gap: wp(2), // ← Better spacing than marginRight
  },

  cardProductPriceDiscount: {
    ...Typography.BodyRegular14,
    color: '#9E9E9E',                 // ← 100% safe, hamesha chalega
    textDecorationLine: 'line-through',
    fontSize: 13,
  },

  offerView: {
    backgroundColor: '#E53935',        
    // backgroundColor: '#27AE60',
    borderRadius: 50,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    minWidth: wp(10),
    alignItems: 'center',
  },

  offerTxt: {
    color: '#FFFFFF',                
    ...Typography.BodyMedium14,
    fontWeight: '700',
    fontSize: 12,
  },

  txtProduct: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[400],
    paddingHorizontal: wp(3),
    marginTop: hp(0.8),
    numberOfLines: 2,
    lineHeight: 20,
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
    marginLeft: wp(0.5),
    color: '#000',
    fontWeight: '600',
  },

  addProductButon: {
    height: hp(5),
    width: wp(16),
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionView: {
    width: 72,
    height: 20,
    backgroundColor: Colors.PRIMARY[600],
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  txtOption: {
    color: Colors.PRIMARY[400],
    fontSize: 11,
    fontWeight: '600',
  },

  txtAdd: {
    color: Colors.PRIMARY[300],
    fontSize: 14,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});

export default styles;