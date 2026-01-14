import { StyleSheet } from 'react-native';
import { Colors } from '../../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../constant/dimentions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.NEUTRAL[100],
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  emptyWrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  listContent: {
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(2.2),
    gap: hp(1.4),
  },
  sectionHeader: {
    paddingHorizontal: wp(4.5),
    paddingTop: hp(1),
    paddingBottom: hp(0.5),
  },
  sectionTitle: {
    color: Colors.PRIMARY[500],
    fontSize: wp(4),
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.PRIMARY[300],
    borderRadius: 25,
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(4),
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#015304",
  },
  title: {
    color: Colors.PRIMARY[100],
    fontSize: wp(4.1),
    fontWeight: '700',
    marginBottom: hp(0.6),
  },
  body: {
    color: Colors.NEUTRAL[300],
    fontSize: wp(3.6),
    marginBottom: hp(1),
    lineHeight: hp(2.4),
  },
  timestamp: {
    color: Colors.SECONDARY[600],
    fontSize: wp(2.1),
    textAlign: 'right',
  },
  emptyText: {
    color: Colors.SECONDARY[700],
    fontSize: wp(4.3),
    fontWeight: '600',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
  },
  notificationBody: {
    marginTop: hp(0.5),
  },
  deleteButton: {
    padding: wp(1),
    marginLeft: wp(2),
  },
  refreshButton: {
    padding: wp(1),
    marginRight: wp(2),
  },
});

export default styles;
