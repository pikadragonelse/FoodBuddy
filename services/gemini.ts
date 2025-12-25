import { API_CONFIG } from "@/constants";
import { GoogleGenAI, Type } from "@google/genai";

// ========================
// Configuration
// ========================
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = API_CONFIG.GEMINI_MODEL;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ========================
// Types
// ========================
export interface GeminiMatchResult {
  placeId: string; // ID của quán từ Google
  moodDescription: string; // Mô tả hương vị 'storytelling' (1-2 câu)
  suggestedActivity: string; // Hoạt động sau khi ăn
  dishRecommendation: string; // Món ăn signature AI gợi ý dựa trên menu quán
}

// Schema cho structured output
const matchSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      placeId: {
        type: Type.STRING,
        description: "ID của quán ăn (giữ nguyên từ input)",
      },
      dishRecommendation: {
        type: Type.STRING,
        description: "Gợi ý món ăn ngon nhất tại quán này (Signature dish)",
      },
      moodDescription: {
        type: Type.STRING,
        description:
          "Mô tả cảm xúc bay bổng, kích thích vị giác cho món/quán này. 1-2 câu.",
      },
      suggestedActivity: {
        type: Type.STRING,
        description: "Gợi ý hoạt động chill chill sau khi ăn xong (1 câu).",
      },
    },
    required: [
      "placeId",
      "dishRecommendation",
      "moodDescription",
      "suggestedActivity",
    ],
  },
};

// ========================
// Fetch Gemini Suggestions
// ========================

/**
 * Stage 1 AI: Convert mood tags into search keywords
 */
export const generateSearchKeywords = async (tags: string[]): Promise<string[]> => {
  if (!API_KEY) throw new Error("Chưa cấu hình Gemini API Key");

  const prompt = `Bạn là một chuyên gia ẩm thực tại Việt Nam.
User đang chọn các thẻ tâm trạng: "${tags.join(', ')}".

NHIỆM VỤ:
Hãy tạo ra 3-4 từ khóa tìm kiếm RIÊNG BIỆT (ngắn gọn, mỗi từ khóa 1-3 từ) để tìm các quán ăn phù hợp trên bản đồ.
Các từ khóa nên bao gồm: loại món ăn, không gian, hoặc tên loại quán phổ biến.

Ví dụ: 
- Thẻ "Nhậu" -> ["Quán nhậu", "Bia club", "Quán ốc", "Lẩu bò"]
- Thẻ "Chill, Cafe" -> ["Cafe acoustic", "Cà phê đẹp", "Rooftop cafe", "Tiệm bánh ngọt"]

CHỈ TRẢ VỀ JSON ARRAY CHỨA CÁC CHUỖI TỪ KHÓA.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });

    const keywords: string[] = JSON.parse(response.text || "[]");
    return keywords.length > 0 ? keywords : tags;
  } catch (error) {
    console.error("❌ Keyword Generation Error:", error);
    return tags; // Fallback
  }
};

/**
 * Use Gemini to filter and describe real places from Google
 */
export const matchPlacesWithMood = async (
  moodOrCravings: string,
  placesList: any[], // List of simplified place objects from Google
  maxRetries: number = 2
): Promise<GeminiMatchResult[]> => {
  if (!API_KEY) {
    throw new Error("Chưa cấu hình Gemini API Key");
  }

  if (placesList.length === 0) return [];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await delay(Math.pow(2, attempt) * 1000);
      }

      const inputPlaces = placesList.map(p => ({
        id: p.place_id,
        name: p.name,
        address: p.vicinity,
        rating: p.rating
      }));

      const prompt = `Bạn là một "Food Soulmate" thấu hiểu tâm trạng tại Việt Nam.
User đang có mood: "${moodOrCravings}".

Dưới đây là danh sách các quán ăn THỰC TẾ gần user:
${JSON.stringify(inputPlaces, null, 2)}

NHIỆM VỤ: 
1. Chọn tối đa 8 quán phù hợp nhất với mood của user.
2. Với mỗi quán, hãy chọn ra một món ăn ĐẶC TRƯNG NHẤT (Signature Dish) dựa trên TÊN TINH HOA của quán.
   - Ví dụ: Quán "Phở Hòa" -> Gợi ý "Phở Bò Tái Nạm" (Không gợi ý chè yến).
   - Ví dụ: Quán "Bún Đậu Mắm Tôm Cô Hằng" -> Gợi ý "Mẹt Bún Đậu Đầy Đủ" (Không gợi ý cháo sườn).
   - TRÁNH TUYỆT ĐỐI: Gợi ý chung chung như "Yến sào", "Chè hạt sen" nếu quán không bán.
   - Nếu quán là Cafe: Gợi ý đồ uống signature (Cà phê trứng, Trà vải...).

3. Viết mô tả hương vị lôi cuốn (moodDescription) và gợi ý hoạt động sau đó.

PHẢI TRẢ VỀ JSON ARRAY.`;

      console.log("🤖 Gemini is filtering & storytelling...");

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: matchSchema,
        },
      });

      const suggestions: GeminiMatchResult[] = JSON.parse(response.text || "[]");
      return suggestions;
    } catch (error: any) {
      if (attempt === maxRetries) throw error;
    }
  }

  return [];
};
