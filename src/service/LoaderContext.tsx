import React, { createContext, useState, useContext, ReactNode } from 'react';
import { CommonLoader } from '../components';

interface LoaderContextType {
  showLoader: () => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType>({
  showLoader: () => {},
  hideLoader: () => {},
});

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);

  const showLoader = () => setVisible(true);
  const hideLoader = () => setVisible(false);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      <CommonLoader visible={visible} />
    </LoaderContext.Provider>
  );
};
