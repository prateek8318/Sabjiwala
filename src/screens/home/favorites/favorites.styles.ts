import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography } from '../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../constant/dimentions';

// Card sizing: fully responsive for phones + tablets (no small fixed cap)
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;
const isLargePhone = !isTablet && SCREEN_HEIGHT >= 800;

const CARD_WIDTH = wp(42);               // ~2 cards per row with small gap
// Large / tall phones pe height thodi kam, small & tablet pe same
const CARD_HEIGHT = isLargePhone ? hp(28) : hp(34);
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 0.9;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[300],
  },
  header: {
    paddingTop: hp(6),
    paddingBottom: hp(2),
    paddingHorizontal: wp(4),
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY[300],
  },
  headerTitle: {
    ...Typography.H4Bold20,
    color: Colors.PRIMARY[400],
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY[300],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  emptyText: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[400],
    marginTop: hp(2),
    fontWeight: '600',
  },
  emptySubText: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[400],
    marginTop: hp(1),
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: wp(2),
    paddingBottom: hp(3),
    paddingTop: hp(1),
  },
  cardProduct: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,                    // consistent height across devices
    marginHorizontal: wp(2),
    marginBottom: hp(2.5),
    backgroundColor: Colors.PRIMARY[300],
    borderRadius: 14,
    boxShadow:'20',
    overflow: 'hidden',
    justifyContent: 'space-between',
    shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 6,

  // ===== SHADOW (Android) =====
  elevation: 8,
    
  },
  
  cardProductImage: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: 'darkgreen',
    borderRadius: 14,
    
  },
  
  imgFlashView: { position: 'absolute', top: 6, left: 6 },
  imgFlash: { width: 36, height: 36 },
  imgHeart: { position: 'absolute', top: 8, right: 8 },
  imgTradeMarkView: { position: 'absolute', bottom: 8, right: 8 },
  imgTradeMark: { width: 18, height: 18 },
  cardProductPriceView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: wp(1.5),
    
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(2),
  },
  cardProductPriceText: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[400],
    fontSize: 18,
    fontWeight: '800',
  },
  cardProductPriceDiscount: {
    ...Typography.BodyRegular14,
    color: '#9E9E9E',                 // ← 100% safe, hamesha chalega
    textDecorationLine: 'line-through',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  offerView: {
    // backgroundColor: '#E53935',        
    backgroundColor: '#C7E6AB',
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
    
    fontSize:16,
    fontWeight: '700',
    lineHeight: 16,           // pehle 20 tha
  },

  quantityView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingBottom: hp(1.2),
  },

  // Add button styles
  addButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: hp(0.5),
  },
 addButtonView: {
    width: 75,
    height: 20,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    ...Typography.BodyMedium14,
    fontWeight: '600',
    marginLeft: wp(1),
  },
  quantityButton: {
    width: wp(8),
    height: wp(8),
    borderRadius: 20,
    backgroundColor: '#015304',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp(1),
  },
  quantityText: {
    color: '#fff',
    ...Typography.H5Medium16,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 2,
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
  addProductButon: {
    height: hp(3.5),
    width: wp(22), // wider like original
    borderRadius: 50,
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
    
  },
  variantOptionsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    elevation: 5,
    zIndex: 10,
  },
  variantOption: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  variantOptionText: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[400],
  },

  txtWeight: {
    ...Typography.BodyRegular13,
    color: Colors.PRIMARY[400],
    top:0,
  },
  ratingView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },

  txtRating: {
    ...Typography.BodyRegular13,
    marginLeft:'auto' ,
    marginTop:'auto',
    color: '#000',
    fontWeight: '600',
  },
  addProductButon: {
    height: hp(3.5),
    width: wp(15),
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  
  
  cartButton: {
    height: hp(3),
    width: hp(3),
    borderRadius: hp(3),
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonText: {
    fontSize: hp(2),
    color: '#000',
    fontWeight: '600',
    marginBottom: 2,
  },
  quantityText: {
    fontSize: hp(2),
    fontWeight: '600',
    color: '#000',
    minWidth: wp(2),
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCloseButton: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalCloseIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.PRIMARY[200],
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: hp(80),
    paddingBottom: hp(4),
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
  },
  variantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DFF0D8',
    borderRadius: 10,
    marginBottom: 12,
  },
  variantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  variantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  variantName: {
    color: '#000',
    ...Typography.H5Medium16,
  },
  variantWeight: {
    color: '#000',
    ...Typography.BodyRegular14,
    marginTop: 4,
  },
  variantPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  variantPrice: {
    color: '#000',
    ...Typography.H5Medium16,
    fontWeight: '600',
  },
  variantOldPrice: {
    color: '#000',
    textDecorationLine: 'line-through',
    marginLeft: 8,
    ...Typography.BodyRegular14,
  },
  variantAddButton: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    backgroundColor: 'green',
    borderRadius: 10,
  },
  variantAddText: {
    color: '#fff',
    ...Typography.BodyRegular14,
    fontWeight: '600',
  },
});

export default styles;
