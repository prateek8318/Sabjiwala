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
  cardView: {
    width: wp(90),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY[100],
    borderRadius: 12,
    padding: hp(2),
    marginTop: hp(1),
  },
  profilePicView: {
    width: 75,
    height: 75,
    borderColor: Colors.PRIMARY[300],
    borderWidth: 1,
    borderRadius: 50,
    marginTop: hp(2),
    overflow: 'hidden', // keep image within circle
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicContainer: {
    position: 'relative',
    
  },
  cameraIconView: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: "#000",
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    borderColor: '#fff',
    
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  profilePic: {
    width: 85,
    height: 85,
    resizeMode: 'cover',
    borderRadius: 50,
  },
  profileView: {
    marginTop: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  txtEditProfile: {
    color: Colors.PRIMARY[300],
    ...Typography.BodyRegular13,
    marginTop: hp(-2),
    marginBottom: hp(1),

  },
  txtUserDetail: {
    color: Colors.PRIMARY[300],
    ...Typography.H5Medium16,
    marginTop: hp(-0.5),
    lineHeight: hp(3),
  },
  otherCardView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: hp(2),
  },
  otherCads: {
    width: wp(43),
    height: hp(11),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: hp(2),
    marginTop: hp(1),
  },
  itemMenuView: {
    width: wp(90),
    paddingVertical: hp(1.5),
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 5,
    padding: hp(1),
    marginTop: hp(2),
     shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 4,
  borderColor: '#015304',
    justifyContent: 'space-between',
  },
  txtMenu: {
    color: Colors.PRIMARY[100],
    ...Typography.H5Medium16,
    marginLeft: hp(1),
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalViewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(90),
    paddingVertical: hp(2),
    elevation: 5,
    borderRadius: 12,
    backgroundColor: Colors.PRIMARY[300],
  },
  txtSure: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontWeight:"700",
    fontSize: wp(5),
    textAlign: 'center',
  },
  buttonView: {
    flexDirection: 'row',
    marginTop: hp(2),
    width: wp(80),
    justifyContent: 'space-between',
  },
  buttonTitle: {
    color: Colors.PRIMARY[100],
    ...Typography.H5Medium16,
    
  },
});

export default styles;
