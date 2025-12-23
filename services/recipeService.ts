import { GoogleGenAI, Type } from "@google/genai";
import { cacheRecipe, getCachedRecipe, isCacheValid } from "../db/utils";
import { getUnsplashImage } from "./imageService";
import { supabase, type SupabaseRecipe } from "./supabaseClient";

// ========================
// Configuration
// ========================
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = "gemini-2.5-flash-lite";

/** Thời gian cache tối đa (1 giờ) */
const CACHE_MAX_AGE_MS = 60 * 60 * 1000;

// ========================
// Types
// ========================
export interface IngredientItem {
  item: string;
  amount: string;
  note?: string;
}

export interface StepTimer {
  hasTimer: boolean;
  durationSeconds: number;
  label: string;
}

export interface StepItem {
  stepIndex: number;
  instruction: string;
  timer: StepTimer;
  isCritical: boolean;
}

export interface RecipeMeta {
  prepTime: string;
  cookTime: string;
  difficulty: string;
  calories: string;
  servings: string;
}

export interface RecipeDetails {
  dishName: string;
  englishName: string;
  description: string;
  meta: RecipeMeta;
  ingredients: IngredientItem[];
  steps: StepItem[];
  tips: string;
  imageUrl?: string;
}

/** Nguồn dữ liệu để UI hiển thị loading phù hợp */
export type RecipeSource = 'local' | 'cloud' | 'ai';

/** Options cho fetchRecipeDetails */
export interface FetchRecipeOptions {
  /** Callback để báo nguồn dữ liệu đang được sử dụng */
  onSourceChange?: (source: RecipeSource) => void;
  /** Bỏ qua cache, lấy mới từ cloud/AI */
  forceRefresh?: boolean;
}

// ========================
// Helper: Generate Slug
// ========================
/**
 * Chuẩn hóa tên món ăn thành slug
 * VD: "Phở Bò Tái" -> "pho-bo-tai"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '') // Chỉ giữ alphanumeric, space, hyphen
    .trim()
    .replace(/\s+/g, '-') // Thay space bằng hyphen
    .replace(/-+/g, '-'); // Loại bỏ multiple hyphens
}

// ========================
// JSON Schema for Gemini
// ========================
const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    dishName: {
      type: Type.STRING,
      description: "Tên món ăn bằng Tiếng Việt",
    },
    englishName: {
      type: Type.STRING,
      description: "Tên món bằng tiếng Anh để tìm ảnh (VD: Vietnamese Pho)",
    },
    description: {
      type: Type.STRING,
      description: "Mô tả ngắn gọn hấp dẫn về hương vị món ăn (2 dòng)",
    },
    meta: {
      type: Type.OBJECT,
      properties: {
        prepTime: {
          type: Type.STRING,
          description: "Thời gian chuẩn bị (VD: 15 phút)",
        },
        cookTime: {
          type: Type.STRING,
          description: "Thời gian nấu (VD: 30 phút)",
        },
        difficulty: {
          type: Type.STRING,
          description: "Độ khó: Dễ / Vừa / Khó",
        },
        calories: {
          type: Type.STRING,
          description: "Lượng calo (VD: 450 kcal)",
        },
        servings: {
          type: Type.STRING,
          description: "Khẩu phần ăn (VD: 2 người)",
        },
      },
      required: ["prepTime", "cookTime", "difficulty", "calories", "servings"],
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: "Tên nguyên liệu" },
          amount: {
            type: Type.STRING,
            description: "Số lượng (VD: 500g, 2 muỗng canh)",
          },
          note: {
            type: Type.STRING,
            description: "Ghi chú thêm (VD: Thái lát mỏng)",
          },
        },
        required: ["item", "amount"],
      },
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepIndex: {
            type: Type.NUMBER,
            description: "Số thứ tự bước (1, 2, 3...)",
          },
          instruction: {
            type: Type.STRING,
            description: "Hướng dẫn chi tiết cho bước này",
          },
          timer: {
            type: Type.OBJECT,
            properties: {
              hasTimer: {
                type: Type.BOOLEAN,
                description: "true nếu bước có thời gian cụ thể cần đếm",
              },
              durationSeconds: {
                type: Type.NUMBER,
                description: "Số giây cần thực hiện (VD: 10 phút = 600)",
              },
              label: {
                type: Type.STRING,
                description: "Nhãn cho timer (VD: Luộc mì, Xào thịt)",
              },
            },
            required: ["hasTimer", "durationSeconds", "label"],
          },
          isCritical: {
            type: Type.BOOLEAN,
            description: "true nếu bước dễ sai, cần chú ý đặc biệt",
          },
        },
        required: ["stepIndex", "instruction", "timer", "isCritical"],
      },
    },
    tips: {
      type: Type.STRING,
      description: "Mẹo nhỏ từ đầu bếp để món ngon hơn",
    },
  },
  required: [
    "dishName",
    "englishName",
    "description",
    "meta",
    "ingredients",
    "steps",
    "tips",
  ],
};

// ========================
// Private: Generate Recipe from Gemini
// ========================
async function generateRecipeFromAI(dishName: string): Promise<RecipeDetails> {
  if (!API_KEY) {
    throw new Error("Chưa cấu hình Gemini API Key");
  }

  console.log(`🤖 [AI] Generating recipe for: "${dishName}"`);

  const prompt = `Bạn là một đầu bếp chuyên nghiệp đang hướng dẫn nấu ăn tại nhà cho người mới.

NHIỆM VỤ: Tạo công thức nấu ăn CHI TIẾT cho món: "${dishName}".

YÊU CẦU ĐẶC BIỆT CHO CÁC BƯỚC (steps):
1. Mỗi bước phải RÕ RÀNG, DỄ HIỂU, TỪNG BƯỚC MỘT.
2. Nếu bước có thời gian cụ thể (VD: "luộc 10 phút", "xào 5 phút", "ướp 30 phút"):
   - Đặt timer.hasTimer = true
   - Tính durationSeconds chính xác (10 phút = 600, 5 phút = 300...)
   - Đặt label mô tả ngắn (VD: "Luộc mì", "Xào thịt")
3. Nếu bước QUAN TRỌNG/DỄ SAI (VD: "đừng để lửa quá to", "canh không bị cháy"):
   - Đặt isCritical = true
4. Nếu bước không có timer: hasTimer = false, durationSeconds = 0, label = ""

VÍ DỤ BƯỚC CÓ TIMER:
{
  "stepIndex": 3,
  "instruction": "Luộc mì trong nước sôi khoảng 8-10 phút cho đến khi mềm.",
  "timer": { "hasTimer": true, "durationSeconds": 540, "label": "Luộc mì" },
  "isCritical": false
}

VÍ DỤ BƯỚC CRITICAL:
{
  "stepIndex": 5,
  "instruction": "Xào thịt trên lửa lớn. CHÚ Ý: Đảo liên tục để thịt không bị cháy!",
  "timer": { "hasTimer": true, "durationSeconds": 180, "label": "Xào thịt" },
  "isCritical": true
}

Trả về công thức theo đúng format JSON được yêu cầu.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  const recipe: RecipeDetails = JSON.parse(text);
  console.log(
    `✅ [AI] Recipe generated: ${recipe.dishName} with ${recipe.steps.length} steps`,
  );

  // Fetch image from Unsplash
  const imageUrl = await getUnsplashImage(recipe.englishName || dishName);
  recipe.imageUrl = imageUrl;

  return recipe;
}

// ========================
// Private: Save to Local Cache
// ========================
async function saveToLocalCache(
  slug: string,
  name: string,
  aiData: RecipeDetails,
): Promise<void> {
  try {
    await cacheRecipe({
      slug,
      name,
      ai_data: aiData,
    });
    console.log(`💾 [Local] Recipe cached: ${slug}`);
  } catch (error) {
    console.warn(`⚠️ [Local] Failed to cache recipe:`, error);
    // Không throw - recipe vẫn có thể dùng được
  }
}

// ========================
// Private: Save to Supabase (Cloud)
// ========================
async function saveToCloud(
  slug: string,
  name: string,
  aiData: RecipeDetails,
): Promise<void> {
  try {
    const newRecord: SupabaseRecipe = {
      slug,
      name,
      ai_data: aiData,
    };

    const { error } = await supabase
      .from('recipes')
      .upsert(newRecord, { onConflict: 'slug' });

    if (error) {
      console.warn(`⚠️ [Cloud] Failed to save recipe:`, error);
    } else {
      console.log(`☁️ [Cloud] Recipe saved: ${slug}`);
    }
  } catch (error) {
    console.warn(`⚠️ [Cloud] Error saving to cloud:`, error);
    // Không throw - recipe vẫn có thể dùng được
  }
}

// ========================
// Main: Fetch Recipe Details (Cache-First Strategy)
// ========================
/**
 * Lấy công thức nấu ăn theo logic Cache-First:
 * 
 * 1. **Local Cache (SQLite)** - Siêu nhanh, ~1-5ms
 * 2. **Cloud Cache (Supabase)** - Nhanh, ~100-500ms
 * 3. **AI Generation (Gemini)** - Chậm, ~2-5s
 * 
 * @param dishName - Tên món ăn (VD: "Phở Bò Tái")
 * @param options - Options bao gồm callback và forceRefresh
 * @returns RecipeDetails
 */
export const fetchRecipeDetails = async (
  dishName: string,
  options?: FetchRecipeOptions,
): Promise<RecipeDetails> => {
  const { onSourceChange, forceRefresh = false } = options || {};
  const slug = generateSlug(dishName);
  
  console.log(`📚 [Recipe] Fetching: "${dishName}" (slug: ${slug})`);

  // ========================
  // STEP 1: Local Cache (SQLite via Drizzle) - Siêu nhanh
  // ========================
  if (!forceRefresh) {
    try {
      const cacheValid = await isCacheValid(slug, CACHE_MAX_AGE_MS);
      
      if (cacheValid) {
        const cached = await getCachedRecipe(slug);
        if (cached && cached.aiData) {
          console.log(`✅ [Local Cache Hit] Recipe found in SQLite: ${slug}`);
          onSourceChange?.('local');
          return cached.aiData as RecipeDetails;
        }
      }
    } catch (error) {
      console.warn(`⚠️ [Local] Cache read error, continuing to cloud:`, error);
    }
  }

  // ========================
  // STEP 2: Cloud Cache (Supabase) - Nhanh
  // ========================
  if (!forceRefresh) {
    try {
      console.log(`☁️ [Cloud] Checking Supabase for: ${slug}`);
      onSourceChange?.('cloud');
      
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn(`⚠️ [Cloud] Query error:`, error);
      }

      if (data && data.ai_data) {
        console.log(`✅ [Cloud Cache Hit] Recipe found in Supabase: ${slug}`);
        
        // Lưu vào Local Cache để lần sau dùng
        await saveToLocalCache(slug, data.name, data.ai_data);
        
        return data.ai_data as RecipeDetails;
      }
    } catch (error) {
      console.warn(`⚠️ [Cloud] Connection error, falling back to AI:`, error);
    }
  }

  // ========================
  // STEP 3: AI Generation (Gemini) - Chậm nhất
  // ========================
  console.log(`🤖 [AI] No cache found, generating new recipe...`);
  onSourceChange?.('ai');
  
  const recipe = await generateRecipeFromAI(dishName);
  
  // ========================
  // STEP 4: Parallel Save (Lưu song song vào cả 2 nơi)
  // ========================
  console.log(`💾 [Save] Saving recipe to both Local and Cloud...`);
  
  // Lưu song song để tiết kiệm thời gian
  await Promise.all([
    saveToLocalCache(slug, recipe.dishName, recipe),
    saveToCloud(slug, recipe.dishName, recipe),
  ]);

  return recipe;
};
