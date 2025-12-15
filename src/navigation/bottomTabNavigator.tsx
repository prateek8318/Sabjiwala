import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dashboard, Catogaries, Favorites, MyOrder, Cart, RateOrder, Reorder, OrderTracking, ReturnOrder, TypeProductList } from '../screens';
import { Colors, Fonts } from '../constant';
import LinearGradient from 'react-native-linear-gradient';
import { View, Text } from 'react-native';
import { useCart } from '../context/CartContext';
import SubCategoryList from '../screens/home/catogaries/SubCategoryList';
import ProductList from '../screens/home/catogaries/ProductList';
import Icon from '../constant/Icon';


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
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyOrder" component={MyOrder} />
    <Stack.Screen name="RateOrder" component={RateOrder} />
    <Stack.Screen name="Reorder" component={Reorder} />
    <Stack.Screen name="OrderTracking" component={OrderTracking} />
    <Stack.Screen name="ReturnOrder" component={ReturnOrder} />
  </Stack.Navigator>
);
const CartPageStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Cart" component={Cart} />
  </Stack.Navigator>
);

const BottomStackNavigator = () => {
  const Tab = createBottomTabNavigator();
  const { totalItems } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,   // <-- ⭐⭐ THE MAIN FIX ⭐⭐
        tabBarBackground: () => (
          <>
            <LinearGradient
              colors={[Colors.PRIMARY[200], Colors.SECONDARY[300]]}
              style={{ flex: 1 }}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'transparent']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6 }}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.2)']}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6 }}
            />
          </>
        ),
        tabBarActiveTintColor: Colors.PRIMARY[300],
        tabBarInactiveTintColor: Colors.FLOATINGINPUT[100],
        tabBarLabelStyle: { fontFamily: Fonts.Medium, fontSize: 12 },
        tabBarStyle: { height: 80, borderTopWidth: 0, backgroundColor: 'transparent' },
      }}
    >
      <Tab.Screen name="Home" component={HomePageStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              family="Ionicons"
              name={focused ? 'home' : 'home-outline'}
              size={28}
              color={focused ? Colors.PRIMARY[300] : Colors.FLOATINGINPUT[100]}
            />
          ),
        }}
      />

      <Tab.Screen name="Catogaries" component={CatogariesPageStack}
        options={{
          unmountOnBlur: true,
          tabBarIcon: ({ focused }) => (
            <Icon
              family="Ionicons"
              name={focused ? 'grid' : 'grid-outline'}
              size={28}
              color={focused ? Colors.PRIMARY[300] : Colors.FLOATINGINPUT[100]}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('Catogaries', { screen: 'Catogaries' });
          },
        })}
      />

      <Tab.Screen name="Favorites" component={FavoritesPageStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              family="Ionicons"
              name={focused ? 'heart' : 'heart-outline'}
              size={28}
              color={focused ? Colors.PRIMARY[300] : Colors.FLOATINGINPUT[100]}
            />
          ),
        }}
      />

      <Tab.Screen name="MyOrder" component={MyOrderPageStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              family="Ionicons"
              name={focused ? 'bag' : 'bag-outline'}
              size={28}
              color={focused ? Colors.PRIMARY[300] : Colors.FLOATINGINPUT[100]}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartPageStack}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ focused }) => (
            <View>
              <Icon
                family="Ionicons"
                name={focused ? 'cart' : 'cart-outline'}
                size={28}
                color={focused ? Colors.PRIMARY[300] : Colors.FLOATINGINPUT[100]}
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
