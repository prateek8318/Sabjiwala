import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../constant/dimentions';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    //width:wp(90),
    justifyContent: 'flex-start',
  },
  checkBoxImageView: {
    width: 24,
    height: 24,
  },
  title: {
    marginLeft: hp(1),
    ...Typography.BodyRegular14,
  },
});

export default styles;
