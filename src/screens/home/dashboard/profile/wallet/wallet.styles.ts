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
    padding: hp(1.8),
    borderRadius: 12,
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  creditIcon: {
    backgroundColor: 'rgba(76, 209, 96, 0.15)',
  },
  debitIcon: {
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
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
    fontSize: wp(3.8),
    marginBottom: hp(0.5),
  },
  historyDate: {
    color: Colors.PRIMARY[200],
    fontSize: wp(3),
    marginTop: 2,
    fontFamily: Fonts.Regular,
  },
  historyDescription: {
    color: Colors.PRIMARY[200],
    fontSize: wp(3.5),
    marginTop: hp(0.5),
    fontFamily: Fonts.Regular,
  },
  historyAmount: {
    fontFamily: Fonts.Medium,
    fontSize: wp(4),
    marginBottom: 2,
  },
  creditAmount: {
    color: '#4CD160',
    fontFamily: Fonts.SemiBold,
  },
  debitAmount: {
    color: '#FF4757',
    fontFamily: Fonts.SemiBold,
  },
  historyBalance: {
    color: Colors.PRIMARY[200],
    fontSize: wp(3.5),
    marginTop: hp(0.5),
    fontFamily: Fonts.Regular,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(5),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(5),
  },
  emptyText: {
    color: Colors.PRIMARY[200],
    fontSize: wp(3.8),
    fontFamily: Fonts.Medium,
    textAlign: 'center',
  },
  
  // Payment Method Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.PRIMARY[300],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.PRIMARY[100],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.PRIMARY[100],
    fontFamily: Fonts.Medium,
  },
  paymentMethodsList: {
    marginBottom: 20,
  },
  paymentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PRIMARY[100],
    marginBottom: 15,
    marginLeft: 5,
    fontFamily: Fonts.Medium,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.PRIMARY[400],
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.PRIMARY[100],
  },
  selectedPayment: {
    backgroundColor: 'rgba(90, 135, 92, 0.3)',
    borderColor: Colors.PRIMARY[100],
  },
  disabledPayment: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  paymentMethodText: {
    fontSize: 16,
    color: Colors.PRIMARY[100],
    fontFamily: Fonts.Regular,
  },
  disabledText: {
    color: '#9e9e9e',
  },
  comingSoonText: {
    color: Colors.PRIMARY[200],
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: Fonts.Regular,
  },
});

export default styles;
