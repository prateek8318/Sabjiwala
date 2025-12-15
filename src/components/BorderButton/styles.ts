import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../constant';
import { widthPercentageToDP as wp } from '../../constant/dimentions';

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 30,
    paddingVertical: 13,
    alignSelf: 'center',
    borderColor: Colors.PRIMARY[100],
    borderWidth: 1,
    backgroundColor: Colors.PRIMARY[300],
  },
  disabledButtonContainer: {
    borderRadius: 30,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: Colors.SECONDARY[200],
    borderWidth: 1,
    borderColor: Colors.SECONDARY[200],
  },

  buttonView: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: Colors.PRIMARY[300],
    fontSize: wp(5),
    fontFamily: Fonts.Regular,
    lineHeight: 24,
  },
  disabledBtnText: {
    color: Colors.PRIMARY[300],
    ...Typography.BodyBold14,
  },

  indicatorStyle: {
    width: '100%',
    justifyContent: 'center',
  },

  touchableOpacityStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconStyle: {
    width: 10,
    height: 10,
    marginLeft: 5,
    resizeMode: 'contain',
    tintColor: Colors.PRIMARY[300],
  },
});

export default styles;
