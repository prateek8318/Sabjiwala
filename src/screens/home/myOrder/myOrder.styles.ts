import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../../constant/dimentions';
import { Colors } from '../../../constant';

export default StyleSheet.create({
  // Existing styles
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginVertical: hp(2) },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  orderCard: {
    marginHorizontal: wp(4),
    marginVertical: hp(0.8),
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    paddingBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  statusText: { fontWeight: 'bold', fontSize: 16, color: '#fff' },
  priceText: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  dateText: { fontSize: 12, color: '#747272ff' },

  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(1),
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ffffffff',
    marginRight: 12,
  },
  moreItems: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#CCCCCC',
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionText: { 
    fontSize: 15, 
    color: '#015304',
    fontWeight: '600' 
  },
  actionTextDisabled: { 
    color: '#999', 
    fontWeight: '400' 
  },
  separator: {
    width: 1,
    height: 36,
    backgroundColor: '#CCCCCC',
  },
  empty: { alignItems: 'center', marginTop: hp(20) },
  emptyText: { fontSize: 18, color: '#999' },

  // New styles for OrderSummaryScreen
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 26,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#949494',
    marginVertical: 16,
  },
  itemsCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderColor: '#C7E6AB',
    borderWidth: 1,
    width: '90%',
    maxWidth: '100%',
    alignSelf: 'center',
    shadowColor: 'transparent',
    elevation: 0,
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  productQuantity: {
    color: '#000',
    fontSize: 13,
    opacity: 0.8,
  },
  productPrice: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 'auto',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: {
    color: '#000',
    fontSize: 14,
    marginBottom: 0,
  },
  billValue: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
    marginRight: 8,
    flex: 1,
  },
  detailValue: {
    color: '#000',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginBottom: 0,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  addressName: {
    color: '#000',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 4,
  },
  addressLine: {
    color: '#444',
    fontSize: 14,
    marginBottom:   4,
  },
  addressType: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  rateButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#015304',
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#015304',
    fontWeight: '700',
    fontSize: 16,
  },
  
  // Shipping Address Styles
  shippingAddressContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  addressBox: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    marginTop: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addressName: {
    color: '#1A1A1A',
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 15,
  },
  addressText: {
    color: '#444',
    marginBottom: 6,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  phoneText: {
    color: '#2E7D32',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  addressType: {
    color: '#666',
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'normal',
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  }
});