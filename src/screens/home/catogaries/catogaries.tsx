import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  View,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { Header, TextView } from '../../../components';
import styles from './catogaries.styles';
import { useNavigation } from '@react-navigation/native';
import { HomeStackProps } from '../../../@types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { Colors } from '../../../constant';
import ApiService, { IMAGE_BASE_URL } from '../../../service/apiService';

type CatogariesScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'Catogaries'
>;

interface Category {
  _id: string;
  name: string;
  image?: string;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns, with padding

const Catogaries = () => {
  const navigation = useNavigation<CatogariesScreenNavigationType>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getCategory();

      if (response.status === 200 && response.data?.success) {
        setCategories(response.data.data || []);
      } else {
        Toast.show({
          type: 'error',
          text1: response.data?.message || 'Failed to load categories',
        });
      }
    } catch (error: any) {
      console.log('Get Categories Error:', error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderCat = ({ item }: { item: Category }) => {
    // Construct image URL safely
    const imagePath = item.image
      ? `${IMAGE_BASE_URL}${item.image
          .replace('public\\', '')
          .replace(/\\/g, '/')}`
      : null;


    return (
      <Pressable
        style={[styles.itemCatMainView, { width: ITEM_WIDTH }]}
        onPress={() =>
          navigation.navigate('Products', {
            catName: item.name,
            catId: item._id,
          })
        }
      >
        <View style={styles.itemCatView}>
          {/* Category Image */}
          <Image
            source={{
              uri: imagePath || 'https://via.placeholder.com/270x100.png?text=No+Image',
            }}
            style={styles.categoryImage}
            resizeMode="cover"
          />

          {/* Category Name */}
          <TextView style={styles.itemCatTxt}>{item.name}</TextView>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Categories" isBack={true} />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY[300]} />
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <TextView style={styles.emptyText}>No categories found</TextView>
        </View>
      ) : (
        <FlatList
          data={categories}
          numColumns={2}
          keyExtractor={(item) => item._id}
          renderItem={renderCat}
          contentContainerStyle={styles.flatListContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Catogaries;

//
//
// import {
//   FlatList,
//   Pressable,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';
// import React from 'react';
// import { Header, TextView } from '../../../components';
// import styles from './catogaries.styles';
// import { useNavigation } from '@react-navigation/native';
// import { HomeStackProps } from '../../../@types';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
//
// const categories = [
//   {
//     name: 'Grocery',
//     backgroundColor: '#FFEFD5', // light orange tint
//     headColor: '#CC8400', // dark orange shade
//   },
//   {
//     name: 'Electronics',
//     backgroundColor: '#E0F0FF', // light blue tint
//     headColor: '#004C99', // dark blue shade
//   },
//   {
//     name: 'Fashion',
//     backgroundColor: '#FDE6F2', // light pink tint
//     headColor: '#B3005E', // dark pink shade
//   },
//   {
//     name: 'Home Decor',
//     backgroundColor: '#F5EFE6', // light beige tint
//     headColor: '#7A5C2E', // dark beige/brown shade
//   },
//   {
//     name: 'Books',
//     backgroundColor: '#FFF8E1', // light yellow tint
//     headColor: '#B38F00', // dark golden shade
//   },
//   {
//     name: 'Sports',
//     backgroundColor: '#E0F7E9', // light green tint
//     headColor: '#1A7F42', // dark green shade
//   },
//   {
//     name: 'Toys',
//     backgroundColor: '#FFF0E6', // light coral tint
//     headColor: '#CC5230', // dark coral shade
//   },
//   {
//     name: 'Beauty',
//     backgroundColor: '#FCE6EC', // light rose tint
//     headColor: '#B31E4B', // dark rose shade
//   },
//   {
//     name: 'Garden',
//     backgroundColor: '#E0F5F2', // light teal tint
//     headColor: '#007366', // dark teal shade
//   },
//   {
//     name: 'Automotive',
//     backgroundColor: '#E6ECF0', // light steel tint
//     headColor: '#34495E', // dark steel shade
//   },
// ];
//
// type CatogariesScreenNavigationType = NativeStackNavigationProp<
//   HomeStackProps,
//   'Catogaries'
// >;
//
// const Catogaries = () => {
//   const navigation = useNavigation<CatogariesScreenNavigationType>();
//
//   const renderCat = (item: any) => {
//     return (
//       <Pressable
//         style={[
//           styles.itemCatMainView,
//           {
//             backgroundColor: item.item.backgroundColor,
//           },
//         ]}
//         onPress={() =>
//           navigation.navigate('Products', { catName: item.item.name })
//         }
//       >
//         <View
//           style={[
//             styles.itemCatView,
//             {
//               backgroundColor: item.item.headColor,
//             },
//           ]}
//         >
//           <TextView style={styles.itemCatTxt}>{item.item.name}</TextView>
//         </View>
//       </Pressable>
//     );
//   };
//
//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View>
//           <Header title="Categories" isBack={true} />
//         </View>
//
//         <View>
//           <FlatList
//             data={categories}
//             numColumns={2}
//             contentContainerStyle={{ alignSelf: 'center' }}
//             renderItem={renderCat}
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };
//
// export default Catogaries;


///for loader

// import { HomeStackProps } from '../../../@types';
//    import { NativeStackNavigationProp } from '@react-navigation/native-stack';
//    import Toast from 'react-native-toast-message';
//    import { Colors } from '../../../constant';
//    import ApiService, { IMAGE_BASE_URL } from '../../../service/apiService';
//
//    type CatogariesScreenNavigationType = NativeStackNavigationProp<
//      HomeStackProps,
//      'Catogaries'
//    >;
//
//    interface Category {
//      _id: string;
//      name: string;
//      image?: string;
//    }
//
//    const { width } = Dimensions.get('window');
//    const ITEM_WIDTH = (width - 48) / 2;
//
//    const Catogaries = () => {
//      const navigation = useNavigation<CatogariesScreenNavigationType>();
//      const [categories, setCategories] = useState<Category[]>([]);
//      const [loading, setLoading] = useState<boolean>(true);
//      const [refreshing, setRefreshing] = useState<boolean>(false);
//
//      const fetchCategories = async (isRefresh = false) => {
//        try {
//          if (!isRefresh) setLoading(true);
//          else setRefreshing(true);
//
//          const response = await ApiService.getCategory();
//
//          if (response.status === 200 && response.data?.success) {
//            setCategories(response.data.data || []);
//          } else {
//            Toast.show({
//              type: 'error',
//              text1: response.data?.message || 'Failed to load categories',
//            });
//          }
//        } catch (error: any) {
//          console.log('Get Categories Error:', error);
//          Toast.show({
//            type: 'error',
//            text1: error.response?.data?.message || 'Network error. Please try again.',
//          });
//        } finally {
//          setLoading(false);
//          setRefreshing(false);
//        }
//      };
//
//      useEffect(() => {
//        fetchCategories();
//      }, []);
//
//      const onRefresh = useCallback(() => {
//        fetchCategories(true);
//      }, []);
//
//      const renderCat = ({ item }: { item: Category }) => {
//        const imagePath = item.image
//          ? `${IMAGE_BASE_URL}${item.image
//              .replace(/^public[\\/]/, '') // Remove public\ or public/
//              .replace(/\\/g, '/')}`
//          : null;
//
//        return (
//          <Pressable
//            style={[styles.itemCatMainView, { width: ITEM_WIDTH }]}
//            onPress={() =>
//              navigation.navigate('Products', {
//                catName: item.name,
//                catId: item._id,
//              })
//            }
//          >
//            <View style={styles.itemCatView}>
//              <Image
//                source={{
//                  uri: imagePath || 'https://via.placeholder.com/270x100/eeeeee/999999?text=No+Image',
//                }}
//                style={styles.categoryImage}
//                resizeMode="cover"
//    //             defaultSource={require('../../../assets/placeholder.png')} // Optional: local placeholder
//              />
//              <TextView style={styles.itemCatTxt} numberOfLines={2}>
//                {item.name}
//              </TextView>
//            </View>
//          </Pressable>
//        );
//      };
//
//      if (loading && !refreshing) {
//        return (
//          <SafeAreaView style={styles.container}>
//            <Header title="Categories" isBack={true} />
//            <View style={styles.loaderContainer}>
//              <ActivityIndicator size="large" color={Colors.PRIMARY[300]} />
//            </View>
//          </SafeAreaView>
//        );
//      }
//
//      return (
//        <SafeAreaView style={styles.container}>
//          <Header title="Categories" isBack={true} />
//
//          {categories.length === 0 ? (
//            <View style={styles.emptyContainer}>
//              <TextView style={styles.emptyText}>No categories found</TextView>
//            </View>
//          ) : (
//            <FlatList
//              data={categories}
//              numColumns={2}
//              keyExtractor={(item) => item._id}
//              renderItem={renderCat}
//              contentContainerStyle={styles.flatListContent}
//              columnWrapperStyle={styles.columnWrapper}
//              showsVerticalScrollIndicator={false}
//              refreshControl={
//                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//              }
//            />
//          )}
//        </SafeAreaView>
//      );
//    };
//
//    export default Catogaries;