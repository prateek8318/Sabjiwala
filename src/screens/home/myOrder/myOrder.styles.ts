import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../../constant/dimentions';
import { Colors } from '../../../constant';

export default StyleSheet.create({
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
  statusText: { fontWeight: 'bold', fontSize: 16 },
  priceText: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  dateText: { fontSize: 12, color: '#888' },

  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(1),
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#fff',
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
    justifyContent: 'space-between',
    marginTop: 6,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#228B22',
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  actionBtnDisabled: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  actionText: { fontSize: 13, color: '#228B22', fontWeight: '700' },
  actionTextDisabled: { color: '#999', fontWeight: '400' },

  empty: { alignItems: 'center', marginTop: hp(20) },
  emptyText: { fontSize: 18, color: '#999' },
});