// productDetail.styles.ts (added info styles)

import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../../constant/dimentions';
import { Fonts } from '../../../constant';

export default StyleSheet.create({
  imgContainer: { width: wp(100), height: hp(45), position: 'relative' },
  carouselContainer: { width: wp(100), height: hp(45) },
  mainImg: { width: wp(100), height: hp(45) },
  backBtn: { position: 'absolute', top: 40, left: 16, backgroundColor: '#fff', borderRadius: 30, padding: 8, elevation: 5, zIndex: 10 },
  heartBtn: { position: 'absolute', top: 40, right: 16, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 30, padding: 8, elevation: 5, zIndex: 10 },
  imageIndicators: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 4 },
  indicatorActive: { backgroundColor: '#fff', width: 24, height: 8 },

  nameRatingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: wp(4), marginTop: hp(2) },
  nameRatingContainer: { flex: 1 },
  productName: { fontSize: wp(6.5), fontFamily: Fonts.Bold, color: '#000' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: hp(0.5) },
  ratingText: { fontSize: wp(4), color: '#666', marginLeft: wp(1), fontFamily: Fonts.Medium },
  shareBtn: { backgroundColor: '#f0f0f0', borderRadius: 20, padding: 10, marginLeft: wp(2) },
  shareIcon: { width: 20, height: 20, tintColor: '#000' },
  weightText: { fontSize: wp(4), color: '#666', paddingHorizontal: wp(4), marginTop: hp(0.5) },

  priceRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(4), marginTop: hp(1.5) },
  finalPrice: { fontSize: wp(7.5), fontFamily: Fonts.Bold, color: '#000' },
  strikePrice: { fontSize: wp(5), color: '#999', textDecorationLine: 'line-through', marginLeft: wp(3) },
  saveText: { fontSize: wp(4.2), color: '#4CAF50', marginLeft: wp(4), fontFamily: Fonts.Medium },

  qtyBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 30, paddingHorizontal: wp(5), paddingVertical: hp(1.2), marginRight: wp(3) },
  qtyBtnActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  qtyText: { color: '#000', fontFamily: Fonts.Medium },
  qtyTextActive: { color: '#fff' },

  productDetailWrapper: { marginTop: hp(3), paddingHorizontal: wp(4) },
  productDetailTitle: { fontSize: wp(5), fontFamily: Fonts.Bold, color: '#000', marginBottom: hp(1.4) },
  sectionContainer: { marginBottom: hp(2.2) },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: { fontSize: wp(4.2), fontFamily: Fonts.Bold, color: '#000' },
  sectionCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(3),
    borderBottomWidth: 1,
    borderColor: '#f5f5f5',
  },
  sectionRowLast: { borderBottomWidth: 0 },
  sectionLabel: {
    flex: 1,
    fontSize: wp(3.6),
    color: '#777',
    fontFamily: Fonts.Medium,
    paddingRight: wp(2),
  },
  sectionValue: {
    flex: 1,
    fontSize: wp(3.9),
    color: '#000',
    lineHeight: 20,
  },

  bottomCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(10),
    backgroundColor: '#fff',
    elevation: 15,
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
  },
  qtyAdjustBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  qtyAdjustText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  
  priceTag: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  
  cartGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(5) },
  cartLeft: { flexDirection: 'row', alignItems: 'center' },
  cartPrice: { fontSize: wp(6.5), fontFamily: Fonts.Bold, color: '#000', marginLeft: wp(3) },
  addToCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: hp(1.8), paddingHorizontal: wp(7), borderRadius: 50, elevation: 3 },
  addToCartText: { fontSize: wp(4.8), fontFamily: Fonts.Medium, color: '#000', alignItems: 'center', justifyContent: 'center',textAlign: 'center', },
});