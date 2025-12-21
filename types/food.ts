// ========================
// Type Definitions
// ========================

export interface FoodSuggestion {
  id: string;
  dishName: string;
  restaurantName: string;
  priceRange: string;
  distance: string;
  reason: string;
  imageURL: string;
  grabKeyword: string;
  tiktokKeyword: string;
}

export interface TagCategory {
  title: string;
  tags: string[];
}

export type AppStage = 'input' | 'loading' | 'results';
