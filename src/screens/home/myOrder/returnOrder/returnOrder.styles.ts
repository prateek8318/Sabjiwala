import { StyleSheet } from 'react-native';
import { Colors } from '../../../../constant';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from '../../../../constant/dimentions';

export default StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginTop: hp(4), alignItems: 'center', flex: 1, textAlign: 'center' },

  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 16,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8dd',
    marginBottom: 12,
  },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9ccc65',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkboxFill: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#558b2f',
  },

  productImg: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginRight: 14,
  },

  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '700', color: '#000' },
  variantText: { fontSize: 13, color: '#666', marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  price: { fontSize: 16, fontWeight: '700', color: '#000' },
  oldPrice: { fontSize: 13, color: '#999', textDecorationLine: 'line-through', marginLeft: 8 },

  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },

  tinyLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 12,
    marginBottom: 4,
  },

  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },

  primaryBtn: {
    backgroundColor: '#2e7d32',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#a5d6a7',
  },
  
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});