import React, { FC } from 'react';
import { LogBox } from 'react-native';
import Route from './src/routes';
import { UserDataContextProvider } from './src/context';
import { CommonLoaderProvider } from './src/components/CommonLoader/commonLoader';
import { CommonAlertProvider } from './src/components/CommonAlertModal/commonAlertModal';
import Toast from 'react-native-toast-message';
import { CartProvider } from './src/context/CartContext';
const App: FC = () => {
  // Hiding warning logs - only used in debug mode
  LogBox.ignoreLogs(['Warning: ...']);
  LogBox.ignoreAllLogs();

  return (
    <>
      <UserDataContextProvider>
        <CommonLoaderProvider>
          <CommonAlertProvider>
          
            <CartProvider>
              <Route />
              <Toast />
            </CartProvider>
          </CommonAlertProvider>
        </CommonLoaderProvider>
      </UserDataContextProvider>
    </>
  );
};

export default App;
