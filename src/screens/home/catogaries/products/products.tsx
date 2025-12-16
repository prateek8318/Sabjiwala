import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FlatList, Image, Pressable, SafeAreaView, TouchableOpacity, View, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import ApiService, { IMAGE_BASE_URL } from '../../../../service/apiService';
import styles from './products.styles';
import { Colors, Images } from '../../../../constant';
import { Header, TextView } from '../../../../components';
import ProductCard from './components/ProductCard/productCard';
import RBSheet from 'react-native-raw-bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import CustomBlurView from '../../../../components/BlurView/blurView';
import { ProductCardItem } from '../../../../@types';

const Products = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [products, setProducts] = useState<ProductCardItem[]>([]);

  const addProductBottomSheet = useRef<any>(null);
  const searchProductBottomSheet = useRef<any>(null);
  const sortProductBottomSheet = useRef<any>(null);
  const [isBlur, setIsBlur] = useState(false);

  const transformProductToCard = useCallback((product: any): ProductCardItem => {
    const variant =
      product?.ProductVarient?.[0] ||
      product?.variants?.[0] ||
      {};

    const preferredImages =
      (Array.isArray(variant?.images) && variant.images.length > 0
        ? variant.images
        : null) ||
      (Array.isArray(product?.primary_image) && product.primary_image.length > 0
        ? product.primary_image
        : null) ||
      (Array.isArray(product?.images) && product.images.length > 0
        ? product.images
        : []);

    const rawImage = preferredImages?.[0] || '';
    const normalizedImage = rawImage ? rawImage.replace(/\\/g, '/') : '';
    const fullImageUrl = normalizedImage ? IMAGE_BASE_URL + normalizedImage : '';

    const weightValue =
      variant?.weight ??
      product?.weight ??
      variant?.stock ??
      product?.stock ??
      1;
    const unitValue = variant?.unit ?? product?.unit ?? '';

    return {
      id: product?._id || '',
      name: product?.productName || product?.name || 'Product',
      image: fullImageUrl,
      price: variant?.price || product?.price || 0,
      oldPrice: variant?.originalPrice || product?.mrp || 0,
      discount: variant?.discount ? `₹${variant.discount} OFF` : '',
      weight: `${weightValue} ${unitValue}`.trim(),
      rating: product?.rating || 4.5,
      options: `${(product?.ProductVarient || product?.variants || []).length} Option${((product?.ProductVarient || product?.variants || []).length || 0) > 1 ? 's' : ''}`,
      variantId:
        variant?._id ||
        product?.ProductVarient?.[0]?._id ||
        product?.variants?.[0]?._id ||
        '',
      ProductVarient: product?.ProductVarient || product?.variants || [],
    };
  }, []);

  const fetchProducts = useCallback(async (subCategoryId: string | null) => {
    if (!subCategoryId) return;
    try {
      setProductLoading(true);
      const res = await ApiService.getSubCategoryProducts(subCategoryId);
      if (res?.status === 200 && res?.data?.paginateData) {
        const apiProducts = res.data.paginateData;
        setProducts(apiProducts.map((p: any) => transformProductToCard(p)));
      } else {
        setProducts([]);
      }
    } catch (err) {
      setProducts([]);
      console.log('Error fetching products for subcategory:', err);
    } finally {
      setProductLoading(false);
    }
  }, [transformProductToCard]);

  // ✅ Fetch subcategories dynamically from API
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        const categoryId = route?.params?.catId; // ← get categoryId from navigation params
        const response = await ApiService.getSubCategoryList(categoryId);
        if (response.data?.success) {
          const list = response.data.subCategoryData || [];
          setSubCategories(list);
          if (list.length > 0) {
            const firstId = list[0]?._id;
            setSelectedId(firstId);
            fetchProducts(firstId);
          } else {
            setSelectedId(null);
            setProducts([]);
          }
        }
      } catch (error) {
        console.log('Error fetching subcategories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [route?.params?.catId, fetchProducts]);

  // ✅ Render each subcategory item
  const renderProductType = ({ item }: any) => {
    const isSelected = selectedId === item._id;
    const imageUri = item?.image
      ? `${IMAGE_BASE_URL}${item.image}`.replace(/\\/g, '/')
      : '';
    console.log('Products Subcategory Image → id:', item?._id, '| name:', item?.name, '| raw:', item?.image, '| final:', imageUri);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          setSelectedId(item._id);
          fetchProducts(item._id);
        }}
        style={[
          styles.itemCatView,
          {
            borderBottomWidth: isSelected ? 3 : 0,
            borderBottomColor: isSelected ? Colors.PRIMARY[100] : 'transparent',
          },
        ]}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imgCat} />
        ) : (
          <View style={[styles.imgCat, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }]}>
            <TextView style={{ fontSize: 11, color: '#888' }}>No image</TextView>
          </View>
        )}
        <TextView style={styles.txtCat}>{item.name}</TextView>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={route?.params?.catName || 'Products'}
        rightIcon={true}
        rightIconName={Images.ic_search}
        rightIconPress={() => navigation.navigate('Search')}
      />

      {isBlur && <CustomBlurView />}

      <View style={{ flex: 1 }}>
        <View style={styles.viewContainer}>
          {/* ✅ Subcategory list */}
          <View>
            {loading ? (
              <TextView style={{ textAlign: 'center', marginVertical: 20 }}>
                Loading subcategories...
              </TextView>
            ) : (
              <FlatList
                data={subCategories}
                renderItem={renderProductType}
                keyExtractor={item => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            )}
          </View>

          {/* Product grid placeholder — your existing component */}
          <View style={{ flex: 1 }}>
            {productLoading ? (
              <TextView style={{ textAlign: 'center', marginTop: 20 }}>Loading products...</TextView>
            ) : (
              <ProductCard
                cardArray={products}
                type="OFFER"
                horizontal={false}
                numOfColumn={2}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Products;


// import {
//   FlatList,
//   Image,
//   Pressable,
//   SafeAreaView,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import React, { useRef, useState } from 'react';
// import {
//   BorderButton,
//   Header,
//   RadioButton,
//   TextView,
// } from '../../../../components';
// import styles from './products.styles';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { HomeStackProps } from '../../../../@types';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { Colors, Fonts, Icon, Images, Typography } from '../../../../constant';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from '../../../../constant/dimentions';
// import RBSheet from 'react-native-raw-bottom-sheet';
// import ProductCard from './components/ProductCard/productCard';
// import CustomBlurView from '../../../../components/BlurView/blurView';
// import LinearGradient from 'react-native-linear-gradient';
// import InputText from '../../../../components/InputText/TextInput';
// import CheckBox from '../../../../components/CheckBox/checkbox';
//
// type ProductsScreenNavigationType = NativeStackNavigationProp<
//   HomeStackProps,
//   'Products'
// >;
//
// const product_Type = [
//   {
//     id: 0,
//     img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
//     name: 'Apples',
//   },
//   {
//     id: 1,
//     img: 'https://assets.bonappetit.com/photos/5c62e4a3e81bbf522a9579ce/1:1/pass/milk-bread.jpg',
//     name: 'Bread',
//   },
//   {
//     id: 2,
//     img: 'https://cdn-prod.medicalnewstoday.com/content/images/articles/273/273031/tomatoes-close-up.jpg',
//     name: 'Tomatoes',
//   },
//   {
//     id: 3,
//     img: 'https://images.unsplash.com/photo-1517448931760-9bf4414148c5?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWlsa3xlbnwwfHwwfHx8MA%3D%3D',
//     name: 'Milk',
//   },
//   {
//     id: 4,
//     img: 'https://media.istockphoto.com/id/491090528/photo/cooked-rice.jpg?s=612x612&w=0&k=20&c=WNeDEUEioyyk6FQZQrVMrtFMDVdtbwtK951eZ8q5FNY=',
//     name: 'Rice',
//   },
//   {
//     id: 5,
//     img: 'https://cdn.britannica.com/94/151894-050-F72A5317/Brown-eggs.jpg',
//     name: 'Eggs',
//   },
// ];
//
// const Product1 = [
//   {
//     id: 1,
//     name: 'Tomato',
//     image:
//       'https://t4.ftcdn.net/jpg/02/49/93/33/360_F_249933303_rB82fjbNuZdT3444cZfutFG1Wau0T1VA.jpg',
//     price: 16,
//     oldPrice: 30,
//     discount: '₹12 OFF',
//     weight: '500gm',
//     rating: 4.7,
//     options: '2 Options',
//   },
//   {
//     id: 2,
//     name: 'Potato',
//     image:
//       'https://t3.ftcdn.net/jpg/03/11/01/12/360_F_311011245_9TZ5ZMQVpbFJKoKQYx24rk3zF4RxWfLC.jpg',
//     price: 20,
//     oldPrice: 35,
//     discount: '₹15 OFF',
//     weight: '1kg',
//     rating: 4.5,
//     options: '3 Options',
//   },
//   {
//     id: 3,
//     name: 'Apple',
//     image:
//       'https://t3.ftcdn.net/jpg/02/45/31/34/360_F_245313422_m2qHbcBSzdfdPahVZzB5ZmEBapItiaI1.jpg',
//     price: 120,
//     oldPrice: 150,
//     discount: '₹30 OFF',
//     weight: '1kg',
//     rating: 4.8,
//     options: '1 Option',
//   },
//   {
//     id: 4,
//     name: 'Banana',
//     image:
//       'https://t3.ftcdn.net/jpg/01/78/09/43/360_F_178094306_Y7Z3eDMEP65z4FqX1OQmjYslwQZ7Q8jD.jpg',
//     price: 40,
//     oldPrice: 50,
//     discount: '₹10 OFF',
//     weight: '1 Dozen',
//     rating: 4.6,
//     options: '2 Options',
//   },
//   {
//     id: 5,
//     name: 'Onion',
//     image:
//       'https://t4.ftcdn.net/jpg/02/99/87/34/360_F_299873407_gdDK72M4mcJHqB8koDtyJf47Be2c7ZFe.jpg',
//     price: 25,
//     oldPrice: 35,
//     discount: '₹10 OFF',
//     weight: '1kg',
//     rating: 4.4,
//     options: '3 Options',
//   },
//   {
//     id: 6,
//     name: 'Mango',
//     image:
//       'https://t4.ftcdn.net/jpg/02/41/50/13/360_F_241501311_VWXE4Wb7qEobnUhuKowfn6Oh3wojPTEx.jpg',
//     price: 150,
//     oldPrice: 180,
//     discount: '₹30 OFF',
//     weight: '1kg',
//     rating: 4.9,
//     options: '1 Option',
//   },
//   {
//     id: 7,
//     name: 'Carrot',
//     image:
//       'https://t4.ftcdn.net/jpg/03/15/41/05/360_F_315410510_TYzZzjvg2bHtyOnT86qp2ZcH6Dw57HjH.jpg',
//     price: 35,
//     oldPrice: 50,
//     discount: '₹15 OFF',
//     weight: '500gm',
//     rating: 4.6,
//     options: '2 Options',
//   },
//   {
//     id: 8,
//     name: 'Cucumber',
//     image:
//       'https://t4.ftcdn.net/jpg/03/18/16/09/360_F_318160934_wWjK9P0cVYHwzFeqVt3oZXZP2UimQPyS.jpg',
//     price: 25,
//     oldPrice: 40,
//     discount: '₹15 OFF',
//     weight: '500gm',
//     rating: 4.5,
//     options: '2 Options',
//   },
//   {
//     id: 9,
//     name: 'Grapes',
//     image:
//       'https://t3.ftcdn.net/jpg/02/93/17/94/360_F_293179418_RmHwleKjGg5TOpVZAGcJXfqzZzYQffE0.jpg',
//     price: 80,
//     oldPrice: 100,
//     discount: '₹20 OFF',
//     weight: '500gm',
//     rating: 4.7,
//     options: '1 Option',
//   },
//   {
//     id: 10,
//     name: 'Pineapple',
//     image:
//       'https://t3.ftcdn.net/jpg/02/99/49/38/360_F_299493856_aTSU1uUUsz6vEo5m0n5zHz0uMdFvEwD5.jpg',
//     price: 60,
//     oldPrice: 80,
//     discount: '₹20 OFF',
//     weight: '1 Piece',
//     rating: 4.6,
//     options: '1 Option',
//   },
// ];
//
// const cat = [
//   {
//     id: 0,
//     name: 'Mango (5)',
//   },
//   {
//     id: 1,
//     name: 'Apple (11)',
//   },
//   {
//     id: 2,
//     name: 'Banana (5)',
//   },
//   {
//     id: 3,
//     name: 'Orange (11)',
//   },
//   {
//     id: 4,
//     name: 'Grapes (5)',
//   },
// ];
//
// const sortCat = [
//   {
//     id: 0,
//     name: 'Relevance',
//   },
//   {
//     id: 1,
//     name: 'Price ( Low to high)',
//   },
//   {
//     id: 2,
//     name: 'Price ( High to low)',
//   },
//   {
//     id: 3,
//     name: 'Discount (High to low)',
//   },
// ];
//
// const Products = () => {
//   const navigation = useNavigation<ProductsScreenNavigationType>();
//   const route = useRoute<any>();
//   const [selectedId, setSelectedId] = useState<number>(0);
//   const [isBlur, setIsBlur] = useState(false);
//   const addProductBottomSheet = useRef<any>(null);
//   const searchProductBottomSheet = useRef<any>(null);
//   const sortProductBottomSheet = useRef<any>(null);
//   const [selectedTab, setSelectedTab] = useState(0);
//   const [selectedCats, setSelectedCats] = useState<number[]>([]);
//   const [selectedSort, setSelectedSort] = useState<number>(0);
//
//   const toggleSelection = (id: number) => {
//     if (selectedCats.includes(id)) {
//       setSelectedCats(selectedCats.filter(item => item !== id));
//     } else {
//       setSelectedCats([...selectedCats, id]);
//     }
//   };
//
//   const renderProductType = ({ item }: any) => {
//     const isSelected = selectedId === item.id;
//     return (
//       <TouchableOpacity
//         activeOpacity={0.7}
//         onPress={() => setSelectedId(item.id)}
//         style={[
//           styles.itemCatView,
//           {
//             borderBottomWidth: isSelected ? 3 : 0,
//             borderBottomColor: isSelected ? Colors.PRIMARY[100] : 'transparent',
//           },
//         ]}
//       >
//         <Image source={{ uri: item.img }} style={styles.imgCat} />
//         <TextView style={styles.txtCat}>{item.name}</TextView>
//       </TouchableOpacity>
//     );
//   };
//
//   const onAdd = () => {
//     setIsBlur(true);
//     setTimeout(() => {
//       addProductBottomSheet.current.open();
//     }, 500);
//   };
//
//   const renderItem = ({ item }: { item: (typeof cat)[0] }) => {
//     const isChecked = selectedCats.includes(item.id);
//     return (
//       <View style={styles.itemCat}>
//         <CheckBox
//           isChecked={isChecked}
//           boxTitle={item.name}
//           onPress={() => toggleSelection(item.id)}
//           boxTitleColor={isChecked ? Colors.PRIMARY[100] : Colors.PRIMARY[400]}
//         />
//       </View>
//     );
//   };
//
//   return (
//     <SafeAreaView style={styles.container}>
//       <Header
//         title={route?.params?.catName}
//         rightIcon={true}
//         rightIconName={Images.ic_search}
//         rightIconPress={() => {
//           navigation.navigate('Search');
//         }}
//       />
//
//       {isBlur && <CustomBlurView />}
//
//       <View style={{ flex: 1 }}>
//         <View style={styles.viewContainer}>
//           <View>
//             <FlatList
//               data={product_Type}
//               renderItem={renderProductType}
//               keyExtractor={item => item.id.toString()}
//             />
//           </View>
//
//           <View>
//             <View style={[styles.filterMainView]}>
//               <Pressable
//                 style={styles.sortView}
//                 onPress={() => {
//                   setIsBlur(true);
//                   setTimeout(() => {
//                     sortProductBottomSheet.current.open();
//                   }, 500);
//                 }}
//               >
//                 <TextView style={styles.txtSort}>Sort</TextView>
//                 <Image source={Images.ic_filter} style={styles.imgSort} />
//               </Pressable>
//               <Pressable
//                 style={styles.filterView}
//                 onPress={() => {
//                   setIsBlur(true);
//                   setTimeout(() => {
//                     searchProductBottomSheet.current.open();
//                   }, 500);
//                 }}
//               >
//                 <TextView style={styles.txtFilter}>Filter</TextView>
//                 <Image source={Images.ic_sort} style={styles.imgFilter} />
//               </Pressable>
//             </View>
//
//             <View style={{ flex: 1 }}>
//               <ProductCard
//                 cardArray={Product1}
//                 type="OFFER"
//                 onAddAction={onAdd}
//                 horizontal={false}
//                 numOfColumn={2}
//               />
//             </View>
//           </View>
//         </View>
//         <RBSheet
//           ref={addProductBottomSheet}
//           onOpen={() => setIsBlur(true)}
//           onClose={() => setIsBlur(false)}
//           height={350}
//           useNativeDriver={false}
//           customStyles={{
//             wrapper: {
//               backgroundColor: 'transparent',
//             },
//             container: {
//               backgroundColor: 'transparent',
//               elevation: 0,
//               shadowOpacity: 0,
//             },
//             draggableIcon: {
//               backgroundColor: '#000',
//             },
//           }}
//           customModalProps={{
//             animationType: 'slide',
//             statusBarTranslucent: true,
//           }}
//           customAvoidingViewProps={{
//             enabled: false,
//           }}
//         >
//           <View style={{ flex: 1 }}>
//             <TouchableOpacity
//               onPress={() => addProductBottomSheet.current.close()}
//               style={styles.bottomSheetMainView}
//             >
//               <Image source={Images.ic_cross} style={styles.imgClose} />
//             </TouchableOpacity>
//             <View style={styles.bottomSheetView}>
//               <View style={styles.productCardView}>
//                 <View>
//                   <View style={{ flexDirection: 'row' }}>
//                     <Image
//                       source={{
//                         uri: 'https://cdn-prod.medicalnewstoday.com/content/images/articles/273/273031/tomatoes-close-up.jpg',
//                       }}
//                       style={styles.imgProduct}
//                     />
//                     <View>
//                       <Text style={styles.txtProduct}>Tomato</Text>
//                       <View style={{ flexDirection: 'row' }}>
//                         <Text style={styles.txtProductQuantity}>2 X 500gm</Text>
//                         <Text style={styles.txtProductOffPrice}>
//                           ₹32
//                           <TextView style={styles.txtOfferCutPrice}>
//                             {'  '}
//                             ₹38
//                           </TextView>
//                         </Text>
//                         <View>
//                           <LinearGradient
//                             colors={[Colors.PRIMARY[200], Colors.PRIMARY[100]]}
//                             style={styles.addProductButon}
//                             start={{ x: 0, y: 0.5 }}
//                             end={{ x: 1, y: 0 }}
//                           >
//                             <TextView style={styles.txtAdd}>Add</TextView>
//                           </LinearGradient>
//                         </View>
//                       </View>
//                     </View>
//                   </View>
//                 </View>
//               </View>
//               <View style={styles.productCardView}>
//                 <View>
//                   <View style={{ flexDirection: 'row' }}>
//                     <Image
//                       source={{
//                         uri: 'https://cdn-prod.medicalnewstoday.com/content/images/articles/273/273031/tomatoes-close-up.jpg',
//                       }}
//                       style={styles.imgProduct}
//                     />
//                     <View>
//                       <Text style={styles.txtProduct}>Tomato</Text>
//                       <View style={{ flexDirection: 'row' }}>
//                         <Text style={styles.txtProductQuantity}>2 X 500gm</Text>
//                         <Text style={styles.txtProductOffPrice}>
//                           ₹32
//                           <TextView style={styles.txtOfferCutPrice}>
//                             {'  '}
//                             ₹38
//                           </TextView>
//                         </Text>
//                         <View>
//                           <LinearGradient
//                             colors={[Colors.PRIMARY[200], Colors.PRIMARY[100]]}
//                             style={styles.addProductButon}
//                             start={{ x: 0, y: 0.5 }}
//                             end={{ x: 1, y: 0 }}
//                           >
//                             <TextView style={styles.txtAdd}>Add</TextView>
//                           </LinearGradient>
//                         </View>
//                       </View>
//                     </View>
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </View>
//         </RBSheet>
//         <RBSheet
//           ref={searchProductBottomSheet}
//           onOpen={() => setIsBlur(true)}
//           onClose={() => setIsBlur(false)}
//           height={450}
//           useNativeDriver={false}
//           customStyles={{
//             wrapper: {
//               backgroundColor: 'transparent',
//             },
//             container: {
//               backgroundColor: 'transparent',
//               elevation: 0,
//               shadowOpacity: 0,
//             },
//             draggableIcon: {
//               backgroundColor: '#000',
//             },
//           }}
//           customModalProps={{
//             animationType: 'slide',
//             statusBarTranslucent: true,
//           }}
//           customAvoidingViewProps={{
//             enabled: false,
//           }}
//         >
//           <View style={{ flex: 1, backgroundColor: Colors.PRIMARY[300] }}>
//             <View>
//               <View style={styles.searchBox}>
//                 <View style={styles.searchView}>
//                   <Icon
//                     family="EvilIcons"
//                     name="search"
//                     color={Colors.PRIMARY[100]}
//                     size={30}
//                   />
//                   <InputText
//                     value={''}
//                     //@ts-ignore
//                     inputStyle={[styles.inputView]}
//                     placeHolderTextStyle={Colors.PRIMARY[500]}
//                     placeholder="Search for Grocery"
//                     onChangeText={(value: string) => {
//                       console.log('TEst', value);
//                     }}
//                   />
//                 </View>
//               </View>
//             </View>
//
//             <View style={styles.tabView}>
//               <Pressable
//                 style={[
//                   styles.tabs,
//                   {
//                     borderBottomWidth: selectedTab === 0 ? 2 : 0,
//                     borderBottomColor:
//                       selectedTab === 0
//                         ? Colors.PRIMARY[100]
//                         : Colors.PRIMARY[300],
//                   },
//                 ]}
//                 onPress={() => setSelectedTab(0)}
//               >
//                 <TextView
//                   style={{
//                     color:
//                       selectedTab === 0
//                         ? Colors.PRIMARY[100]
//                         : Colors.FLOATINGINPUT[100],
//                     fontFamily:
//                       selectedTab === 0 ? Fonts.Medium : Fonts.Regular,
//                     fontSize: wp(4),
//                   }}
//                 >
//                   Type
//                 </TextView>
//               </Pressable>
//               <Pressable
//                 style={[
//                   styles.tabs,
//                   {
//                     borderBottomWidth: selectedTab === 1 ? 2 : 0,
//                     borderBottomColor:
//                       selectedTab === 1
//                         ? Colors.PRIMARY[100]
//                         : Colors.PRIMARY[300],
//                   },
//                 ]}
//                 onPress={() => setSelectedTab(1)}
//               >
//                 <TextView
//                   style={{
//                     color:
//                       selectedTab === 1
//                         ? Colors.PRIMARY[100]
//                         : Colors.FLOATINGINPUT[100],
//                     fontFamily:
//                       selectedTab === 1 ? Fonts.Medium : Fonts.Regular,
//                     fontSize: wp(4),
//                   }}
//                 >
//                   Properties
//                 </TextView>
//               </Pressable>
//             </View>
//
//             <View>
//               <FlatList
//                 data={cat}
//                 renderItem={renderItem}
//                 keyExtractor={item => item.id.toString()}
//                 extraData={selectedCats}
//               />
//             </View>
//
//             <View style={styles.actionButtonView}>
//               <BorderButton
//                 title="Clear Filter"
//                 onPress={() => {}}
//                 buttonWidth={wp(40)}
//                 titleStyle={styles.buttonTitle}
//               />
//
//               <LinearGradient
//                 colors={[Colors.PRIMARY[200], Colors.PRIMARY[100]]}
//                 style={styles.applyButton}
//                 start={{ x: 0, y: 0.5 }}
//                 end={{ x: 1, y: 0 }}
//               >
//                 <TextView style={styles.txtApply}>Add</TextView>
//               </LinearGradient>
//             </View>
//           </View>
//         </RBSheet>
//         <RBSheet
//           ref={sortProductBottomSheet}
//           onOpen={() => setIsBlur(true)}
//           onClose={() => setIsBlur(false)}
//           height={250}
//           useNativeDriver={false}
//           customStyles={{
//             wrapper: {
//               backgroundColor: 'transparent',
//             },
//             container: {
//               backgroundColor: 'transparent',
//               elevation: 0,
//               shadowOpacity: 0,
//             },
//             draggableIcon: {
//               backgroundColor: '#000',
//             },
//           }}
//           customModalProps={{
//             animationType: 'slide',
//             statusBarTranslucent: true,
//           }}
//           customAvoidingViewProps={{
//             enabled: false,
//           }}
//         >
//           <View style={{ flex: 1, backgroundColor: Colors.PRIMARY[300] }}>
//             <View style={styles.txtSortByView}>
//               <TextView style={styles.txtSortBy}>Sort by</TextView>
//             </View>
//             {sortCat.map(item => {
//               const isSelected = selectedSort === item.id;
//               return (
//                 <TouchableOpacity
//                   key={item.id}
//                   style={styles.buttonView}
//                   onPress={() => setSelectedSort(item.id)}
//                 >
//                   <Image
//                     source={
//                       isSelected
//                         ? Images.ic_radio_checked
//                         : Images.ic_radio_unchecked
//                     }
//                     style={styles.radioButton}
//                   />
//                   <TextView style={styles.radioButtonTitle}>
//                     {item.name}
//                   </TextView>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         </RBSheet>
//       </View>
//     </SafeAreaView>
//   );
// };
//
// export default Products;
