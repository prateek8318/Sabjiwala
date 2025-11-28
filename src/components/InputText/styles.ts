import { StyleSheet } from 'react-native';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../constant/dimentions';
import { Colors, Typography } from '../../constant';

const styles = StyleSheet.create({

  iconView: {
    height: hp(5),
    marginBottom:hp(1),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: hp(2),
  },
  error: {
    marginTop: 4,
    marginLeft: 4,
    color: Colors.ERROR[300],
    maxWidth: wp(90),
    ...Typography.BodyRegular12,
  },
});

export default styles;
