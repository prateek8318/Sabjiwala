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
    alignSelf: 'stretch',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: wp(2),
    width: '100%',
    marginTop: hp(3),
    marginBottom: hp(1),
  },
  exitButton: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.PRIMARY[100],
    paddingVertical: hp(1.4),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY[100],
    shadowColor: Colors.PRIMARY[200],
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  secondaryButton: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.PRIMARY[100],
    paddingVertical: hp(1.4),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.NEUTRAL[100],
    shadowColor: Colors.PRIMARY[200],
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  exitButtonText: {
    color: Colors.PRIMARY[300],
    ...Typography.BodyBold14,
  },
  secondaryButtonText: {
    color: Colors.PRIMARY[100],
    ...Typography.BodyBold14,
  },
});

export default styles;
