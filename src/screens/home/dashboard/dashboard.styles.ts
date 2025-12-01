import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../constant/dimentions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[300],
  },
  headerContainer: {
    width: wp(100),
    backgroundColor: Colors.PRIMARY[100],
  },
  headerMainView: {
    width: wp(100),
    padding: hp(2),
  },
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(2),
  },
  profilePicView: {
    width: 55,
    height: 55,
    borderColor: Colors.PRIMARY[300],
    borderWidth: 1,
    borderRadius: 50,
    marginTop: hp(2),
  },
  profilePic: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
    borderRadius: 50,
  },
  txtDelivery: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[300],
    marginLeft: hp(1),
  },
  addressView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
  },
  txtAddress: {
    ...Typography.BodyRegular13,
    maxWidth: wp(40),
    color: Colors.PRIMARY[300],
  },
  actionButtonView: {
    flexDirection: 'row',
    marginTop: hp(2),
  },
  actionButton: {
    width: 40,
    height: 40,
  },
  inputView: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[100],
    width: wp(30),
    top: hp(0.5),
    paddingLeft: hp(1),
  },
  searchBox: {
    width: wp(90),
    borderColor: Colors.PRIMARY[300],
    borderWidth: 1,
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
  micView: {
    flexDirection: 'row',
    padding: hp(2),
    position: 'absolute',
    right: 8,
    alignItems: 'center',
  },
  catListView: {
    marginTop: hp(8),
  },
  divider: {
    width: 2,
    height: hp(4),
    backgroundColor: Colors.PRIMARY[300],
    borderRadius: 12,
    margin: hp(2),
  },
  itemCatView: {
    paddingHorizontal: hp(3),
    paddingBottom: hp(1),
    fontWeight: '700',
  },
  itemCat: {
    color: Colors.PRIMARY[300],
    ...Typography.BodyRegular14,
  },
  groceryCard: {
    width: wp(100),
    backgroundColor: Colors.SECONDARY[200],
    paddingBottom: hp(2),
    fontWeight: '700',
  },
  cardMainView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: hp(1),
    
  },
  txtOffer: {
    
    fontWeight: '700',
    color: Colors.PRIMARY[400],
    maxWidth: wp(50),
    marginLeft: hp(2),
    ...Typography.H4Semibold20,
  },
  imgCode: {
    width: 150,
    height: 60,
    resizeMode: 'contain',
    marginTop: hp(2),
    marginLeft: hp(2),
  },
  imgVegatable: {
    width: 190,
    height: 180,
    resizeMode: 'contain',
    marginTop: hp(1),
  },
  listProduct: {
    flex: 1,
    marginBottom: hp(3),
  },
  buttonView: {
    marginTop: hp(-3),
    width: wp(30),
    paddingVertical: hp(1.2), // control vertical space instead of fixed height
    borderRadius: 50,
    alignSelf: 'center',
  },
  
  buttonTitle: {
    color: Colors.PRIMARY[300],
    fontFamily: Fonts.Medium,
    fontSize: wp(4.5),
    lineHeight: wp(4.5),      // prevents extra spacing below text
    textAlign: 'center',
    includeFontPadding: false,
    margin: 0,
    padding: 0,
  },
  
  
  productHeadingMainView: {
    width: wp(100),
    padding: hp(2),
  },
  productHeadingHeadingView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txtProductHeading: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontSize: wp(5),
  },
  txtViewMore: {
    color: Colors.PRIMARY[400],
    ...Typography.H5Medium16,
  },
  groceryCardView: {
    width: wp(94),
    marginTop: hp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txtGrocery: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyMedium13,
    marginTop: hp(1),
  },
  groceryCard1: {
    width: wp(42),
    height: hp(20),
    elevation:5,
    marginLeft: hp(1),
    backgroundColor: '#E8FAA8',
    borderRadius: 12,
  },
  groceryCard2: {
    width: wp(42),
    height: hp(20),
     elevation:5,
    marginRight: hp(1),
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
  },
  commonGroceryCard: {
    width: wp(30),
     elevation:5,
    height: hp(10),
    borderRadius: 12,
  },
  imgDeal: {
    width: 400,
    height: 50,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  cardDealMainView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDealView: {
    margin: hp(1),
    width: wp(28),
    borderColor: Colors.SECONDARY[400],
    borderWidth: 1,
    height: hp(15),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardDealOfferView: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.SECONDARY[400],
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  cardDealTxtOffer: {
    color: Colors.PRIMARY[300],
    ...Typography.H6Semibold13,
  },
  cardDealTxtProduct: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontSize: wp(3),
  },
  
  imgBanner: {
    width: wp(90),
    height: hp(25),
    resizeMode: 'contain',
    alignSelf: 'center',
    margin: hp(1),
  },
  
 
  
});

export default styles;
