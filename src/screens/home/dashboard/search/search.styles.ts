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
  inputView: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[100],
    width: wp(90),
    top: hp(0.5),
    paddingLeft: hp(1),
  },
  searchBox: {
    width: wp(90),
    borderColor: Colors.PRIMARY[400],
    borderWidth: 1,
    alignSelf: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: hp(2),
  },
  imgSearchView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgSearch: {
    width: wp(100),
    height: hp(40),
    resizeMode: 'contain',
  },
});

export default styles;
