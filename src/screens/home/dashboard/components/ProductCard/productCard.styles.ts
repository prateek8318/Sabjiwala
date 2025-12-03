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
    paddingBottom: hp(1),
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp(2),
    marginBottom: hp(-2),
    marginTop: hp(-2),
  },
  
  cardProduct: {
    width: wp(42),          // FIXED CARD WIDTH (2 per row)
    height: hp(32),         // FIXED CARD HEIGHT
    borderRadius: 12,
    marginBottom: hp(3),
    marginRight: wp(2),
    backgroundColor: Colors.PRIMARY[300],
    borderWidth: 0.5,        // BORDER ADDED
    borderColor: Colors.PRIMARY[400],
    overflow: 'hidden',
  },
  
  cardProductImage: {
    width: '100%',
    height: 160,
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
    
    color: '#000000',      
    fontWeight: '600',       
   
  },
  addButtonView: {
    width: 80,
    height: 20,
    marginRight: hp(2),
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addProductButon: {
    height: 40,
    width: 82,
    marginRight: hp(1),
    marginTop:5,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtAdd: {
    color: Colors.PRIMARY[300],
    ...Typography.H5Medium16,
    fontSize: 12,
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
  addButton:{
    width:80,
    height:120,
  }
});

export default styles;
