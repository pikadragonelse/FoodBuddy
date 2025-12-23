import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = "gemini-2.5-flash-lite";

// ========================
// Types
// ========================
export interface ChatMetadata {
  type: "RECIPE" | "FIND_RESTAURANT" | "SUGGESTION" | "CHAT";
  dishName?: string;
  difficulty?: string;
  keyword?: string;
  reason?: string;
  suggestedTags?: string[]; // Smart Tags for quick replies
}

export interface ChatResponse {
  text: string;
  metadata?: ChatMetadata;
}

// ========================
// System Instruction
// ========================
const systemInstruction = `Bạn là một trợ lý ẩm thực (Culinary Assistant) tên là FoodBuddy, thân thiện, sành ăn, vui vẻ và am hiểu về các món ăn Việt Nam & thế giới.

TÍNH CÁCH:
- Nói chuyện như một người bạn thân, dễ thương, đôi khi hài hước
- Dùng emoji phù hợp để tạo không khí vui vẻ
- Trả lời ngắn gọn, súc tích nhưng đầy đủ thông tin

NHIỆM VỤ:
1. Hỗ trợ tìm quán ăn, gợi ý món ăn theo tâm trạng
2. Hướng dẫn nấu ăn, chia sẻ công thức
3. Trò chuyện vui vẻ về ẩm thực

QUY TẮC PHÂN LOẠI (Intent):
- RECIPE: Khi user hỏi cách nấu, công thức, nguyên liệu
- FIND_RESTAURANT: Khi user muốn tìm quán, đi ăn ở đâu
- SUGGESTION: Khi user cần gợi ý món (buồn, vui, đói...)
- CHAT: Trò chuyện thông thường, không liên quan đến món cụ thể

ĐỊNH DẠNG OUTPUT (BẮT BUỘC):
Mọi câu trả lời PHẢI kết thúc bằng một khối JSON trong thẻ <meta>...</meta>.

Cấu trúc JSON:
{
  "type": "RECIPE | FIND_RESTAURANT | SUGGESTION | CHAT",
  "dishName": "Tên món (nếu có)",
  "keyword": "Từ khóa tìm quán (nếu type là FIND_RESTAURANT)",
  "difficulty": "Dễ/Vừa/Khó (nếu type là RECIPE)",
  "reason": "Lý do gợi ý (nếu type là SUGGESTION)",
  "suggestedTags": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"]
}

QUAN TRỌNG - suggestedTags:
- Luôn phải có 3-4 gợi ý ngắn gọn (dưới 20 ký tự mỗi gợi ý)
- Gợi ý phải liên quan đến ngữ cảnh hội thoại
- Ví dụ nếu đang nói về Phở: ["Tìm quán phở", "Công thức phở", "Món khác?"]
- Ví dụ trò chuyện: ["Gợi ý món sáng", "Đang đói quá", "Học nấu ăn"]

VÍ DỤ:
User: "Tôi buồn quá"
Response: "Ôi không! Khi buồn thì không gì bằng một tô cháo nóng hổi... 🍲

<meta>{"type": "SUGGESTION", "dishName": "Cháo sườn", "reason": "Ấm bụng, dễ tiêu hóa", "suggestedTags": ["Tìm quán cháo", "Món khác", "Cách nấu cháo"]}</meta>"

User: "Cách nấu phở bò"
Response: "Phở bò là món quốc hồn quốc túy của Việt Nam! 🇻🇳 Đây là món có độ khó TRUNG BÌNH, cần khoảng 3-4 tiếng để nấu nước dùng chuẩn vị.

<meta>{"type": "RECIPE", "dishName": "Phở Bò", "difficulty": "Trung bình", "suggestedTags": ["Xem công thức", "Phở gà thì sao?", "Quán phở ngon"]}</meta>"`;

// ========================
// Helper: Clean Text Output
// ========================
const cleanTextOutput = (text: string): string => {
  // Remove meta tags
  let cleaned = text.replace(/<meta>.*?<\/meta>/gs, "").trim();

  // Remove markdown artifacts if any (like ** or __)
  cleaned = cleaned.replace(/\*\*/g, "");
  cleaned = cleaned.replace(/__/g, "");

  // Remove excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Remove code blocks if accidentally included
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");

  return cleaned.trim();
};

// ========================
// Send Message to Gemini
// ========================
export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = [],
): Promise<ChatResponse> => {
  if (!API_KEY) {
    throw new Error("Chưa cấu hình Gemini API Key");
  }

  try {
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...history,
        {
          role: "user",
          parts: [
            {
              text: `INSTRUCTIONS:\n${systemInstruction}\n\nUSER MESSAGE: ${message}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "text/plain",
      },
    });

    const responseText = result.text || "";

    // Parse metadata from <meta> tags
    const metaRegex = /<meta>(.*?)<\/meta>/s;
    const match = responseText.match(metaRegex);

    // Clean the text output
    const text = cleanTextOutput(responseText);
    let metadata: ChatMetadata | undefined;

    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        metadata = {
          type: parsed.type || "CHAT",
          dishName: parsed.dishName,
          difficulty: parsed.difficulty,
          keyword: parsed.keyword,
          reason: parsed.reason,
          suggestedTags: parsed.suggestedTags || [],
        };
      } catch (e) {
        console.error("Failed to parse metadata JSON", e);
        // Fallback với tags mặc định
        metadata = {
          type: "CHAT",
          suggestedTags: ["Gợi ý món ăn", "Tìm quán ngon", "Học nấu ăn"],
        };
      }
    } else {
      // Không tìm thấy meta, tạo default
      metadata = {
        type: "CHAT",
        suggestedTags: ["Gợi ý món ăn", "Tìm quán ngon", "Đang đói quá"],
      };
    }

    return { text, metadata };
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};
