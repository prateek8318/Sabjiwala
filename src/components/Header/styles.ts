import { StyleSheet } from 'react-native';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../constant/dimentions';
import { Colors, Fonts, Typography } from '../../constant';

const styles = StyleSheet.create({
  headerContainer: {
    padding: hp(2),
    marginTop: hp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imgBack: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontFamily: Fonts.Medium,
    fontSize: wp(6),
    color: Colors.PRIMARY[400],
    fontWeight: 'bold',
  },
});

export default styles;
