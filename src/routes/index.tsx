import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackNavigator, AuthStackNavigator } from '../navigation';
import { BackHandler, StatusBar } from 'react-native';
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
  const [isExitAlertVisible, setIsExitAlertVisible] = useState(false);
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

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

  useEffect(() => {
    const handleBackPress = () => {
      const navigation = navigationRef.current;

      if (navigation && navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }

      if (isExitAlertVisible) {
        return true;
      }

      setIsExitAlertVisible(true);
      showAlert(
        'Exit App',
        'Are you sure you want to exit?',
        'Exit',
        () => {
          setIsExitAlertVisible(false);
          hideAlert();
          BackHandler.exitApp();
        },
        'confirm',
        'Cancel',
        () => {
          setIsExitAlertVisible(false);
          hideAlert();
        },
      );

      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => subscription.remove();
  }, [hideAlert, isExitAlertVisible, showAlert]);

  if (isBootstrapping || isLoggedIn === null) {
    return <></>;
  }

  const isAuthenticated = isLoggedIn === true || isLoggedIn === 'true';

  return (
    <>
      <NavigationContainer ref={navigationRef}>
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
