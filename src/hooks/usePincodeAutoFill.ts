import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { autoFillAddressFromPincode, AddressFields } from '../utils/pincodeService';

export const usePincodeAutoFill = () => {
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const handlePincodeChange = async (
    pincode: string, 
    setPincode: (value: string) => void,
    clearErrorIfValid: (field: string, value: string) => void,
    setCity: (value: string) => void,
    setState?: (value: string) => void,
    setDistrict?: (value: string) => void,
    setPostOffice?: (value: string) => void
  ) => {
    const onlyDigits = pincode.replace(/[^0-9]/g, '').slice(0, 6);
    
    // Update pincode state
    setPincode(onlyDigits);
    clearErrorIfValid('pincode', onlyDigits);

    // Auto-fill address when pincode is 6 digits
    if (onlyDigits.length === 6) {
      setPincodeLoading(true);
      try {
        const addressFields: AddressFields | null = await autoFillAddressFromPincode(onlyDigits);
        
        if (addressFields) {
          setCity(addressFields.city);
          if (setState) setState(addressFields.state);
          if (setDistrict) setDistrict(addressFields.district);
          if (setPostOffice) setPostOffice(addressFields.postOffice);
          
          // Show success toast
          Toast.show({
            type: 'success',
            text1: 'Address Auto-Filled',
            text2: `City: ${addressFields.city} has been auto-filled`,
            position: 'top',
            topOffset: 50,
            visibilityTime: 2000,
          });
        } else {
          // Show error toast for invalid pincode
          Toast.show({
            type: 'error',
            text1: 'Invalid Pincode',
            text2: 'Could not find address details for this pincode',
            position: 'top',
            topOffset: 50,
            visibilityTime: 3000,
          });
        }
      } catch (error) {
        console.error('Error auto-filling address:', error);
        // Show error toast for API failures
        Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: 'Failed to fetch address details. Please try again.',
          position: 'top',
          topOffset: 50,
          visibilityTime: 3000,
        });
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  return {
    pincodeLoading,
    handlePincodeChange,
  };
};
