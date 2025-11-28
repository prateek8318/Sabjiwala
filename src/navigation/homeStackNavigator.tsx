import React, { FC, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackProps } from '../@types';

import {
  AboutUs,
  Address,
  Dashboard,
  EditAddress,
  EditProfile,
  InviteFriend,
  PrivacyPolicy,
  ProductDetail,
  Products,
  Profile,
  ReferEarn,
  Search,
  Support,
  TermsCondition,
  Wallet,
} from '../screens';
import BottomStackNavigator from './bottomTabNavigator';

const HomeStackNavigator: FC = () => {
  const HomeStack = createNativeStackNavigator<HomeStackProps>();

  return (
    <>
      <HomeStack.Navigator>
        <HomeStack.Screen
          name="BottomStackNavigator"
          component={BottomStackNavigator}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="Search"
          component={Search}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="Profile"
          component={Profile}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="Support"
          component={Support}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="ReferEarn"
          component={ReferEarn}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="InviteFriend"
          component={InviteFriend}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="Wallet"
          component={Wallet}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="Address"
          component={Address}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="EditAddress"
          component={EditAddress}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicy}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="TermsCondition"
          component={TermsCondition}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="AboutUs"
          component={AboutUs}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="Products"
          component={Products}
          options={{ headerShown: false }}
        />
        <HomeStack.Screen
          name="ProductDetail"
          component={ProductDetail}
          options={{ headerShown: false }}
        />
      </HomeStack.Navigator>
    </>
  );
};

export default HomeStackNavigator;
