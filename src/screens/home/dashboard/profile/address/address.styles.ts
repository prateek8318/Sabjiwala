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
  txtSavedAddress: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontSize: wp(4),
  },
  itemAddressView: {
    width: wp(90),
    marginTop: hp(2),
    padding: hp(1),
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#A1D9FF',
    borderRadius: 12,
    borderWidth: 1,
  },
  itemAddressType: {
    width: wp(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY[600],
    borderRadius: 50,
  },
  itemAddressTypeTxt: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular13,
  },
  itemAddressTxt: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Regular,
    fontSize: wp(3.5),
    margin: hp(1),
  },
  imgDelete: {
    width: 30,
    height: 30,
    alignSelf: 'flex-end',
  },

  btnEditView: {
    width: wp(18),
    borderRadius: 50,
    height: 35,
    marginTop: hp(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtEdit: {
    color: Colors.PRIMARY[300],
    fontFamily: Fonts.Regular,
    fontSize: wp(3),
  },
});

export default styles;
