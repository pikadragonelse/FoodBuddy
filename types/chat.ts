// ========================
// Chat Types
// ========================

/** Loại intent trong chat */
export type ChatIntentType = "RECIPE" | "FIND_RESTAURANT" | "SUGGESTION" | "CHAT";

/** Metadata từ Gemini response */
export interface ChatMetadata {
  type: ChatIntentType;
  dishName?: string;
  isSpecificDish?: boolean;
  difficulty?: string;
  keyword?: string;
  reason?: string;
  suggestedTags?: string[];
}

/** Response từ chat service */
export interface ChatResponse {
  text: string;
  metadata?: ChatMetadata;
}

/** Message trong chat history */
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  createdAt: Date;
  metadata?: ChatMetadata;
}
