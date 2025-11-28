import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../constant/dimentions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[300],
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
});

export default styles;
