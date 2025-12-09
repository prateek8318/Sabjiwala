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
    padding: hp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderColor: '#A1D9FF',
    borderRadius: 12,
    borderWidth: 1,
   
  },
  itemAddressType: {
    width: wp(20),
    height: wp(7),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY[600],
    borderRadius: 50,
    marginBottom: hp(1),
  },
  itemAddressTypeTxt: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular13,
  },
  itemAddressTxt: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Regular,
    fontSize: wp(3.8),
    lineHeight: hp(2.8),
  },
  imgDelete: {
    
    width: 28,
    height: 28,
    marginBottom: hp(1.5),
  },
  actionsContainer: {
    alignItems: 'center',
  },
  btnEdit: {
    backgroundColor: Colors.PRIMARY[100],
    paddingHorizontal: wp(7),
    paddingVertical: hp(1.3),
    borderRadius: wp(10),
    minWidth: wp(22),
    alignItems: 'center',
  },
  txtEdit: {
    color: '#FFFFFF',
    fontFamily: Fonts.SemiBold,
    fontSize: wp(4),
  },
});

export default styles;