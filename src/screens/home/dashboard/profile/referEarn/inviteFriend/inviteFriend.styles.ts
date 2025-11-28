import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../../../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../../constant/dimentions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[300],
  },
  viewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtInvite: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontSize: wp(5),
  },
  inviteView: {
    width: wp(90),
    marginTop: hp(2),
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(2),
    borderRadius: 12,
    backgroundColor: '#E3E3E3',
  },
  inviteCode: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontSize: wp(5),
  },
  actionButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(2),
    width: wp(90),
  },
  btnView: {
    width: wp(40),
    height: 60,
    marginTop: hp(2),
  },
});

export default styles;
