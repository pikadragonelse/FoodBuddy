
const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY;

// ========================
// Types
// ========================
export interface GoongPlace {
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number; // Distance in km
}

// ========================
// Helper: Calculate Distance (Haversine)
// ========================
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// ========================
// Core Search Function
// ========================
export const smartLocationSearch = async (
  searchQuery: string,
  userLat: number,
  userLong: number
): Promise<GoongPlace | null> => {
  if (!GOONG_API_KEY) {
    console.warn('⚠️ Missing EXPO_PUBLIC_GOONG_API_KEY');
    return null;
  }

  try {
    console.log(`🔍 [GOONG SMART SEARCH]: "${searchQuery}"`);

    // 1. Call Goong Place Search (AutoComplete is often better for direct queries)
    // We stick to AutoComplete as it handles fuzzy queries well ("Phở Hòa Pasteur")
    const searchUrl = `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(
      searchQuery
    )}&location=${userLat},${userLong}&radius=5`; // Radius parameter works loosely in AutoComplete

    const res = await fetch(searchUrl);
    const data = await res.json();

    if (data.status !== 'OK' || !data.predictions || data.predictions.length === 0) {
      console.log(`❌ No location found for "${searchQuery}"`);
      return null;
    }

    // 2. Get the best prediction (usually the first one)
    const bestPrediction = data.predictions[0];
    const placeId = bestPrediction.place_id;

    // 3. Get Place Details to retrieve coordinates
    const detailUrl = `https://rsapi.goong.io/Place/Detail?api_key=${GOONG_API_KEY}&place_id=${placeId}`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();

    if (detailData.status !== 'OK' || !detailData.result) {
      console.log(`❌ Failed to get details for place_id: ${placeId}`);
      return null;
    }

    const result = detailData.result;
    const placeLat = result.geometry.location.lat;
    const placeLng = result.geometry.location.lng;

    // 4. Validate Distance (Strict 5km Check)
    const distance = calculateDistance(userLat, userLong, placeLat, placeLng);

    if (distance > 5) {
      console.log(`❌ [DISTANCE FAIL] Found "${result.name}" but it is ${distance.toFixed(2)}km away (Limit: 5km). Ignoring.`);
      return null;
    }

    console.log(`✅ [FOUND] "${result.name}" - Distance: ${distance.toFixed(2)}km`);

    return {
      place_id: placeId,
      name: result.name,
      address: result.formatted_address,
      lat: placeLat,
      lng: placeLng,
      distance: distance
    };

  } catch (error) {
    console.error('❌ Goong API Error:', error);
    return null;
  }
};
