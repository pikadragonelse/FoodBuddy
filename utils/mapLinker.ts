import { Linking, Platform } from 'react-native';

/**
 * Opens the location in Google Maps using EXACT restaurant name from Goong
 * Goong đã trả về tên quán chính xác, ta dùng tên đó để search
 * 
 * @param restaurantName - Exact name from Goong (VD: "Phở Hùng - Võ Văn Tần")
 */
/**
 * Opens the location in Google Maps using EXACT restaurant name + address
 * 
 * @param restaurantName - Exact name (VD: "Phở Hùng")
 * @param address - Address (VD: "243 Nguyễn Trãi, Quận 1") -- Optional but recommended
 */
export const openRestaurantInMaps = (restaurantName: string, address?: string) => {
  if (!restaurantName) {
    console.warn('No restaurant name provided');
    return;
  }

  // Construct Query: "Name Address"
  const query = address 
    ? encodeURIComponent(`${restaurantName} ${address}`)
    : encodeURIComponent(restaurantName);
  
  // Google Maps URL Construction
  const scheme = Platform.select({ ios: 'comgooglemaps://', android: 'geo:0,0' });
  const latLngUrl = Platform.select({ 
      ios: `comgooglemaps://?q=${query}`, 
      android: `geo:0,0?q=${query}` 
  });
  
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  const openApp = async () => {
    try {
        // Check if we can open the scheme
        // Note: For 'geo:', canOpenURL usually returns true on Android
        const supported = await Linking.canOpenURL(scheme || '');
        
        if (supported && latLngUrl) {
            await Linking.openURL(latLngUrl);
        } else {
            // Fallback to Web
            await Linking.openURL(webUrl);
        }
    } catch (error) {
        console.log('Error opening map app, using web fallback', error);
        await Linking.openURL(webUrl);
    }
  };

  openApp();
};
