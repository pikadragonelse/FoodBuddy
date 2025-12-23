import {
  API_CONFIG,
  BUDGET_CATEGORIES,
  MEAL_CATEGORIES,
  MOOD_CATEGORIES,
  OCCASION_CATEGORIES,
} from "@/constants";
import type { CategoryItem, ExploreResult } from "@/types";
import { GoogleGenAI, Type } from "@google/genai";
import { smartLocationSearch } from "./goong";
import { getUnsplashImage } from "./imageService";

// Re-export types and constants for backward compatibility
export {
  BUDGET_CATEGORIES,
  MEAL_CATEGORIES,
  MOOD_CATEGORIES,
  OCCASION_CATEGORIES
};
export type { CategoryItem, ExploreResult };

// ========================
// Configuration
// ========================
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = API_CONFIG.GEMINI_MODEL;

/** Internal type for Gemini response */
interface GeminiExploreItem {
  dishName: string;
  restaurantName: string;
  searchQuery: string;
  imageKeyword: string;
  description: string;
  priceRange: string;
}

// ========================
// Gemini Schema for Explore (same as Home page gemini.ts)
// ========================
const exploreSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      dishName: {
        type: Type.STRING,
        description: "Tên món ăn hấp dẫn",
      },
      restaurantName: {
        type: Type.STRING,
        description: "Tên quán cụ thể",
      },
      searchQuery: {
        type: Type.STRING,
        description:
          'Từ khóa chính xác tìm quán kèm tên đường/quận (VD: "Cơm tấm Ba Ghiền Đặng Văn Ngữ")',
      },
      imageKeyword: {
        type: Type.STRING,
        description:
          'Từ khóa tiếng Anh ngắn gọn để tìm ảnh đẹp trên Unsplash (VD: "broken rice", "pho soup")',
      },
      description: {
        type: Type.STRING,
        description:
          "Mô tả hương vị kể chuyện, cảm xúc, hợp mood user. 1-2 câu.",
      },
      priceRange: {
        type: Type.STRING,
        description: "Khoảng giá (VD: 50-100k)",
      },
    },
    required: [
      "dishName",
      "restaurantName",
      "searchQuery",
      "imageKeyword",
      "description",
      "priceRange",
    ],
  },
};

// ========================
// Search by Keyword
// ========================
export const searchByKeyword = async (
  keyword: string,
  userLat: number,
  userLng: number,
): Promise<ExploreResult[]> => {
  if (!API_KEY) {
    throw new Error("Chưa cấu hình Gemini API Key");
  }

  console.log(`🔍 [EXPLORE] Searching for: "${keyword}"`);

  const currentDate = new Date().toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
  });

  const prompt = `Bạn là một "Food Soulmate" thấu hiểu tâm trạng và sành ăn tại TP.HCM.
User tìm kiếm: "${keyword}".
Tọa độ GPS hiện tại: ${userLat.toFixed(6)}, ${userLng.toFixed(6)} (TP.HCM).
Thời điểm: ${currentDate}

NHIỆM VỤ: Gợi ý 5 quán/món ăn CỤ THỂ, PHÙ HỢP NHẤT với từ khóa này.

YÊU CẦU BẮT BUỘC (RẤT QUAN TRỌNG):
- CHỈ gợi ý quán CHẮC CHẮN ĐANG HOẠT ĐỘNG tính đến ${currentDate}
- Ưu tiên:
  + Chuỗi nhà hàng lớn (ít khả năng đóng cửa)
  + Quán hoạt động trên 5 năm, uy tín lâu đời
  + Quán có nhiều chi nhánh
  + Quán nổi tiếng được review nhiều trên Foody, Google Maps
- TUYỆT ĐỐI TRÁNH:
  + Quán nhỏ lẻ có thể đã đóng cửa
  + Quán mới mở chưa ổn định
  + Quán đã từng có tin đồn đóng cửa
- searchQuery: Tên quán cụ thể + tên đường/quận để tìm trên Google Maps
  - Tốt: "Phở Hòa Pasteur Quận 3", "Cơm Tấm Cali Nguyễn Trãi"
  - Tránh: "Phở ngon quận 1" (chung chung)
- description: Mô tả hấp dẫn về món/quán (1-2 câu)

Trả về JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: exploreSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");

    const items: GeminiExploreItem[] = JSON.parse(text);
    console.log(
      "💡 [EXPLORE SUGGESTIONS]:",
      items.map((s) => s.dishName),
    );

    return await hydrateResults(items, userLat, userLng);
  } catch (error) {
    console.error("❌ Explore Search Error:", error);
    throw error;
  }
};

// ========================
// Search by Category
// ========================
export const searchByCategory = async (
  category: CategoryItem,
  userLat: number,
  userLng: number,
): Promise<ExploreResult[]> => {
  if (!API_KEY) {
    throw new Error("Chưa cấu hình Gemini API Key");
  }

  console.log(
    `📂 [EXPLORE] Category search: "${category.name}" - ${category.prompt}`,
  );

  const currentDate = new Date().toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
  });

  const prompt = `Bạn là một "Food Soulmate" thấu hiểu tâm trạng và sành ăn tại TP.HCM.
User đang tìm: ${category.prompt} (${category.name}).
Tọa độ GPS hiện tại: ${userLat.toFixed(6)}, ${userLng.toFixed(6)} (TP.HCM).
Thời điểm: ${currentDate}

NHIỆM VỤ: Gợi ý 5 quán/món ăn CỤ THỂ, PHÙ HỢP NHẤT.

YÊU CẦU BẮT BUỘC (RẤT QUAN TRỌNG):
- CHỈ gợi ý quán CHẮC CHẮN ĐANG HOẠT ĐỘNG tính đến ${currentDate}
- Ưu tiên:
  + Chuỗi nhà hàng lớn (ít khả năng đóng cửa)
  + Quán hoạt động trên 5 năm, uy tín lâu đời
  + Quán có nhiều chi nhánh
  + Quán nổi tiếng được review nhiều trên Foody, Google Maps
- TUYỆT ĐỐI TRÁNH:
  + Quán nhỏ lẻ có thể đã đóng cửa
  + Quán mới mở chưa ổn định
- searchQuery: Tên quán cụ thể + tên đường/quận để tìm trên Google Maps
  - Tốt: "Cafe The Workshop Quận 1", "Highlands Coffee Nguyễn Huệ"
  - Tránh: "quán cafe quận 1" (chung chung)
- Phù hợp với ngữ cảnh: "${category.name}"
- Đa dạng loại hình (không lặp lại)
- description: Mô tả hấp dẫn về món/quán (1-2 câu)

Trả về JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: exploreSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");

    const items: GeminiExploreItem[] = JSON.parse(text);
    console.log(
      "💡 [CATEGORY SUGGESTIONS]:",
      items.map((s) => s.dishName),
    );

    return await hydrateResults(items, userLat, userLng);
  } catch (error) {
    console.error("❌ Category Search Error:", error);
    throw error;
  }
};

// ========================
// Hydrate Results with Real Data (same flow as foodService.ts)
// ========================
const hydrateResults = async (
  items: GeminiExploreItem[],
  userLat: number,
  userLng: number,
): Promise<ExploreResult[]> => {
  console.log("🚀 [HYDRATE] Processing results with Goong & Unsplash...");

  const results = await Promise.all(
    items.map(async (item, index): Promise<ExploreResult | null> => {
      try {
        // Parallel fetch: Location + Image (same as foodService)
        const [place, imageUrl] = await Promise.all([
          smartLocationSearch(item.searchQuery, userLat, userLng),
          getUnsplashImage(item.imageKeyword),
        ]);

        // Generate pseudo rating (3.5 - 5.0)
        const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;

        if (!place) {
          // Fallback without real location (same as foodService)
          console.log(
            `⚠️ Skipping precise search for "${item.dishName}". Using Fallback Mode.`,
          );
          return {
            id: `explore-${index}-${Date.now()}`,
            dishName: item.dishName,
            restaurantName: item.restaurantName,
            address: "Xem trên Google Maps",
            lat: 0,
            lng: 0,
            distance: -1,
            photoUrl: imageUrl,
            rating,
            priceRange: item.priceRange,
            description: item.description,
            placeId: "fallback",
          };
        }

        console.log(
          `✅ [FOUND] "${place.name}" - Distance: ${place.distance?.toFixed(2)}km`,
        );

        return {
          id: `explore-${index}-${Date.now()}`,
          dishName: item.dishName,
          restaurantName: place.name,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          distance: place.distance || 0,
          photoUrl: imageUrl,
          rating,
          priceRange: item.priceRange,
          description: item.description,
          placeId: place.place_id,
        };
      } catch (error) {
        console.error(`❌ Error hydrating item ${index}:`, error);
        return null;
      }
    }),
  );

  const validResults = results.filter((r): r is ExploreResult => r !== null);
  console.log(`✅ [HYDRATE] Done. Found ${validResults.length} places.`);

  return validResults;
};
