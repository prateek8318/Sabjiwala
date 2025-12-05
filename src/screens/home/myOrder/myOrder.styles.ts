import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../../constant/dimentions';
import { Colors } from '../../../constant';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginVertical: hp(2) },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  orderCard: {
    marginHorizontal: wp(4),
    marginVertical: hp(1),
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
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
    marginRight: 8,
    backgroundColor: '#f0f0f0',
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
    marginTop: hp(1),
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  returnBtn: { borderColor: Colors.PRIMARY[300] },
  actionText: { fontSize: 14, color: '#666' },

  empty: { alignItems: 'center', marginTop: hp(20) },
  emptyText: { fontSize: 18, color: '#999' },
});