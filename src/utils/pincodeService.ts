import { API_CONFIG } from '../config/api';

export interface PostalData {
  Message: string;
  Status: string;
  PostOffice: Array<{
    Name: string;
    Description: string;
    BranchType: string;
    DeliveryStatus: string;
    Circle: string;
    District: string;
    Division: string;
    Region: string;
    Block: string;
    State: string;
    Country: string;
    Pincode: string;
  }>;
  Count?: number | null;
}

export interface AddressFields {
  city: string;
  state: string;
  district: string;
  postOffice: string;
}

export const validatePincode = (pincode: string): boolean => {
  const cleanPincode = pincode.replace(/[^0-9]/g, '');
  return cleanPincode.length === 6;
};

export const fetchPostalData = async (pincode: string): Promise<PostalData | null> => {
  try {
    const cleanPincode = pincode.replace(/[^0-9]/g, '');
    
    if (!validatePincode(cleanPincode)) {
      console.log('Invalid pincode format:', cleanPincode);
      return null;
    }

    console.log('Fetching postal data for pincode:', cleanPincode);
    const response = await fetch(`${API_CONFIG.POSTAL_PINCODE_API}${cleanPincode}`);
    
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    // Handle the case where API returns an array with one object
    if (Array.isArray(data) && data.length > 0) {
      console.log('API returned array, using first element');
      return data[0];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching postal data:', error);
    return null;
  }
};

export const extractAddressFields = (postalData: PostalData | null): AddressFields | null => {
  if (!postalData) {
    console.log('No postal data provided');
    return null;
  }
  
  if (postalData.Status !== 'Success') {
    console.log('API status not successful:', postalData.Status);
    return null;
  }
  
  if (!postalData.PostOffice || !postalData.PostOffice.length) {
    console.log('No post office data found');
    return null;
  }

  const firstPostOffice = postalData.PostOffice[0];
  
  // Use the first post office name as the city (more specific) and district as fallback
  const cityName = firstPostOffice.Name || firstPostOffice.District || '';
  
  const result = {
    city: cityName,
    state: firstPostOffice.State || '',
    district: firstPostOffice.District || '',
    postOffice: firstPostOffice.Name || '',
  };
  
  console.log('Address auto-filled:', result.city, result.state);
  return result;
};

export const autoFillAddressFromPincode = async (pincode: string): Promise<AddressFields | null> => {
  const postalData = await fetchPostalData(pincode);
  return extractAddressFields(postalData);
};
