import { StyleSheet } from 'react-native';
import { Colors } from '../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../constant/dimentions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE ?? '#fff',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(6),
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: wp(7),
    // Keep grid starting from top similar to favorites
    justifyContent: 'flex-start',
    paddingBottom: hp(1),
  },
  shimmerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: wp(6.5),
    paddingBottom: hp(2),
  },
  shimmerCardWrapper: {
    width: '50%',
    paddingHorizontal: wp(1),
    marginBottom: hp(1.5),
  },
  shimmerImage: {
    height: hp(14),
    borderRadius: 12,
    backgroundColor: '#e6e6e6',
  },
  shimmerInfo: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  shimmerLinePrimary: {
    height: 12,
    borderRadius: 8,
    backgroundColor: '#e6e6e6',
    width: '78%',
  },
  shimmerLineSecondary: {
    height: 10,
    borderRadius: 8,
    backgroundColor: '#e6e6e6',
    width: '62%',
  },
  shimmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  shimmerChip: {
    flex: 1,
    height: 12,
    borderRadius: 20,
    backgroundColor: '#e6e6e6',
  },
  shimmerChipSmall: {
    width: 50,
    height: 12,
    borderRadius: 20,
    backgroundColor: '#e6e6e6',
  },
  shimmerBase: {
    overflow: 'hidden',
    backgroundColor: '#e6e6e6',
  },
});

export default styles;

