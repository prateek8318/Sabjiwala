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
  cardView: {
    width: wp(90),
    alignSelf: 'center',
    paddingVertical: hp(0.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY[100],
    borderRadius: 12,
    padding: hp(2),
    marginTop: hp(2),
  },
  profileView: {
    marginTop: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  txtEditProfile: {
    color: Colors.PRIMARY[300],
    marginTop: hp(5),
    ...Typography.BodyRegular13,
  },
  inputContainer: {
    flexDirection: 'row',
    width: wp(85),
    borderRadius: 12,
    marginBottom: hp(2),
    borderWidth: 1,
    color: Colors.PRIMARY[400],
    alignItems: 'center',
    alignSelf: 'center',
  },
  inputView: {
    ...Typography.BodyMedium14,
    color: Colors.PRIMARY[100],

    width: wp(90),
    paddingLeft: hp(2),
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#fff",
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  
  smallButton: {
    backgroundColor: Colors.PRIMARY[300],
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  
  submitButton: {
    backgroundColor: Colors.PRIMARY[100],
    height: hp(6),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: hp(2),
  },
  
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  
  buttonView: {
    width: wp(90),
    position: 'absolute',
    bottom: 20,

    alignSelf: 'center',
  },
  buttonTitle: {
    color: Colors.PRIMARY[200],
    ...Typography.H5Medium16,
  },
});

export default styles;
