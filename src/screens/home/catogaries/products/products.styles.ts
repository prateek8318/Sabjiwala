import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../constant/dimentions';
export interface ProductVariant {
  id: string;
  price: number;
  unit: string;
  mrp?: number;
  discount?: number;
  stock?: number;
}

export interface Product {
  id: string;
  name: string;
  images: string[];          // dashboard.tsx me use ho raha hai
  categoryId?: string;
  description?: string;

  variants: ProductVariant[]; // dashboard.tsx yahi field expect karta hai

  rating?: number;
  isFeatured?: boolean;
  isAvailable?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[300],
  },
  viewContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  itemCatView: {
    padding: hp(1),
    borderRightWidth: 1,
    borderRightColor: '#E9E9E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgCat: {
    width: 55,
    height: 55,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  txtCat: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular13,
    textAlign: 'center',
  },
  filterMainView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sortView: {
    width: wp(20),
    padding: hp(0.2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    marginLeft: hp(1),
    borderColor: Colors.PRIMARY[600],
    flexDirection: 'row',
  },
  txtSort: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyMedium14,
  },
  imgSort: {
    width: 22,
    height: 22,
    marginLeft: hp(0.5),
  },
  filterView: {
    width: wp(20),
    padding: hp(0.2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    marginLeft: hp(1),
    borderColor: Colors.PRIMARY[600],
    flexDirection: 'row',
  },
  txtFilter: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyMedium14,
  },
  imgFilter: {
    width: 22,
    height: 22,
    marginLeft: hp(0.5),
  },
  bottomSheetMainView: {
    alignSelf: 'center',
    padding: 10,
  },
  imgClose: {
    width: 50,
    height: 50,
  },
  bottomSheetView: {
    width: wp(100),
    flex: 1,
    backgroundColor: 'white',
  },
  productCardView: {
    width: wp(90),
    height: hp(10),
    alignSelf: 'center',
    marginTop: hp(2),
    borderRadius: 12,
    padding: hp(1),
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.PRIMARY[600],
  },
  imgProduct: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  txtProduct: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontSize: wp(4),
    marginLeft: hp(2),
  },
  txtProductQuantity: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Regular,
    fontSize: wp(3),
    marginLeft: hp(2),
  },
  txtProductOffPrice: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontSize: wp(3),
    marginLeft: hp(2),
  },
  txtOfferCutPrice: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Regular,
    fontSize: wp(3),
    textDecorationLine: 'line-through',
    marginLeft: hp(2),
  },
  addProductButon: {
    height: 30,
    width: 70,
    borderRadius: 50,
    marginLeft: hp(10),
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtAdd: {
    color: Colors.PRIMARY[300],
    ...Typography.BodyRegular13,
  },
  searchBox: {
    width: wp(90),
    borderColor: Colors.PRIMARY[400],
    borderWidth: 1,
    marginTop: hp(2),
    alignSelf: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: hp(2),
  },
  imgSearchView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputView: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[100],
    width: wp(90),
    top: hp(0.5),
    paddingLeft: hp(1),
  },
  imgSearch: {
    width: wp(100),
    height: hp(40),
    resizeMode: 'contain',
  },
  tabView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    alignItems: 'center',
  },
  tabs: {
    width: wp(35),
    margin: hp(2),
    alignItems: 'center',
    paddingBottom: hp(2),
    borderBottomWidth: 2,
    borderBottomColor: Colors.PRIMARY[100],
    justifyContent: 'center',
  },
  itemCat: {
    padding: hp(1),
    marginLeft: hp(2),
  },
  actionButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp(90),
    alignSelf: 'center',
    marginTop: hp(2),
  },
  buttonTitle: {
    color: Colors.PRIMARY[200],
    ...Typography.H5Medium16,
  },
  applyButton: {
    height: 60,
    width: wp(40),
    borderRadius: 50,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtApply: {
    color: Colors.PRIMARY[300],
    fontFamily: Fonts.Medium,
    fontSize: wp(4),
  },
  buttonView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(1),
    marginLeft:hp(2)
  },
  radioButton: {
    width: 24,
    height: 24,
  },
  radioButtonTitle: {
    ...Typography.BodyRegular14,
    left: hp(2),
  },
  txtSortByView: {
    alignSelf: 'center',
    padding: hp(2),
  },
  txtSortBy: {
    color: Colors.PRIMARY[100],
    fontFamily: Fonts.Medium,
    fontSize: wp(5),
  },
});

export default styles;
