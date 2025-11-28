import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../../../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../../constant/dimentions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[300],
  },
  viewContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  imgMapView: {
    width: wp(100),
    height: hp(30),
  },
  imgMap: {
    width: wp(100),
    height: hp(30),
    resizeMode: 'cover',
  },
  inputContainer: {
    flexDirection: 'row',
    width: wp(90),
    borderRadius: 12,
    marginTop: hp(3),
    borderWidth: 1,
    borderColor: Colors.PRIMARY[400],
    height: hp(6),
    alignItems: 'center',
    alignSelf: 'center',
  },
  inputView: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[100],
    height: hp(6),
    width: wp(90),
    paddingLeft: hp(1),
  },
  iconView: {
    height: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: hp(2),
  },
  txtLocation: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[500],
    marginLeft: hp(1),
  },

  txtOrderInfo: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular14,
    marginTop: hp(2),
    marginHorizontal: hp(5),
  },

  lineDivider: {
    width: wp(100),
    height: 1,
    marginTop: hp(1),
    backgroundColor: Colors.PRIMARY[100],
  },
  addressView: {
    flexDirection: 'row',
    marginHorizontal: hp(3),
    marginTop: hp(2),
  },
  txtAddress: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular14,
    marginLeft:hp(1)
  },
  txtFullAddress: {
    fontFamily: Fonts.Light,
    fontSize: wp(3),
    maxWidth:wp(50),
    marginLeft:hp(1)
  },
  addressType: {
    width: wp(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY[600],
    borderRadius: 50,
    marginLeft:hp(2)
  },
  addressTypeTxt: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular13,
  },
  actionButtonView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    width: wp(90),
  },
  buttonTitle: {
    color: Colors.PRIMARY[200],
    ...Typography.H5Medium16,
  },
  btnView: {
    width: wp(90),
    alignSelf: 'center',
    marginBottom: hp(2),
  },
});

export default styles;
