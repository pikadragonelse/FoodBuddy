import { API_CONFIG, CACHE_CONFIG } from "@/constants";
import type { RecipePreview, SearchOptions, SearchSource } from "@/types";
import { GoogleGenAI, Type } from '@google/genai';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { recipeSearchCache, type InsertRecipeSearchCache } from '../db/schema';
import { getUnsplashImage } from './imageService';

// Re-export types for backward compatibility
export type { RecipePreview, SearchOptions, SearchSource };

// ========================
// Configuration
// ========================
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = API_CONFIG.GEMINI_MODEL;

/** Cache TTL từ config */
const CACHE_TTL_MS = CACHE_CONFIG.RECIPE_SEARCH_TTL_MS;

/** Kết quả tìm kiếm từ Gemini (chưa có imageUrl) - internal type */
interface GeminiRecipeResult {
  dishName: string;
  englishName: string;
  description: string;
  difficulty: string;
  cookTime: string;
}

// ========================
// Helper: Normalize Query
// ========================
/**
 * Chuẩn hóa từ khóa tìm kiếm
 * VD: "  Thịt Heo  " -> "thịt heo"
 */
function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

// ========================
// Private: Fetch from Gemini API
// ========================
async function fetchRecipesFromGemini(query: string): Promise<GeminiRecipeResult[]> {
  if (!API_KEY) {
    throw new Error('Chưa cấu hình Gemini API Key');
  }

  console.log(`🤖 [Search API] Fetching recipes for: "${query}"`);

  const prompt = `Gợi ý 6 món ăn liên quan đến từ khóa: "${query}".
Trả về JSON array với format:
[{ "dishName": "Tên món", "englishName": "English name for image", "description": "Mô tả ngắn", "difficulty": "Dễ/Vừa/Khó", "cookTime": "30 phút" }]`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            dishName: { type: Type.STRING },
            englishName: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            cookTime: { type: Type.STRING },
          },
          required: ['dishName', 'englishName', 'description', 'difficulty', 'cookTime'],
        },
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  const results: GeminiRecipeResult[] = JSON.parse(text);
  console.log(`✅ [Search API] Found ${results.length} recipes`);

  return results;
}

// ========================
// Private: Add Images to Results
// ========================
async function addImagesToResults(
  results: GeminiRecipeResult[],
  prefix: string = 'search'
): Promise<RecipePreview[]> {
  return Promise.all(
    results.map(async (recipe, index) => {
      const imageUrl = await getUnsplashImage(recipe.englishName);
      return {
        ...recipe,
        id: `${prefix}-${index}`,
        imageUrl,
      };
    })
  );
}

// ========================
// Private: Get from Cache
// ========================
async function getFromCache(normalizedQuery: string): Promise<RecipePreview[] | null> {
  try {
    const results = await db
      .select()
      .from(recipeSearchCache)
      .where(eq(recipeSearchCache.normalizedQuery, normalizedQuery))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const record = results[0];
    const cacheAge = Date.now() - record.updatedAt.getTime();

    // Kiểm tra TTL
    if (cacheAge > CACHE_TTL_MS) {
      console.log(`⏰ [Search Cache] Cache expired for: "${normalizedQuery}"`);
      return null;
    }

    console.log(`✅ [Search Cache] Cache hit for: "${normalizedQuery}"`);
    return JSON.parse(record.resultsJson) as RecipePreview[];
  } catch (error) {
    console.error('[Search Cache] Error reading cache:', error);
    return null;
  }
}

// ========================
// Private: Save to Cache
// ========================
async function saveToCache(
  normalizedQuery: string,
  results: RecipePreview[]
): Promise<void> {
  try {
    const insertData: InsertRecipeSearchCache = {
      normalizedQuery,
      resultsJson: JSON.stringify(results),
      updatedAt: new Date(),
    };

    // Upsert: Insert hoặc Update nếu đã tồn tại
    await db
      .insert(recipeSearchCache)
      .values(insertData)
      .onConflictDoUpdate({
        target: recipeSearchCache.normalizedQuery,
        set: {
          resultsJson: insertData.resultsJson,
          updatedAt: insertData.updatedAt,
        },
      });

    console.log(`💾 [Search Cache] Saved cache for: "${normalizedQuery}"`);
  } catch (error) {
    console.error('[Search Cache] Error saving cache:', error);
    // Không throw - vẫn có thể dùng kết quả từ API
  }
}

// ========================
// Main: Get Recipe Search Results
// ========================
/**
 * Lấy kết quả tìm kiếm công thức theo logic Cache-First:
 * 
 * 1. **Check Cache** - Siêu nhanh, ~1-5ms
 * 2. **Validate TTL** - Nếu < 3 ngày thì dùng cache
 * 3. **Fetch from API** - Nếu không có cache hoặc đã hết hạn
 * 4. **Save to Cache** - Lưu kết quả mới
 * 
 * @param query - Từ khóa tìm kiếm
 * @param options - Options bao gồm callback và forceRefresh
 * @returns RecipePreview[]
 */
export async function getRecipeSearchResults(
  query: string,
  options?: SearchOptions
): Promise<RecipePreview[]> {
  const { onSourceChange, forceRefresh = false } = options || {};
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  console.log(`🔍 [Search] Query: "${query}" -> Normalized: "${normalizedQuery}"`);

  // ========================
  // STEP 1: Check Local Cache
  // ========================
  if (!forceRefresh) {
    const cached = await getFromCache(normalizedQuery);
    
    if (cached && cached.length > 0) {
      onSourceChange?.('cache');
      return cached;
    }
  }

  // ========================
  // STEP 2: Fetch from Gemini API
  // ========================
  onSourceChange?.('api');
  
  const geminiResults = await fetchRecipesFromGemini(query);
  
  // ========================
  // STEP 3: Add Images
  // ========================
  const resultsWithImages = await addImagesToResults(geminiResults);

  // ========================
  // STEP 4: Save to Cache (Background)
  // ========================
  // Lưu cache trong background, không await để không block UI
  saveToCache(normalizedQuery, resultsWithImages).catch((err) => {
    console.warn('[Search Cache] Background save failed:', err);
  });

  return resultsWithImages;
}

// ========================
// Additional Utilities
// ========================

/**
 * Xóa cache tìm kiếm cũ (có thể gọi định kỳ để dọn dẹp)
 */
export async function clearExpiredSearchCache(): Promise<void> {
  try {
    const allRecords = await db.select().from(recipeSearchCache);
    const now = Date.now();
    
    for (const record of allRecords) {
      const cacheAge = now - record.updatedAt.getTime();
      if (cacheAge > CACHE_TTL_MS) {
        await db
          .delete(recipeSearchCache)
          .where(eq(recipeSearchCache.normalizedQuery, record.normalizedQuery));
        console.log(`🗑️ [Search Cache] Deleted expired: "${record.normalizedQuery}"`);
      }
    }
  } catch (error) {
    console.error('[Search Cache] Error clearing expired cache:', error);
  }
}

/**
 * Xóa toàn bộ cache tìm kiếm
 */
export async function clearAllSearchCache(): Promise<void> {
  try {
    await db.delete(recipeSearchCache);
    console.log('[Search Cache] All search cache cleared');
  } catch (error) {
    console.error('[Search Cache] Error clearing all cache:', error);
    throw error;
  }
}
