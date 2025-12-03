import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../constant/dimentions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[100],
  },
  txtLoginView: {
    padding: hp(4),
    marginTop: hp(12),
  },
  txtLogin: {
    fontFamily: Fonts.Bold,
    fontSize: wp(22),
    left: 10,
    marginBottom: hp(-10),
    color: Colors.PRIMARY[300],
  },
  inputView: {
    width: wp(80),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.FLOATINGINPUT[100],
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[300],
    height: hp(6),
    paddingLeft: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  actionButton: {
    
    width: wp(80),
    
    alignSelf: 'center',
    marginBottom: hp(2),
    marginTop: hp(5),
  },
  actionButtonTitle: {
    color: Colors.PRIMARY[100],
    ...Typography.H5Medium16,
  },
  txtView: {
    width: wp(90),
    marginBottom: hp(10),
    alignSelf: 'center',
    justifyContent: 'center',
  },
  txtWhite: {
    color: Colors.PRIMARY[300],
    ...Typography.BodyMedium12,
  },
  txtYellow: {
    color: Colors.SECONDARY[100],
    ...Typography.BodyMedium12,
    textDecorationLine: 'underline',
  },
});

export default styles;
