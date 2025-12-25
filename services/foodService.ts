import { calculateDistance } from '@/utils/geoUtils';
import { getFromCache, saveToCache } from './cacheService';
import { generateSearchKeywords, matchPlacesWithMood } from './gemini';
import { getUnsplashImage } from './imageService';
import { getHighQualityUrl, getMapsURL, getPlaceDetail, searchNearbyRestaurants } from './trackAsia';

// ========================
// Types
// ========================
export interface SmartFoodSuggestion {
  id: string;
  dishName: string; // The recommendation from AI
  reason: string;
  suggestedActivity: string;

  // From Google
  restaurant: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  rating?: number;
  reviewCount?: number;
  photoUrl: string;
  placeId: string;
  googleMapsUrl: string;
  openNow?: boolean;
  priceRange?: string; // Add back for FoodCard compatibility

  keywords: {
    grab: string;
    tiktok: string;
  };
}

// ========================
// SMART FLOW
// ========================
export const getSmartFoodSuggestions = async (
  locationName: string,
  userLat: number,
  userLng: number,
  tags: string[],
  forceRefresh: boolean = false,
  radiusKm: number = 5 // Default radius 5km
): Promise<SmartFoodSuggestion[]> => {
  console.log('🚀 [SMART FLOW] Starting Google-First Discovery...');
  console.log(`📍 Location: ${locationName} `);
  console.log(`🏷️ Tags: ${tags.join(', ')} `);

  if (!forceRefresh) {
    const cachedData = await getFromCache(locationName, tags);
    if (cachedData) {
      console.log('✅ [SMART FLOW] Returning cached data.');
      return cachedData;
    }
  } else {
    console.log('🔄 [SMART FLOW] Cache bypassed (Force Refresh)');
  }

  // 1. AI-Driven Keyword Expansion
  console.log('🧠 [SMART FLOW] Expanding tags into smart keywords...');
  const smartKeywords = await generateSearchKeywords(tags);
  console.log(`💡 [SMART FLOW] Optimized keywords: ${smartKeywords.join(', ')}`);

  // 2. Multi-Keyword Search in Track-Asia (Parallel)
  // Use user selected radius (convert to meters)
  const radius = radiusKm * 1000;

  if (tags.some(t => t.toLowerCase().includes('hẹn hò') || t.toLowerCase().includes('sang'))) {
    // Optional: We could still increase it slightly if needed, but let's respect user choice mostly
    // or just log that we are using the user's radius
  }

  console.log(`🌐 [SMART FLOW] Searching Track-Asia with multiple keywords within ${radius / 1000}km...`);

  const searchPromises = smartKeywords.map(kw => searchNearbyRestaurants(userLat, userLng, radius, kw));
  const multiLevelResults = await Promise.all(searchPromises);

  // Flatten and Deduplicate by place_id
  const flattenedPlaces = multiLevelResults.flat();
  const uniquePlacesMap = new Map();
  flattenedPlaces.forEach(place => {
    if (place && place.place_id && !uniquePlacesMap.has(place.place_id)) {
      uniquePlacesMap.set(place.place_id, place);
    }
  });

  const rawPlaces = Array.from(uniquePlacesMap.values());

  if (rawPlaces.length === 0) {
    throw new Error('Không tìm thấy quán nào quanh đây. Thử tag khác nhé!');
  }
  console.log(`🔍 [SMART FLOW] Found ${rawPlaces.length} unique places across all keywords.`);

  // Debug: Check open_now values
  const openNowStats = rawPlaces.reduce((acc, p) => {
    const key = p.open_now === true ? 'open' : p.open_now === false ? 'closed' : 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log(`📊 [DEBUG] Open status: ${JSON.stringify(openNowStats)}`);

  // Filter out closed restaurants
  const openPlaces = rawPlaces.filter(place => {
    // If open_now is undefined, we keep it (assume open to avoid filtering too aggressively)
    // If open_now is explicitly false, we filter it out
    return place.open_now !== false;
  });

  // Temporarily: If no open places, use all places and warn user
  const placesToUse = openPlaces.length > 0 ? openPlaces : rawPlaces;

  if (openPlaces.length === 0) {
    console.warn(`⚠️ [SMART FLOW] All ${rawPlaces.length} restaurants appear closed. Using all results anyway (may include closed restaurants).`);
  } else {
    console.log(`🏪 [SMART FLOW] Filtered to ${openPlaces.length} open restaurants (removed ${rawPlaces.length - openPlaces.length} closed ones).`);
  }

  // 3. Filter & Storytelling with Gemini (Top 25, Shuffled)
  const moodContext = `${tags.join(', ')} `;
  console.log(`🧠 [SMART FLOW] Asking Gemini to match places with mood: "${moodContext}"`);

  // Shuffle to avoid ALWAYS picking the same top results from Track-Asia
  const shuffledPlaces = placesToUse.sort(() => 0.5 - Math.random());

  const geminiMatches = await matchPlacesWithMood(moodContext, shuffledPlaces.slice(0, 25).map(p => ({
    ...p,
    vicinity: p.vicinity || p.description || p.formatted_address
  })));

  if (!geminiMatches || geminiMatches.length === 0) {
    throw new Error('AI không thể chọn được quán nào phù hợp. Thử lại nha!');
  }
  console.log(`✨[SMART FLOW] Gemini matched ${geminiMatches.length} suggestions.`);

  // 3. Hydrate & Format Results
  const hydrationPromises = geminiMatches.map(async (match, index) => {
    const originalPlace = placesToUse.find(p => p.place_id === match.placeId);
    if (!originalPlace) {
      console.warn(`⚠️ Gemini suggested place_id ${match.placeId} not found in original Track-Asia results.`);
      return null;
    }

    // Dynamic Image Fetching: 
    // 1. Try to get detailed photos (Menu/Food) from Place Details (SerpAPI)
    // 2. Fallback to Thumbnail from Search Result
    // 3. Last resort: Unsplash AI Image

    let photoUrl = undefined;

    try {
      // Fetch details for this specific place to get menu/food photos
      // Only do this for final matches to save API calls
      const details = await getPlaceDetail(originalPlace.place_id);

      if (details) {
        // Check for verified highlight photos first (usually better quality than menu scans)
        if (details.photos && details.photos.length > 0) {
          const firstPhoto = details.photos[0];
          // Use helper to force high-res
          const rawUrl = firstPhoto.image || firstPhoto.thumbnail;
          photoUrl = getHighQualityUrl(rawUrl);
          console.log(`📸 Found HIGHLIGHT photo for: "${originalPlace.name}"`);
        }
        // Fallback to menu if no photos found (rare)
        else if (details.menu && details.menu.images && details.menu.images.length > 0) {
          photoUrl = details.menu.images[0];
          console.log(`📸 Found MENU photo for: "${originalPlace.name}"`);
        }
      }
    } catch (err) {
      console.warn("⚠️ Error fetching place details:", err);
    }

    // Fallback to Search Thumbnail
    if (!photoUrl && originalPlace.thumbnail) {
      photoUrl = originalPlace.thumbnail;
      console.log(`📸 Using thumbnail for: "${originalPlace.name}"`);
    }

    // Fallback to Unsplash
    if (!photoUrl) {
      console.log(`📸 Real photo missing, fetching Unsplash for: "${match.dishRecommendation}"`);
      photoUrl = await getUnsplashImage(match.dishRecommendation);
    }

    const suggestion: SmartFoodSuggestion = {
      id: `trackasia-${index}-${originalPlace.place_id}`,
      dishName: match.dishRecommendation,
      reason: match.moodDescription,
      suggestedActivity: match.suggestedActivity,
      restaurant: originalPlace.name,
      address: originalPlace.vicinity || originalPlace.description || originalPlace.formatted_address || "Địa chỉ chưa xác định",
      lat: originalPlace.geometry.location.lat,
      lng: originalPlace.geometry.location.lng,
      distance: parseFloat(calculateDistance(userLat, userLng, originalPlace.geometry.location.lat, originalPlace.geometry.location.lng)),
      rating: originalPlace.rating || undefined,
      reviewCount: originalPlace.user_ratings_total || undefined,
      photoUrl,
      placeId: originalPlace.place_id,
      googleMapsUrl: getMapsURL(originalPlace.geometry.location.lat, originalPlace.geometry.location.lng, originalPlace.name),
      openNow: originalPlace.open_now,
      priceRange: 'Tùy món',
      keywords: {
        grab: `${match.dishRecommendation} ${originalPlace.name}`,
        tiktok: `${originalPlace.name} review`,
      }
    };
    return suggestion;
  });

  const resolvedSuggestions = await Promise.all(hydrationPromises);
  const finalSuggestions = resolvedSuggestions.filter((s): s is SmartFoodSuggestion => s !== null);

  if (finalSuggestions.length === 0) {
    throw new Error('AI không thể chọn được quán nào phù hợp. Thử lại nha!');
  }

  console.log(`✅[SMART FLOW] Done.Found ${finalSuggestions.length} final suggestions.`);

  // 4. Save to Cache
  await saveToCache(locationName, tags, finalSuggestions);

  return finalSuggestions;
};
