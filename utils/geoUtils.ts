import * as Location from 'expo-location';

// ========================
// Types
// ========================
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// ========================
// Get Current Location
// ========================
export const getCurrentLocation = async (): Promise<Coordinates | null> => {
  try {
    // Request foreground permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return null;
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

// ========================
// Reverse Geocoding (Free)
// ========================
export const getAddressFromCoords = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (results && results.length > 0) {
      const address = results[0];
      
      // Format address nicely
      const parts: string[] = [];
      
      if (address.streetNumber) parts.push(address.streetNumber);
      if (address.street) parts.push(address.street);
      if (address.district) parts.push(address.district);
      if (address.city) parts.push(address.city);
      
      return parts.length > 0 ? parts.join(', ') : 'Current Location';
    }

    return 'Current Location';
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return 'Current Location';
  }
};

// ========================
// Calculate Distance (Haversine Formula)
// ========================
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Format to 1 decimal place
  return distance.toFixed(1);
};

// Helper: Convert degrees to radians
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// ========================
// Format Distance Display
// ========================
export const formatDistance = (distanceKm: string): string => {
  const dist = parseFloat(distanceKm);
  
  if (dist < 1) {
    return `${Math.round(dist * 1000)}m`;
  }
  
  return `${distanceKm}km`;
};
