import { LocalStorage } from './localstorage';

//To Sigout of User
export const handleSignout = (setIsLoggedIn: (isLoggedIn: boolean) => void) => {
  setTimeout(() => {
    setIsLoggedIn(false);
    LocalStorage.save('@login', false);
    LocalStorage.flushQuestionKeys();
  }, 700);
};
