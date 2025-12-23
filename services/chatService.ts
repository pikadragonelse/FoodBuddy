import { API_CONFIG } from "@/constants";
import type { ChatMetadata, ChatResponse } from "@/types";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = API_CONFIG.GEMINI_MODEL;

// Re-export types for backward compatibility
export type { ChatMetadata, ChatResponse };

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
  "dishName": "Tên món hoặc từ khóa",
  "isSpecificDish": true/false,
  "keyword": "Từ khóa tìm quán (nếu type là FIND_RESTAURANT)",
  "difficulty": "Dễ/Vừa/Khó (nếu type là RECIPE)",
  "reason": "Lý do gợi ý (nếu type là SUGGESTION)",
  "suggestedTags": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"]
}

QUAN TRỌNG - isSpecificDish:
- TRUE: Khi user nhắc đến MÓN CỤ THỂ có thể nấu được (VD: "Phở bò", "Cơm tấm", "Gà kho sả", "Bánh flan")
- FALSE: Khi user nhắc đến DANH MỤC, NHÓM MÓN, hoặc TỪ KHÓA CHUNG (VD: "Món Việt", "Đồ ăn tối", "Món nhậu", "Đồ ngọt", "Ăn gì hôm nay")
- Nếu không chắc chắn, đặt FALSE để user được xem danh sách lựa chọn

QUAN TRỌNG - suggestedTags:
- Luôn phải có 3-4 gợi ý ngắn gọn (dưới 20 ký tự mỗi gợi ý)
- Gợi ý phải liên quan đến ngữ cảnh hội thoại

VÍ DỤ 1 - Món cụ thể:
User: "Cách nấu phở bò"
Response: "Phở bò là món quốc hồn quốc túy! 🇻🇳 Đây là món có độ khó TRUNG BÌNH.

<meta>{"type": "RECIPE", "dishName": "Phở Bò", "isSpecificDish": true, "difficulty": "Trung bình", "suggestedTags": ["Xem công thức", "Phở gà?", "Quán phở ngon"]}</meta>"

VÍ DỤ 2 - Danh mục chung:
User: "Món Việt Nam có gì ngon?"
Response: "Ẩm thực Việt Nam đa dạng lắm! 🍜 Có phở, bún, cơm, bánh mì... Bạn thích loại nào?

<meta>{"type": "SUGGESTION", "dishName": "Món Việt Nam", "isSpecificDish": false, "reason": "User hỏi về danh mục chung", "suggestedTags": ["Xem danh sách", "Phở bò", "Bún chả", "Cơm tấm"]}</meta>"

VÍ DỤ 3 - Gợi ý món cụ thể:
User: "Tôi buồn quá"
Response: "Ôi không! Khi buồn thì không gì bằng một tô cháo nóng hổi... 🍲

<meta>{"type": "SUGGESTION", "dishName": "Cháo sườn", "isSpecificDish": true, "reason": "Ấm bụng, dễ tiêu hóa", "suggestedTags": ["Xem công thức", "Tìm quán cháo", "Món khác"]}</meta>"`;

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
          isSpecificDish: parsed.isSpecificDish ?? true, // Default true for backward compatibility
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
