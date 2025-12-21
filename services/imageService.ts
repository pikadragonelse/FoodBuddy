
// ========================
// Configuration
// ========================
const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

// ========================
// Helper: Get Image URL
// ========================
export const getUnsplashImage = async (keyword: string): Promise<string> => {
  try {
    // 1. Try Unsplash API if Key is available
    if (UNSPLASH_ACCESS_KEY) {
      console.log(`📸 Fetching Unsplash image for: "${keyword}"`);
      const response = await fetch(`${UNSPLASH_API_URL}?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`, {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const imageUrl = data.results[0].urls.regular;
          console.log(`✅ Unsplash Image Found: ${imageUrl}`);
          return imageUrl;
        }
      } else {
        console.warn(`⚠️ Unsplash API Error: ${response.status}`);
      }
    }

    // 2. Fallback: Use LoremFlickr (No Key needed)
    console.log(`⚠️ Using LoremFlickr fallback for: "${keyword}"`);
    // Random parameter prevents caching same image for same keyword in short time if needed, 
    // but straight URL is fine. We add timestamp to force refresh if needed or just simple.
    // Dimensions 800x600 for good quality.
    const fallbackUrl = `https://loremflickr.com/800/600/${encodeURIComponent(keyword)}/food`;
    return fallbackUrl;

  } catch (error) {
    console.error('❌ Image Service Error:', error);
    // Ultimate fallback
    return 'https://loremflickr.com/800/600/food';
  }
};
