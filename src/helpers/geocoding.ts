export type GeocodedAddress = {
  formattedAddress: string;
  city: string;
  pincode: string;
  landmark: string;
  houseNumber: string;
};

/**
 * Reverse geocoding via OpenStreetMap Nominatim.
 * Lightweight and keyless so it works out-of-the-box.
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<GeocodedAddress> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`;

  const response = await fetch(url, {
    headers: {
      // Required by Nominatim usage policy to identify the client
      'User-Agent': 'SabjiWalaApp/1.0 (support@sabjiwala.app)',
    },
  });

  if (!response.ok) {
    throw new Error('Unable to fetch address from location');
  }

  const data = await response.json();
  const address = data?.address || {};

  return {
    formattedAddress: data?.display_name || '',
    city: address.city || address.town || address.village || address.state || '',
    pincode: address.postcode || '',
    landmark:
      address.road ||
      address.neighbourhood ||
      address.suburb ||
      address.village ||
      '',
    houseNumber: address.house_number || address.building || '',
  };
};





