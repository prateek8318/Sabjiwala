import { StyleSheet } from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from '../../../constant/dimentions';
import { Fonts, Typography, Colors } from '../../../constant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[100],
  },
  verifyOTPView: {
    marginTop: hp(8),
    width: wp(90),
    alignSelf: 'center',
  },
    actionButtonTitle: {
    color: Colors.PRIMARY[100],
    ...Typography.H5Medium16,
  },
  titleText: {
    color: Colors.PRIMARY[300],
    marginTop: hp(6),
    alignSelf: 'center',
    textAlign:'center',
    ...Typography.BodyRegular14,
  },
  loginImage: {
    width: wp(100),
    alignSelf: 'center',
    height: hp(50),
    top: hp(5),
    resizeMode: 'contain',
  },
  imgBgView: {
    flex: 1,
    marginTop: hp(10),
  },
  imgBg: {
    flex: 1,
    height: hp(60),
  },
  containerView: {
    padding: hp(2),
    marginTop: hp(10),
  },
  otpView: {
    width: wp(80),
    alignSelf: 'center',
  },
  resendView: {
    padding: hp(1),
    marginRight: hp(2),
    alignSelf: 'flex-end',
  },
  resendTxt: {
    color: Colors.PRIMARY[300],
    ...Typography.BodyBold14,
  },
  actionButton: {
    width: wp(90),
    marginTop: hp(8),
    alignSelf: 'center',
  },
  dontReceiveTxt: {
    color: Colors.PRIMARY[300],
    marginTop: hp(1),
    ...Typography.BodyRegular14,
  },
  bottomView: {
    top: hp(4),
    alignSelf: 'center',
  },
  timerText: {
    color: Colors.PRIMARY[300],
    marginTop: hp(1),
    ...Typography.BodyRegular14,
  },
  secText: {
    ...Typography.H6Semibold13,
    color: Colors.SECONDARY[100],
    textDecorationLine: 'underline',
  },
  error: {
    width: wp(90),
    ...Typography.BodyRegular12,
    textAlign: 'center',
  },
});

export default styles;
