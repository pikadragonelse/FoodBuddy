// ========================
// Explore Types
// ========================

/** Kết quả explore (quán ăn) */
export interface ExploreResult {
  id: string;
  dishName: string;
  restaurantName: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  photoUrl: string;
  rating: number;
  priceRange: string;
  description: string;
  placeId: string;
}

/** Category item cho explore */
export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  color: string;
}

/** Gợi ý món từ Gemini */
export interface GeminiDishSuggestion {
  dishName: string;
  searchQuery: string;
  imageKeyword: string;
  moodDescription: string;
  suggestedActivity: string;
}

/** Smart food suggestion (combined data) */
export interface SmartFoodSuggestion {
  id: string;
  dishName: string;
  restaurantName: string;
  address: string;
  distance: string;
  photoUrl: string;
  moodDescription: string;
  suggestedActivity: string;
  lat: number;
  lng: number;
  placeId: string;
}
