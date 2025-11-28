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
  imageView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgRefer: {
    width: wp(100),
    height: hp(40),
    resizeMode: 'contain',
  },
  txtRefer: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontSize: wp(5),
    marginTop: hp(1),
  },
  btnRefer: {
    width: wp(90),
    marginTop: hp(2),
  },
});

export default styles;
