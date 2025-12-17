import React, {
  FC,
  createContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { LocalStorage } from '../helpers/localstorage';

export interface UserData {
  isLoggedIn: boolean | string | null;
  setIsLoggedIn: (value: boolean | any) => void;
  userData: any;
  setUserData: (data: any) => void;
}

const UserDataContext = createContext<UserData>({
  isLoggedIn: null,
  setIsLoggedIn: () => {},
  userData: null,
  setUserData: () => {},
});

type Props = {
  children?: ReactNode;
};

const UserDataContextProvider: FC<Props> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | string | null>(null);
  const [userData, setUserData] = useState<any>('');

  useEffect(() => {
    setContextDataFromStorage();
  }, []);

  const setContextDataFromStorage = async () => {
    const val = await LocalStorage.read('@login');
    let user = await LocalStorage.read('@user');

    // Purane data ke liye jahan double-stringify hua tha
    if (typeof user === 'string') {
      try {
        user = JSON.parse(user);
      } catch (e) {
        // ignore parse error, user ko as-is rehne do
      }
    }

    setUserData(user);
    setIsLoggedIn(val);
  };

  return (
    <UserDataContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export { UserDataContextProvider, UserDataContext };

