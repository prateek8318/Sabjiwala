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

  freeDeliveryContainer: {
    width: '100%',
    backgroundColor: '#C7E6AB',   
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#015304',
    padding: 10,
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  freeDeliveryImage: {
    position: 'fixed',
    right: 10,
    bottom: 0,
    width: 100,
    height: 80,
  },

  freeDeliveryLeft: {
    flex: 1,
    paddingRight: 10,
  },

  freeDeliveryText: {
    color: '#055508',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',

    
  },

  freeDeliveryImage: {
    width: 50,
    height: 50,
    right: 5,
    bottom: -5,
  },

  itemCard: {
    flexDirection: 'row',
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7E6AB',
    padding: hp(1.7),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },

  itemImage: {
    width: wp(18),
    height: wp(18),
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },

  itemInfo: {
    flex: 1,
    marginLeft: wp(3),
    justifyContent: 'space-between',
  },

  itemName: {
    fontSize: hp(2),
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },

  itemWeight: {
    fontSize: hp(1.6),
    color: '#000',
    marginBottom: 6,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  itemPrice: {
    fontSize: hp(2.2),
    fontWeight: '700',
    color: '#000',
  },

  itemOriginalPrice: {
    fontSize: hp(1.6),
    fontWeight: '400',
    color: '#999',
    textDecorationLine: 'line-through',
  },

  itemActions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: wp(2),
    gap: 12,
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C7E6AB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityContainerWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },

  quantityContainerGradient: {
    borderRadius: 20,
    padding: 1,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 19,
    paddingHorizontal: 2,
    paddingVertical: 2,
    minWidth: 40,
    justifyContent: 'space-between',
  },

  quantityButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityButtonText: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: '#02214C',
  },

  quantityNumber: {
    marginHorizontal: 12,
    fontWeight: '800',
    fontSize: hp(1.9),
    color: '#02214C',
    minWidth: 20,
    textAlign: 'center',
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
    paddingHorizontal: 5,
    color: '#000',
  },

  qtyNumber: {
    marginHorizontal: 6,
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

  couponButton: {
    backgroundColor: '#C7E6AB',
    marginHorizontal: wp(4),
    marginTop: hp(2),
    padding: hp(1),
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  couponText: {
    fontSize: hp(2),
    fontWeight: '700',
    color: '#055508',
  },

  paymentBox: {
    backgroundColor: '#C7E6AB',
    
    padding: hp(2),
    
    marginTop: hp(2),
  },

  paymentLabel: {
    fontSize: hp(2),
    fontWeight: '800',
    color: '#055508',
    marginBottom: hp(1.2),
  },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },

  grandTotalRow: {
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#587AA8',
    paddingTop: hp(1.5),
    marginTop: hp(1),
  },

  savingsBox: {
    backgroundColor: '#F5F0FF',
    
    padding: hp(1.5),
    
    marginTop: hp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  savingsText: {
    fontSize: hp(2),
    fontWeight: '700',
    color: '#2E7D32',
  },

  tipBox: {
    backgroundColor: '#C7E6AB',
    
    padding: 14,
    
    marginVertical: 12,
  },

  tipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },

  tipDescription: {
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
    lineHeight: 18,
  },

  tipButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(0.5),
    paddingHorizontal: 2,
    gap: 8,
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

  customTipRow: {
    marginTop: hp(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  customTipLabel: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },

  customTipInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff',
    minWidth: wp(24),
    justifyContent: 'center',
  },

  customTipPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginRight: 4,
  },

  customTipInput: {
    minWidth: wp(10),
    textAlign: 'center',
    fontSize: 14,
    color: '#000',
    padding: 0,
    margin: 0,
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
    backgroundColor: '#1B5E20',
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
    backgroundColor: '#1B5E20',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 30,
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
