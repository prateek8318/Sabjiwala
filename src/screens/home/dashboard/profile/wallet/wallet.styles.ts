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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(8),
  },
  cardView: {
    width: wp(90),
    alignSelf: 'center',
    paddingVertical: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY[100],
    borderRadius: 12,
    padding: hp(2),
    marginTop: hp(2),
  },
  txtTotalBalance: {
    color: Colors.PRIMARY[300],
    ...Typography.BodyRegular13,
  },
  txtBalance: {
    color: Colors.PRIMARY[300],
    fontFamily: Fonts.Medium,
    marginTop: hp(2),
    fontSize: wp(9),
  },
  priceMainView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: hp(2),
    width: wp(90),
    marginTop: hp(2),
    alignSelf: 'center',
  },
  priceViewSelected: {
    backgroundColor: Colors.PRIMARY[100],
    borderColor: Colors.PRIMARY[200],
  },
  priceView: {
    width: wp(25),
    paddingVertical: hp(1),
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.PRIMARY[100],
  },
  priceTxt: {
    color: Colors.PRIMARY[100],
    fontFamily: Fonts.Medium,
    fontSize: wp(4),
  },
  inputWrapper: {
    width: wp(90),
    alignSelf: 'center',
    marginTop: hp(2),
  },
  inputContainer: {
    flexDirection: 'row',
    width: wp(90),
    borderRadius: 12,
    borderWidth: 1,
    color: Colors.PRIMARY[400],
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonTitle: {
    color: Colors.PRIMARY[300],
    ...Typography.H5Medium16,
  },
  inputView: {
    ...Typography.BodyMedium14,
    color: Colors.PRIMARY[100],
    width: wp(90),
    paddingLeft: hp(2),
  },
  bottomView: {
    width: wp(100),
    position: 'absolute',
    bottom: 0,
    elevation: 5,
    backgroundColor: Colors.PRIMARY[300],
    paddingTop: hp(1),
    paddingBottom: hp(2),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.PRIMARY[100],
  },
  addMoneyButtonContainer: {
    width: wp(100),
    paddingHorizontal: hp(2),
    alignItems: 'center',
  },
  btnAddMoney: {
    width: wp(90),
    height: hp(7),
  },
  priceTxtSelected: {
    color: '#FFFFFF',  // White text jab selected ho
    fontFamily: Fonts.Medium,
    fontSize: wp(4),
  },
  payModeView: {
    width: wp(45),
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: hp(2),
  },
  imgPayMode: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  txtPayMode: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyMedium14,
    marginLeft: hp(1),
  },
  txtPayVia: {
    color: Colors.PRIMARY[400],
    fontFamily: Fonts.Medium,
    fontSize: wp(4),
    marginLeft: hp(1),
    marginTop: hp(1),
  },
  txtAmount: {
    color: Colors.PRIMARY[300],
    fontFamily: Fonts.Regular,
    fontSize: wp(4),
  },
  txtPay: {
    color: Colors.PRIMARY[300],
    fontFamily: Fonts.Medium,
    fontSize: wp(5),
  },
  btnPayView: {
    width: wp(45),
    borderRadius: 50,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hp(2),
  },
  txtPayView: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnPayViewDisabled: {
    opacity: 0.6,
  },
  historyWrapper: {
    width: wp(90),
    alignSelf: 'center',
    marginTop: hp(2),
    minHeight: hp(20),
  },
  historyTitle: {
    color: Colors.PRIMARY[100],
    fontFamily: Fonts.Medium,
    fontSize: wp(5),
    marginBottom: hp(2),
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.PRIMARY[300],
    padding: hp(2),
    borderRadius: 12,
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: Colors.PRIMARY[100],
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyAction: {
    color: Colors.PRIMARY[100],
    fontFamily: Fonts.Medium,
    fontSize: wp(4),
    marginBottom: hp(0.5),
  },
  historyDate: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular12,
    marginBottom: hp(0.5),
  },
  historyDescription: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular12,
  },
  historyAmount: {
    fontFamily: Fonts.Medium,
    fontSize: wp(4.5),
    marginBottom: hp(0.5),
  },
  creditAmount: {
    color: '#4CAF50',
  },
  debitAmount: {
    color: '#F44336',
  },
  historyBalance: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular12,
  },
  loadingContainer: {
    padding: hp(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: hp(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular14,
  },
});

export default styles;
