import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

// ========================
// Types
// ========================
export interface GroundedRestaurant {
  id: string;
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  cuisine?: string;
  description: string;
  imageUrl?: string;
  imageUrls?: string[]; // Thêm trường này để chứa nhiều ảnh
  sourceUrl?: string;
  sourceTitle?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// ========================
// Grounded Search - Tìm quán ăn với Google Search
// ========================
export const searchRestaurantWithGrounding = async (
  query: string,
  location: string
): Promise<GroundedRestaurant[]> => {
  console.log(`🌐 [GROUNDING] Searching: "${query}" near "${location}"`);

  try {
    // Sử dụng google_search tool để ground response với dữ liệu thật từ internet
    const groundingTool = {
      googleSearch: {},
    };

    const prompt = `Tìm thông tin CHI TIẾT về quán ăn/nhà hàng: "${query}" ở khu vực ${location}, Việt Nam.

Trả về JSON array với thông tin sau cho mỗi quán (tối đa 3 quán):
{
  "id": "unique-id",
  "name": "Tên quán chính xác",
  "address": "Địa chỉ đầy đủ (số nhà, đường, quận)",
  "rating": 4.5,  // Điểm đánh giá nếu tìm được
  "reviewCount": 120,  // Số lượng review nếu tìm được
  "priceRange": "50k-100k",  // Khoảng giá
  "cuisine": "Việt Nam / Chay / Fast Food...",
  "description": "Mô tả ngắn 1-2 câu về đặc trưng của quán",
  "imageUrl": "URL ảnh chính đại diện cho quán",
  "imageUrls": ["URL ảnh 1", "URL ảnh 2", "URL ảnh 3"], // Trả về 3-5 ảnh món ăn/không gian quán
  "coordinates": { "lat": 10.xxx, "lng": 106.xxx }  // Tọa độ nếu tìm được
}

Chỉ trả về JSON array, không có text gì khác. Nếu không tìm thấy quán nào, trả về [].`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [groundingTool],
      },
    });

    // Log grounding metadata nếu có
    const candidate = (response as any).candidates?.[0];
    if (candidate?.groundingMetadata) {
      console.log('🔗 [GROUNDING SOURCES]:', 
        candidate.groundingMetadata.groundingChunks?.map((c: any) => c.web?.title).join(', ')
      );
    }

    const text = response.text;
    console.log('📄 [RAW RESPONSE]:', text?.substring(0, 300));

    if (!text) {
      console.log('❌ Empty response from Grounding');
      return [];
    }

    // Parse JSON từ response
    try {
      // Tìm JSON array trong response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const restaurants: GroundedRestaurant[] = JSON.parse(jsonMatch[0]);
        console.log(`✅ [GROUNDING] Found ${restaurants.length} restaurants`);
        return restaurants;
      }
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
    }

    return [];

  } catch (error) {
    console.error('❌ Grounding Search Error:', error);
    return [];
  }
};

// ========================
// Smart Search - Kết hợp Gemini Grounding + Goong
// ========================
export const smartRestaurantSearch = async (
  dishName: string,
  userLocation: { lat: number; lng: number; address: string }
): Promise<GroundedRestaurant | null> => {
  // Bước 1: Dùng Grounding để tìm thông tin quán từ internet
  const groundedResults = await searchRestaurantWithGrounding(
    dishName,
    userLocation.address
  );

  if (groundedResults.length === 0) {
    return null;
  }

  // Lấy kết quả đầu tiên (tốt nhất)
  const best = groundedResults[0];

  // Nếu chưa có tọa độ, có thể gọi Goong để lấy
  // (Tạm thời dùng fallback location)
  if (!best.coordinates) {
    best.coordinates = {
      lat: userLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: userLocation.lng + (Math.random() - 0.5) * 0.01,
    };
  }

  return best;
};
