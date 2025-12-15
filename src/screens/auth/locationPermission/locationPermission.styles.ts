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
    marginTop: hp(12),
    width: wp(80),
    height: wp(80),
    resizeMode: 'contain',
  },

  infoLocation: {
    color: Colors.PRIMARY[100],
    ...Typography.H4Semibold20,
    textAlign: 'center',
    fontSize: 18,      // 👈 text size chhota
  lineHeight: 18,
    
    marginTop: hp(3),
  },

  buttonView: {
    width: wp(80),
    marginTop: hp(2),
  },

  buttonTitle: {
    color: Colors.PRIMARY[200],
    ...Typography.H4Semibold20,
    fontSize: 12,      // 👈 text size chhota

    includeFontPadding: false,        
    textAlignVertical: 'center',     
  },
});

export default styles;