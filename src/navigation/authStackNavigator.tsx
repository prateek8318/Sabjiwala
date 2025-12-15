import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Signin,
  VerifyOTP,
  LocationPermission,
  SearchLocation,
  AddAddress,
  TermsCondition,
  PrivacyPolicy,
} from '../screens';
import { AuthStackProps } from '../@types';

const AuthStackNavigator: FC = () => {
  const AuthStack = createNativeStackNavigator<AuthStackProps>();

  return (
    <>
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Signin" component={Signin} />
        <AuthStack.Screen name="VerifyOTP" component={VerifyOTP} />
        <AuthStack.Screen
          name="LocationPermission"
          component={LocationPermission}
        />
        <AuthStack.Screen name="SearchLocation" component={SearchLocation} />
        <AuthStack.Screen name="AddAddress" component={AddAddress} />
        <AuthStack.Screen name="TermsCondition" component={TermsCondition} />
        <AuthStack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      </AuthStack.Navigator>
    </>
  );
};

export default AuthStackNavigator;
