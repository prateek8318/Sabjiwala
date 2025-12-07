import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../constant/dimentions';

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
  },
  quantityView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: wp(3),
    paddingBottom: hp(1.5),
    marginTop: hp(1),
  },
  txtWeight: {
    ...Typography.BodyRegular13,
    color: Colors.PRIMARY[400],
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
