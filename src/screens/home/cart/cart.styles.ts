import { StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../constant/dimentions';
import { Colors } from '../../../constant';

const styles: any = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(7.5),
    backgroundColor: '#fff',
  },

  headerTitle: {
    fontSize: hp(2.8),
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
    marginTop: 10,
    color: '#000',
  },

  freeDeliveryBanner: {
    marginHorizontal: wp(4),
    marginTop: hp(1),
    padding: hp(1.7),
    borderRadius: 10,
    borderWidth: 1,
  },

  freeDeliveryText: {
    fontWeight: '700',
    textAlign: 'center',
    fontSize: hp(1.8),
  },

  itemCard: {
    flexDirection: 'row',
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: hp(1.7),
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  itemImage: {
    width: wp(14),
    height: wp(14),
    borderRadius: 10,
  },

  itemInfo: {
    flex: 1,
    marginLeft: wp(3),
  },

  itemName: {
    fontSize: hp(2),
    fontWeight: '700',
    color: '#000',
  },

  itemWeight: {
    fontSize: hp(1.7),
    color: '#777',
    marginTop: 2,
  },

  itemPrice: {
    fontSize: hp(2.2),
    fontWeight: '700',
    marginTop: hp(1),
    color: '#000',
  },

  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 30,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },

  qtyButtonText: {
    fontSize: hp(3),
    paddingHorizontal: 10,
    color: '#000',
  },

  qtyNumber: {
    marginHorizontal: 12,
    fontWeight: '700',
    fontSize: hp(2),
    color: '#000',
  },

  plusButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteButton: {
    marginLeft: wp(2),
    justifyContent: 'center',
  },

  couponButton: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: wp(4),
    marginTop: hp(2),
    padding: hp(2),
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  couponText: {
    fontSize: hp(2),
    fontWeight: '700',
    color: '#000',
  },

  paymentBox: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: wp(4),
    padding: hp(2),
    borderRadius: 12,
    marginTop: hp(2),
  },

  paymentLabel: {
    fontSize: hp(2),
    fontWeight: '800',
    color: '#000',
    marginBottom: hp(1.2),
  },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },

  grandTotalRow: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: hp(1.5),
    marginTop: hp(1),
  },

  savingsBox: {
    backgroundColor: '#F4EFFF',
    marginHorizontal: wp(4),
    padding: hp(1.5),
    borderRadius: 10,
    marginTop: hp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  savingsText: {
    fontSize: hp(2),
    fontWeight: '700',
    color: '#4CAF50',
  },

  tipBox: {
    marginHorizontal: wp(4),
    marginTop: hp(2),
  },

  tipTitle: {
    fontSize: hp(2),
    fontWeight: '700',
    color: '#000',
    marginBottom: hp(1),
  },

  tipButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
  },

  tipButton: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(5),
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  selectedTip: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
  },

  tipText: {
    fontWeight: '700',
    fontSize: hp(1.8),
    color: "#000",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(12),
    paddingHorizontal: wp(6),
  },

  emptyImage: {
    width: wp(42),
    height: wp(42),
    opacity: 0.7,
  },

  emptyTitle: {
    fontSize: hp(2.4),
    color: '#444',
    marginTop: hp(2),
    fontWeight: '700',
  },

  emptySubtitle: {
    fontSize: hp(1.8),
    color: '#888',
    marginTop: hp(0.8),
  },

  browseButton: {
    marginTop: hp(3),
    backgroundColor: '#4CAF50',
    paddingHorizontal: wp(10),
    paddingVertical: hp(1.6),
    borderRadius: 12,
  },

  browseButtonText: {
    color: '#fff',
    fontSize: hp(2),
    fontWeight: '700',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  payButtonContainer: {
    padding: hp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  payAmount: {
    fontSize: hp(3),
    fontWeight: '700',
  },

  placeOrderButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 13,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },

  placeOrderText: {
    fontWeight: '700',
    color: '#000',
    fontSize: hp(2),
  },

});

export default styles;
