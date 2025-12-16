


import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../../constant';

 const { width } = Dimensions.get('window');
 const ITEM_WIDTH = (width - 48) / 2;

 export default StyleSheet.create({
   container: {
     flex: 1,
     fontWeight: 'bold',
     backgroundColor: '#fff',
   },
   title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,

  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor:'#000',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 4,
    fontSize: 14,
    color: '#212121',
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  chipActive: {
    backgroundColor: Colors.PRIMARY[300],
  },
  chipTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
   flatListContent: {
     paddingHorizontal: 16,
    paddingTop: 12,
     paddingBottom: 20,
   },
   columnWrapper: {
     justifyContent: 'space-between',
   },
   itemCatTxt: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 150,           
    borderRadius: 12,
  },
  itemCatMainView: {
    width: ITEM_WIDTH,
    height: 140,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  itemCatView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
   
   loaderContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
   },
   emptyContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     paddingHorizontal: 30,
   },
  emptyText: {
     fontSize: 16,
     color: '#9E9E9E',
     textAlign: 'center',
   },
  shimmerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  shimmerCardWrapper: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shimmerImage: {
    height: 150,
    borderRadius: 12,
    backgroundColor: '#e6e6e6',
  },
  shimmerInfo: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  shimmerLinePrimary: {
    height: 14,
    borderRadius: 8,
    backgroundColor: '#e6e6e6',
    width: '78%',
  },
  shimmerLineSecondary: {
    height: 12,
    borderRadius: 8,
    backgroundColor: '#e6e6e6',
    width: '62%',
  },
  shimmerBase: {
    overflow: 'hidden',
    backgroundColor: '#e6e6e6',
  },
 });