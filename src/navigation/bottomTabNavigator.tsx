import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dashboard, Catogaries, Favorites, MyOrder, Cart, RateOrder, Reorder, OrderTracking, ReturnOrder, TypeProductList } from '../screens';
import OrderSummaryScreen from '../screens/home/myOrder/OrderSummaryScreen';
import { Colors, Fonts, Images } from '../constant';
import LinearGradient from 'react-native-linear-gradient';
import { View, Text, Image } from 'react-native';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import SubCategoryList from '../screens/home/catogaries/SubCategoryList';
import ProductList from '../screens/home/catogaries/ProductList';


const Stack = createNativeStackNavigator();

const HomePageStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={Dashboard} />
    <Stack.Screen name="TypeProductList" component={TypeProductList} />
  </Stack.Navigator>
);
const CatogariesPageStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Catogaries" component={Catogaries} />
    <Stack.Screen name="subCategoryList" component={SubCategoryList} />
    <Stack.Screen name="productList" component={ProductList} />
  </Stack.Navigator>
);

const FavoritesPageStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Favorites" component={Favorites} />
  </Stack.Navigator>
);
const MyOrderPageStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      tabBarStyle: { 
        height: 80, 
        borderTopWidth: 0, 
        backgroundColor: 'transparent',
        paddingBottom: 8,
        paddingTop: 4,
      } 
    }}
  >
    <Stack.Screen name="MyOrder" component={MyOrder} />
    <Stack.Screen 
      name="OrderSummary" 
      component={OrderSummaryScreen} 
      options={{ tabBarStyle: { display: 'none' } }}
    />
    <Stack.Screen 
      name="RateOrder" 
      component={RateOrder} 
      options={{ tabBarStyle: { display: 'none' } }}
    />
    <Stack.Screen 
      name="Reorder" 
      component={Reorder} 
      options={{ tabBarStyle: { display: 'none' } }}
    />
    <Stack.Screen 
      name="OrderTracking" 
      component={OrderTracking} 
      options={{ tabBarStyle: { display: 'none' } }}
    />
    <Stack.Screen 
      name="ReturnOrder" 
      component={ReturnOrder} 
      options={{ tabBarStyle: { display: 'none' } }}
    />
  </Stack.Navigator>
);
const CartPageStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="Cart" 
      component={Cart}
      options={{
        tabBarStyle: { display: 'none' }
      }}
    />
  </Stack.Navigator>
);

const BottomStackNavigator = () => {
  const Tab = createBottomTabNavigator();
  const { totalItems } = useCart();
  const { favoritesCount } = useFavorites();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => (
          <LinearGradient
            colors={['#5A875C', '#015304']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
          />
        ),
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#B0B0B0',
        tabBarLabelStyle: { fontFamily: Fonts.Medium, fontSize: 12, marginTop: 3 },
        tabBarIconStyle: { marginTop: 0 },
        tabBarStyle: { 
          height: 80, 
          borderTopWidth: 0, 
          backgroundColor: 'transparent',
          paddingBottom: 8,
          paddingTop: 4,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomePageStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? Images.ic_home_active : Images.ic_home}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tab.Screen 
        name="Catogaries" 
        component={CatogariesPageStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? Images.ic_catogary_active : Images.ic_catogary}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('Catogaries', { screen: 'Catogaries' });
          },
        })}
      />

      <Tab.Screen 
        name="Favorites" 
        component={FavoritesPageStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <Image
                source={focused ? Images.ic_heart_active : Images.ic_heart}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
              {favoritesCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    right: -4,
                    top: -3,
                    minWidth: 16,
                    height: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ 
                    borderColor: 'rgba(255, 0, 0, 0.8)',
                      borderWidth: 1,
                      backgroundColor: 'rgba(255, 0, 0, 0.8)',
                      borderRadius: 16,
                      paddingHorizontal: 3, 
                    fontSize: 10, 
                    fontWeight: 'bold',
                    
                    overflow: 'hidden',
                    textAlign: 'center',
                    minWidth: 16,
                    lineHeight: 16,
                  }}>
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen name="MyOrder" component={MyOrderPageStack}
        options={{
          tabBarLabel: 'My Order',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? Images.ic_order_active : Images.ic_order}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartPageStack}
        options={{
          tabBarLabel: 'Cart',
          tabBarStyle: { height: 0, overflow: 'hidden' },
          tabBarIcon: ({ focused }) => (
            <View>
              <Image
                source={focused ? Images.ic_cart_active : Images.ic_cart}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />

              {totalItems > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    right: -8,
                    top: -5,
                    backgroundColor: '#FF3B30',
                    borderRadius: 12,
                    minWidth: 22,
                    height: 22,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                    borderWidth: 2,
                    borderColor: '#fff',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                    {totalItems}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomStackNavigator;
