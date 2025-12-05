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
  txtHeading: {
    color: "#000",
    fontFamily: Fonts.Bold,
    fontSize: wp(5),
    marginTop: hp(1),
    padding: hp(1),
  },
  txtContent: {
    ...Typography.BodyRegular14,
    color: "#000",
    textAlign: 'left',
    letterSpacing: 1,
    marginTop: hp(1),
    padding: hp(1),
  },
});

export default styles;
