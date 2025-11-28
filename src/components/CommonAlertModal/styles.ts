import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constant';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from '../../constant/dimentions';

const styles = StyleSheet.create({
  modalViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: wp(95),
    backgroundColor: Colors.PRIMARY[300],
    borderRadius: 20,
    alignItems: 'center',
    padding: hp(2),
  },
  modalTitleText: {
    color: Colors.PRIMARY[400],
    textAlign: 'center',
    ...Typography.H4Semibold20,
  },
  modalText: {
    marginTop: hp(2),
    color: Colors.PRIMARY[400],
    textAlign: 'center',
    ...Typography.BodyMedium14,
  },
  actionButtonView: {
    marginTop: hp(3),
    alignSelf: 'center',
    marginBottom: hp(1),
    alignItems: 'center',
  },
  cancelButtonView: {
    marginTop: hp(2),
    alignSelf: 'center',
    marginBottom: hp(2),
    alignItems: 'center',
  },
  cancelButton: {
    borderRadius: 40,
    alignItems: 'center',
    paddingVertical: hp(2),
    width: wp(45),
    backgroundColor: Colors.PRIMARY[100],
  },
  caneclButtonText: {
    color: Colors.NEUTRAL[100],
    ...Typography.BodyBold14,
  },
});

export default styles;
