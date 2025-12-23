// ========================
// API Configuration
// ========================
export const API_CONFIG = {
  /** Gemini model để dùng cho AI features */
  GEMINI_MODEL: "gemini-2.5-flash-lite",
  
  /** Goong API base URL */
  GOONG_BASE_URL: "https://rsapi.goong.io",
  
  /** Unsplash API base URL */
  UNSPLASH_BASE_URL: "https://api.unsplash.com",
};

// ========================
// Cache Configuration
// ========================
export const CACHE_CONFIG = {
  /** Thời gian cache recipe search (3 ngày) */
  RECIPE_SEARCH_TTL_MS: 3 * 24 * 60 * 60 * 1000,
  
  /** Thời gian cache recipe details (7 ngày) */
  RECIPE_DETAILS_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  
  /** Thời gian cache explore results (1 ngày) */
  EXPLORE_RESULTS_TTL_MS: 1 * 24 * 60 * 60 * 1000,
};

// ========================
// UI Configuration
// ========================
export const UI_CONFIG = {
  /** Số lượng kết quả hiển thị mỗi lần search */
  SEARCH_RESULTS_LIMIT: 6,
  
  /** Số lượng gợi ý trong chat */
  CHAT_SUGGESTIONS_LIMIT: 4,
  
  /** Animation duration (ms) */
  ANIMATION_DURATION: 300,
};
