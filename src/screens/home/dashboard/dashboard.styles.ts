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
    marginBottom: 0,
    paddingBottom: 0,
  },
  headerContainer: {
    width: wp(100),
    backgroundColor: "#015304",
  },
  stickyHeaderContainer: {
    width: wp(100),
    backgroundColor: "#015304",
    paddingTop: hp(0.6),
    
    zIndex: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerMainView: {
    width: wp(100),
    padding: hp(2),
  },
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    
  },
  profilePicView: {
    width: 40,
    height: 40,
    borderColor: Colors.PRIMARY[300],
    borderWidth: 1,
    borderRadius: 50,
    marginTop: hp(4),
    marginLeft: hp(1),
    overflow: 'hidden', // keep image clipped inside the circle
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePic: {
    width: 40,
    height: 40,
    resizeMode: 'cover',
    borderRadius: 50,
  },
  txtDelivery: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[300],
    marginTop: hp(2),
    marginLeft: hp(1),
  },
  addressView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
  },
  txtAddress: {
    ...Typography.BodyRegular13,
    maxWidth: wp(45),
    marginLeft: hp(0.5),
    color: Colors.PRIMARY[300],
  },
  actionButtonView: {
    flexDirection: 'row',
    marginTop: hp(4),
  },
  actionButton: {
    width: 40,
    height: 40,
  },
  inputView: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[100],
    width: wp(65),
    
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
    marginTop: hp(1.4),
  },
  divider: {
    width: 2,
    height: hp(2),
    backgroundColor: Colors.PRIMARY[300],
    borderRadius: 12,
    margin: hp(2),
  },
  itemCatView: {
    paddingHorizontal: hp(2),
    paddingBottom: hp(1),
    fontWeight: '700',
  },
  itemCat: {
    color: Colors.PRIMARY[300],
    ...Typography.BodyRegular14,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    FontVariants: 'Poppins-Regular',
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
    fontSize: 28,
    lineHeight: 38,
  },
  imgCode: {
    width: 150,
    height: 60,
    resizeMode: 'contain',
    marginTop: hp(2),
    marginLeft: hp(2),
  },
  imgVegatable: {
    width: 180,
    height: 190,
    resizeMode: 'contain',
    marginTop: hp(1),
  },
  listProduct: {
    flex: 1,
    marginBottom: 0,
    paddingBottom: 0,
    marginTop: hp(-5),
  },
  buttonView: {
    marginTop: hp(-4),
    marginBottom: hp(1),
    width: wp(35),
    paddingVertical: hp(1.2),
    borderRadius: 50,
    alignSelf: 'center',
  },
  
  buttonTitle: {
    color: Colors.PRIMARY[300],
    fontFamily: Fonts.Medium,
    fontSize: wp(5.5),
    lineHeight: wp(4.5),      // prevents extra spacing below text
    textAlign: 'center',
    includeFontPadding: false,
    margin: 0,
    padding: 0,
  },
  
  
  productHeadingMainView: {
    width: wp(100),
    paddingVertical: hp(1.2),
    paddingHorizontal: hp(2),
    marginBottom: 0,
  },
  productHeadingHeadingView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txtProductHeading: {
    color: Colors.PRIMARY[400],
    fontSize: wp(5.8),
    lineHeight: wp(6.2),
    fontWeight: '800',
    marginBottom: hp(1),
  },
  txtViewMore: {
    color: '#000',
    fontWeight: 700,
    fontSize: 28,
  },
  groceryCardView: {
    width: wp(90),
    marginTop: hp(2),
    marginLeft: hp(0),
    flexDirection: 'row',
    justifyContent:'space-evenly',
  },
  txtGrocery: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyMedium13,
    marginTop: hp(1),
  },
  groceryCard1: {
    width: wp(40),
    height: hp(16),
    elevation:5,
    marginLeft: hp(0.5),
    backgroundColor: '#E8FAA8',
    borderRadius: 12,
  },
  groceryCard2: {
    width: wp(40),
    height: hp(16),
     elevation:5,
    
    backgroundColor: '#E3E3E3',
    borderRadius: 12,
  },
  commonGroceryCard: {
    width: wp(28),
     elevation:6,
    height: hp(10),
    borderRadius: 12,
    margin: hp(.5),
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
    margin: hp(0.6),
    width: wp(28),
    borderColor: Colors.SECONDARY[400],
    borderWidth: 1,
    minHeight: hp(13),
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
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
  cardDealImageWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: wp(2),
  },
  cardDealImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  cardDealImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F2',
  },
  cardDealTxtProduct: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontSize: wp(3),
  },
  
  imgBanner: {
    width: wp(95),
    height: hp(25),
    marginTop: hp(-2),
    resizeMode: 'contain',
    alignSelf: 'center',
    
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: hp(1),
    alignSelf: 'center',
    zIndex: 1000,
  },
  cartGradient: {
    borderRadius: 28,
    paddingLeft: wp(7), // extra space for overlapping image
    paddingRight: wp(3.4),
    paddingVertical: hp(0.9),
    minWidth: wp(42),
    maxWidth: wp(90),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 4.5,
    elevation: 10,
  },
  cartButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
  },
  stackedImagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -wp(4), // pull image outside left edge of pill
  },
  cartProductImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#015304',
  },
  stackedImage: {
    marginLeft: -wp(6),
  },
  cartProductImage: {
    width: '100%',
    height: '100%',
  },
  cartProductImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1B5E20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Fonts.Medium,
  },
  cartTextBlock: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginHorizontal: wp(2),
  },
  cartButtonSubText: {
    color: '#E8F5E9',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Fonts.Medium,
  },
  arrowCircle: {
    // No circle background – just a small wrapper to align the arrow icon
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp(1),
  },
});

export default styles;
