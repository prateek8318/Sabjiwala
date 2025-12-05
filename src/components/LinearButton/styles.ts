import {StyleSheet} from 'react-native';
import {Colors, Fonts, Typography} from '../../constant';
import {widthPercentageToDP as wp} from '../../constant/dimentions';

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 8,
    paddingVertical: 10,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: Colors.SECONDARY[100],
  },
  disabledButtonContainer: {
    borderRadius: 10,
    paddingVertical: 12,
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
  justifyContent: 'center',
  paddingBottom: 0,        // Adds bottom padding
  paddingTop: 0,            // Optional: ensures no extra top padding
  paddingHorizontal: 0,
  },
  buttonText: {
    color: Colors.PRIMARY[300],
    fontSize: wp(5),
    fontFamily: Fonts.Regular,
    lineHeight: 20,
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
  gradientButton: {
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: hp(5),
    // elevation: 5,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 3,
    // },
    // shadowOpacity: 1,
    // shadowRadius: 5,
  },
});

export default styles;
