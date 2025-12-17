import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';

const styles = StyleSheet.create<any>({
  cardProduct: {
    width: wp(38),
    marginBottom: hp(1),
    marginHorizontal: wp(1),
    backgroundColor: Colors.PRIMARY[300],
    borderRadius: 14,
    elevation: 0,
    
    
    justifyContent: 'space-between',
  },

  cardProductImage: {
    width: '100%',
    height: wp(24.5) * 1.5,
    resizeMode: 'cover',
    
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'darkgreen',
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
    paddingHorizontal: wp(1.2),
    
  },

  cardProductPriceText: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[400],
    fontSize: 18,
    fontWeight: '800',
  },

  priceMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: wp(1),               // sab ek line me + perfect spacing
  },

  cardProductPriceDiscount: {
    ...Typography.BodyRegular14,
    color: '#9E9E9E',                 // ← 100% safe, hamesha chalega
    textDecorationLine: 'line-through',
    fontSize: 14,
    fontWeight: '700',
  },

  offerView: {
    // backgroundColor: '#E53935',        
    backgroundColor: Colors.PRIMARY[600],
    borderRadius: 50,
    width: 40,
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },

  offerTxt: {
    color: '#000',                
    ...Typography.BodyMedium12,
    fontWeight: '400',
    fontSize: 8,
  },

  txtProduct: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[400],
    paddingHorizontal: wp(1.5),       // pehle 0.8 tha
    numberOfLines: 2,
    top:2,
    bottom:4,
    fontSize:16,
    fontWeight: '700',
    lineHeight: 14,           // pehle 20 tha
  },

  quantityView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: wp(1.5),
    marginTop:0,
    paddingBottom: hp(1.2),   // thoda kam kiya
          // pehle 1 tha
  },

  ratingView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },

  txtRating: {
    ...Typography.BodyRegular13,
    marginLeft: wp(1.2),
    marginTop:'auto',
    color: '#000',
    fontWeight: '600',
  },

  weightText: {
    ...Typography.BodyRegular13,
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },

  addProductButon: {
    height: hp(3.5),
    width: wp(15),
    marginTop:-15,
    paddingRight: 'auto',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionView: {
    width: 75,
    height: 17,
    backgroundColor: Colors.PRIMARY[600],
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonView: {
    width: 75,
    height: 20,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },

  txtOption: {
    color: Colors.PRIMARY[400],
    fontSize: 10,
    fontWeight: '600',
  },

  txtAdd: {
    color: Colors.PRIMARY[300],
    fontSize: 14,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  listProduct: {},
});

export default styles;