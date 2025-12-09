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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(2),
  },
  inputContainer: {
    flexDirection: 'row',
    width: wp(90),
    borderRadius: 12,
    marginTop: hp(3),
    borderWidth: 1,
    borderColor: Colors.PRIMARY[400],
    height: hp(6),
    alignItems: 'center',
    alignSelf: 'center',
  },
  inputView: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[100],
    height: hp(6),
    width: wp(90),
    paddingLeft: hp(1),
  },
  iconView: {
    height: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: hp(2),
  },
  txtLocation: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[500],
    marginLeft: hp(1),
  },
  addressesSection: {
    marginTop: hp(2),
    paddingHorizontal: wp(5),
  },
  sectionTitle: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[500],
    marginBottom: hp(1),
    fontWeight: '600',
  },
  addressItemContainer: {
    flexDirection: 'row',
    width: wp(90),
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.PRIMARY[300],
  },
  addressTextContainer: {
    flex: 1,
    marginLeft: hp(1),
  },
  addressFullText: {
    ...Typography.BodyRegular12,
    color: Colors.PRIMARY[400],
    marginTop: hp(0.5),
  },
  addressTypeBadge: {
    backgroundColor: Colors.PRIMARY[50],
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: 8,
    marginLeft: wp(2),
  },
  addressTypeText: {
    ...Typography.Footnote10,
    color: Colors.PRIMARY[100],
    fontWeight: '500',
  },
  fullScreenMapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.PRIMARY[300],
    zIndex: 1000,
  },
  fullScreenMapSafeArea: {
    flex: 1,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  mapTitle: {
    ...Typography.H4Semibold20,
    color: Colors.PRIMARY[500],
    fontWeight: '600',
  },
  mapViewContainer: {
    flex: 1,
    marginHorizontal: wp(5),
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapWebView: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.PRIMARY[300],
  },
  mapLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY[300],
  },
  loadingText: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[500],
    fontWeight: '500',
  },
  mapButtonContainer: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
    paddingTop: hp(2),
  },
  confirmButton: {
    width: '100%',
  },
});

export default styles;
