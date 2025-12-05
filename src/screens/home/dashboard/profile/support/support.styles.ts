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
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontSize: wp(5),
    marginTop: hp(1),
    padding: hp(1),
  },
  txtContent: {
    ...Typography.BodyRegular14,
    textAlign: 'left',
    letterSpacing: 1,
    marginTop: hp(1),
    padding: hp(1),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(7.5),
    backgroundColor: '#fff',
  },
  headerTitle:{
    color:"#000",
  }
});

export default styles;
