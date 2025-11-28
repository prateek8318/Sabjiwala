import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import React, { FC, useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackNavigator, AuthStackNavigator } from '../navigation';
import { StatusBar } from 'react-native';
const Stack = createNativeStackNavigator();
import { LocalStorage } from '../helpers/localstorage';
import { UserData, UserDataContext } from '../context/userDataContext';
import { Colors } from '../constant';
import SplashScreen from 'react-native-splash-screen';

import { CommonAlertModal } from '../components';

const Route: FC = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext<UserData>(UserDataContext);
  const { showAlert, hideAlert } = CommonAlertModal();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    checkLoginStatus();
    
  }, []);

  const checkLoginStatus = async () => {
    try {
      const loginStatus = await LocalStorage.read('@login');
      if (loginStatus === true || loginStatus === 'true') {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.log('Login check error:', error);
      setIsLoggedIn(false);
    } finally {
      setIsBootstrapping(false);
      setTimeout(() => SplashScreen.hide(), 500);
    }
  };

  if (isBootstrapping || isLoggedIn === null) {
    return <></>;
  }

  const isAuthenticated = isLoggedIn === true || isLoggedIn === 'true';

  return (
    <>
      <NavigationContainer>
        <StatusBar
          barStyle={'light-content'}
          backgroundColor={Colors.PRIMARY[100]}
        />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen
                name="HomeStackNavigator"
                component={HomeStackNavigator}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="AuthStackNavigator"
                component={AuthStackNavigator}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};
export default Route;
