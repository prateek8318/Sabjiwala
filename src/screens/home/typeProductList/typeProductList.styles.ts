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
});

export default styles;

