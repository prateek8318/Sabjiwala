import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: hp(3),
    backgroundColor: '#f8f8f8',
  },
  supportCard: {
    alignItems: 'center',
    width: wp(40),
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E6F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  cardTitle: {
    fontFamily: Fonts.SemiBold,
    fontSize: wp(4.2),
    color: '#000',
  },
  cardSubtitle: {
    fontSize: wp(3.5),
    color: '#666',
    marginTop: 4,
  },
  faqContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  faqTitle: {
    fontFamily: Fonts.Bold,
    fontSize: wp(5),
    color: '#000',
    marginBottom: hp(2),
  },
  faqItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: '#eee',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontFamily: Fonts.Medium,
    fontSize: wp(4),
    color: '#000',
    flex: 1,
    marginRight: wp(3),
  },
  faqAnswerContainer: {
    marginTop: hp(2),
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  faqAnswer: {
    fontSize: wp(3.8),
    color: '#000',
    lineHeight: hp(3),
  },
});

export default styles;