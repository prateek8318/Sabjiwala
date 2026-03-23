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
  txtHeading: {
    color: "#000",
    fontFamily: Fonts.Bold,
    fontSize: wp(5),
    marginTop: hp(1),
    padding: hp(1),
  },
  txtContent: {
    ...Typography.BodyRegular14,
    color: "#000",
    textAlign: 'left',
    letterSpacing: 1,
    marginTop: hp(1),
    padding: hp(1),
  },
  txtTitle: {
    color: "#000",
    fontFamily: Fonts.Bold,
    fontSize: wp(5),
    marginTop: hp(1),
    padding: hp(1),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(5),
  },
  loadingText: {
    ...Typography.BodyRegular14,
    color: "#000",
    marginTop: hp(2),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(5),
  },
  errorText: {
    ...Typography.BodyRegular14,
    color: "#FF0000",
    textAlign: 'center',
    marginBottom: hp(2),
  },
  retryButton: {
    backgroundColor: Colors.PRIMARY[300],
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(2),
  },
  retryButtonText: {
    ...Typography.BodyMedium14,
    color: "#FFFFFF",
  },
});

export default styles;
