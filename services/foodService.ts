
import { fetchGeminiSuggestions } from './gemini';
import { smartLocationSearch } from './goong';
import { getUnsplashImage } from './imageService';

// ========================
// Types
// ========================
export interface SmartFoodSuggestion {
  id: string;
  // Từ Gemini
  dishName: string;
  reason: string; // Map from moodDescription
  suggestedActivity: string; // New field
  keywords: {
    grab: string;
    tiktok: string;
  };
  priceRange: string; // Placeholder or estimated
  
  // Từ Goong
  restaurant: string;
  address: string;
  lat: number;
  lng: number;
  distance: number; // Goong now returns distance
  
  // Từ ImageService
  photoUrl: string;

  // Extra
  rating?: number; // Optional as Goong Search might not return it in simple object
  reviewCount?: number;
  placeId: string;
}

// ========================
// SMART FLOW
// ========================
export const getSmartFoodSuggestions = async (
  locationName: string,
  userLat: number,
  userLng: number,
  tags: string[]
): Promise<SmartFoodSuggestion[]> => {
  console.log('🚀 [SMART FLOW] Starting with new Services...');
  console.log(`📍 Location: ${locationName}`);
  console.log(`🏷️ Tags: ${tags.join(', ')}`);

  // 1. Get Suggestions from Gemini
  // We join tags to create the "mood/cravings" string
  const moodContext = `${tags.join(', ')} at ${locationName}`;
  const aiSuggestions = await fetchGeminiSuggestions(moodContext, { lat: userLat, lng: userLng });
  
  if (!aiSuggestions || aiSuggestions.length === 0) {
    throw new Error('AI không tìm thấy món nào, thử lại nha!');
  }

  // 2. Hydrate with Goong Location & Unsplash Images
  const results = await Promise.all(
    aiSuggestions.map(async (idea, index): Promise<SmartFoodSuggestion | null> => {
      try {
        // Parallel fetch for Speed: Location + Image
        const [realPlace, imageUrl] = await Promise.all([
          smartLocationSearch(idea.searchQuery, userLat, userLng),
          getUnsplashImage(idea.imageKeyword)
        ]);

        if (!realPlace) {
          console.log(`⚠️ Skiping precise search for "${idea.dishName}". Using Fallback Mode.`);
          
          return {
            id: `proposal-${index}`,
            dishName: idea.dishName,
            reason: idea.moodDescription,
            suggestedActivity: idea.suggestedActivity,
            priceRange: 'Tùy món',
            keywords: {
              grab: `${idea.dishName}`,
              tiktok: `${idea.dishName} review`,
            },
            restaurant: idea.searchQuery, // Use searchQuery as the restaurant name
            address: 'Địa chỉ ẩn (Chọn Google Maps để xem)', 
            lat: 0,
            lng: 0,
            distance: -1, // Mark as unknown
            photoUrl: imageUrl,
            placeId: 'fallback',
          };
        }

        // Construct final object
        return {
          id: `suggestion-${index}`,
          dishName: idea.dishName,
          reason: idea.moodDescription, // Map moodDescription to reason
          suggestedActivity: idea.suggestedActivity,
          priceRange: 'Tùy món', // Placeholder as Gemini doesn't return this anymore
          keywords: {
            grab: `${idea.dishName} ${realPlace.name}`,
            tiktok: `${idea.dishName} ${realPlace.name} review`,
          },
          restaurant: realPlace.name,
          address: realPlace.address,
          lat: realPlace.lat,
          lng: realPlace.lng,
          distance: realPlace.distance || 0,
          photoUrl: imageUrl,
          placeId: realPlace.place_id,
        };

      } catch (error) {
        console.error(`❌ Error processing item ${index}:`, error);
        return null;
      }
    })
  );

  const validResults = results.filter((r): r is SmartFoodSuggestion => r !== null);
  
  console.log(`✅ [SMART FLOW] Done. Found ${validResults.length} places.`);
  
  if (validResults.length === 0) {
    throw new Error('Không tìm thấy quán nào trong vòng 5km.');
  }

  return validResults;
};
