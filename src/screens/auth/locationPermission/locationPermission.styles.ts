import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../constant/dimentions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[300],
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(8),
  },

  imgView: {
    width: wp(80),
    height: wp(80),
    resizeMode: 'contain',
  },

  infoLocation: {
    color: Colors.PRIMARY[100],
    ...Typography.H4Semibold20,
    textAlign: 'center',
    marginHorizontal: wp(8),
    marginTop: hp(4),
  },

  buttonView: {
    width: wp(80),
    marginTop: hp(4),
  },

  buttonTitle: {
    color: Colors.PRIMARY[200],
    ...Typography.H4Semibold20,
    includeFontPadding: false,        
    textAlignVertical: 'center',     
  },
});

export default styles;