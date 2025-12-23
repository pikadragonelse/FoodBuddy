import { GoogleGenAI, Type } from "@google/genai";

// ========================
// Configuration
// ========================
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = "gemini-2.5-flash-lite";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ========================
// Types
// ========================
export interface GeminiDishSuggestion {
  dishName: string; // Tên món
  searchQuery: string; // Từ khóa chính xác để tìm quán (VD: "Phở Hòa Pasteur")
  imageKeyword: string; // Từ khóa tiếng Anh mô tả món ăn (để tìm ảnh)
  moodDescription: string; // Mô tả hương vị 'storytelling' (1-2 câu)
  suggestedActivity: string; // Hoạt động sau khi ăn
}

// Schema cho structured output
const dishSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      dishName: {
        type: Type.STRING,
        description: "Tên món ăn hấp dẫn",
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
      moodDescription: {
        type: Type.STRING,
        description:
          "Mô tả hương vị kể chuyện, cảm xúc, hợp mood user, không review khô khan. 1-2 câu.",
      },
      suggestedActivity: {
        type: Type.STRING,
        description: "Gợi ý hoạt động thú vị sau khi ăn gần đó (1 câu).",
      },
    },
    required: [
      "dishName",
      "searchQuery",
      "imageKeyword",
      "moodDescription",
      "suggestedActivity",
    ],
  },
};

// ========================
// Fetch Gemini Suggestions
// ========================
export const fetchGeminiSuggestions = async (
  moodOrCravings: string,
  userCoords?: { lat: number; lng: number },
  maxRetries: number = 2,
): Promise<GeminiDishSuggestion[]> => {
  if (!API_KEY) {
    console.error("❌ Missing Gemini API Key");
    throw new Error("Chưa cấu hình Gemini API Key");
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(
          `⏳ Retry ${attempt}/${maxRetries} - Waiting ${waitTime / 1000}s...`,
        );
        await delay(waitTime);
      }

      const coordsInfo = userCoords
        ? `\nTọa độ GPS hiện tại của user: ${userCoords.lat.toFixed(6)}, ${userCoords.lng.toFixed(6)} (TP.HCM)`
        : "";

      const prompt = `Bạn là một "Food Soulmate" thấu hiểu tâm trạng và sành ăn tại TP.HCM.
User đang có mood/nhu cầu: "${moodOrCravings}".
${coordsInfo}

NHIỆM VỤ: Gợi ý 5 món ăn cụ thể kèm quán ăn THẬT, NỔI TIẾNG, ĐANG HOẠT ĐỘNG tại TP.HCM.

YÊU CẦU OUTPUT (JSON Array):
1. dishName: Tên món (ngắn gọn).
2. searchQuery: Tên quán cụ thể + tên đường/quận để tìm trên bản đồ. PHẢI LÀ QUÁN CÓ THẬT.
   - Tốt: "Phở Hòa Pasteur", "Bún Đậu Homemade Hồng Hà"
   - Tránh: "Phở ngon quận 1", "Quán bún bò" (chung chung)
3. imageKeyword: Từ khóa tiếng Anh để tìm ảnh món này (VD: "vietnamese crab noodle soup").
4. moodDescription: 1-2 câu văn "chill", "deep" hoặc "vui vẻ" tùy theo mood của user. Miêu tả hương vị bay bổng, kích thích vị giác. Đừng viết kiểu review máy móc.
5. suggestedActivity: Một hoạt động chill chill sau khi ăn xong (VD: đi cafe, dạo công viên, xem phim...) phù hợp khu vực đó.

LƯU Ý:
- Chỉ gợi ý quán ở TP.HCM.
- Ưu tiên quán gần tọa độ user (nếu có).
- Trả về đúng format JSON.
`;

      console.log("🤖 Asking Gemini for food suggestions...");

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: dishSchema,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Gemini returned empty text");

      const suggestions: GeminiDishSuggestion[] = JSON.parse(text);
      console.log(
        "💡 [GEMINI SUGGESTIONS]:",
        suggestions.map((s) => s.dishName),
      );

      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error("Invalid suggestions format");
      }

      return suggestions;
    } catch (error: any) {
      console.error("❌ Gemini Error:", error.message);

      const isRateLimit =
        error.status === 429 || error.message?.includes("quota");
      if (isRateLimit && attempt < maxRetries) continue;

      if (attempt === maxRetries) throw error;
    }
  }

  return [];
};
