import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../../../constant/dimentions';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: hp(2.5),
    fontWeight: '700',
    color: '#000',
  },
  addAllContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: hp(1.5),
    gap: 8,
  },
  addAllButtonText: {
    color: '#fff',
    fontSize: hp(2),
    fontWeight: '700',
  },
  listContent: {
    padding: wp(4),
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    padding: wp(4),
    marginBottom: hp(2),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: wp(3),
  },
  productName: {
    fontSize: hp(2),
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: hp(1.6),
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: hp(2),
    fontWeight: '700',
    color: '#4CAF50',
  },
  mrp: {
    fontSize: hp(1.6),
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: hp(1.8),
    fontWeight: '700',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  paginationButton: {
    padding: 8,
  },
  paginationButtonDisabled: {
    opacity: 0.3,
  },
  paginationText: {
    fontSize: hp(1.8),
    color: '#000',
    marginHorizontal: wp(4),
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: hp(20),
  },
  emptyText: {
    fontSize: hp(2),
    color: '#999',
  },
});
