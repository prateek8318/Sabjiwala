import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[300],
  },
  cardView: {
    width: wp(90),
    alignSelf: 'center',
    paddingVertical: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY[100],
    borderRadius: 12,
    padding: hp(2),
    marginTop: hp(2),
  },
  txtTotalBalance: {
    color: Colors.PRIMARY[300],
    ...Typography.BodyRegular13,
  },
  txtBalance: {
    color: Colors.PRIMARY[300],
    fontFamily: Fonts.Medium,
    marginTop: hp(2),
    fontSize: wp(9),
  },
  actionButtonView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: hp(2),
    width: wp(90),
//     height:hp(20),
  },
//   btnView: {
//     width: wp(90),
//     alignSelf: 'center',
//     marginTop: hp(2),
//     height:hp(20)
//   },
btnView: {
  width: wp(90),
  alignSelf: 'center',
  marginTop: hp(2),
  height: hp(7),  // Ensure there is enough height for the button and text
},
  priceMainView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: hp(2),
    width: wp(90),
    marginTop: hp(1),
    alignSelf: 'center',
  },
  priceView: {
    width: wp(25),
    paddingVertical: hp(1),
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.PRIMARY[100],
  },
  priceTxt: {
    color: Colors.PRIMARY[100],
    fontFamily: Fonts.Medium,
    fontSize: wp(4),
  },
  inputContainer: {
    flexDirection: 'row',
    width: wp(90),
    borderRadius: 12,
    marginTop: hp(1),
    borderWidth: 1,
    color: Colors.PRIMARY[400],
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonTitle: {
    color: Colors.PRIMARY[200],
    ...Typography.H5Medium16,
  },
  inputView: {
    ...Typography.BodyMedium14,
    color: Colors.PRIMARY[100],
    width: wp(90),
    paddingLeft: hp(2),
  },
  bottomView: {
    width: wp(100),
    position: 'absolute',
    bottom: 0,
    elevation: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payModeView: {
    width: wp(45),
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: hp(2),
  },
  imgPayMode: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  txtPayMode: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyMedium14,
    marginLeft: hp(1),
  },
  txtPayVia: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontSize: wp(4),
    marginLeft: hp(1),
    marginTop: hp(1),
  },
  txtAmount: {
    color: Colors.PRIMARY[300],
    fontFamily: Fonts.Regular,
    fontSize: wp(4),
  },
  txtPay: {
    color: Colors.PRIMARY[300],
    fontFamily: Fonts.Medium,
    fontSize: wp(5),
  },
  btnPayView: {
    width: wp(45),
    borderRadius: 50,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hp(2),
  },
  txtPayView: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default styles;
