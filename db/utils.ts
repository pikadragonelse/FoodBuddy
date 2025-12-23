import { eq } from 'drizzle-orm';
import { db, expoDb } from './client';
import { localRecipes, type InsertLocalRecipe } from './schema';

/**
 * Khởi tạo database và tạo bảng nếu chưa tồn tại
 * Gọi hàm này khi app khởi động (trong App.tsx hoặc _layout.tsx)
 */
export async function initDB(): Promise<void> {
  try {
    // Tạo bảng local_recipes nếu chưa tồn tại
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS local_recipes (
        slug TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        ai_data TEXT,
        last_fetched_at INTEGER NOT NULL
      );
    `);
    
    // Tạo bảng recipe_search_cache nếu chưa tồn tại
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS recipe_search_cache (
        normalized_query TEXT PRIMARY KEY NOT NULL,
        results_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    
    console.log('[DB] Database initialized successfully');
  } catch (error) {
    console.error('[DB] Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Interface cho recipe data từ Supabase
 * Bạn có thể thay đổi interface này phù hợp với data thực tế
 */
interface RecipeFromSupabase {
  slug: string;
  name: string;
  ai_data?: any; // JSON object từ Supabase
}

/**
 * Lưu recipe vào SQLite cache
 * @param recipe - Recipe data từ Supabase
 */
export async function cacheRecipe(recipe: RecipeFromSupabase): Promise<void> {
  try {
    const insertData: InsertLocalRecipe = {
      slug: recipe.slug,
      name: recipe.name,
      aiData: recipe.ai_data ? JSON.stringify(recipe.ai_data) : null,
      lastFetchedAt: new Date(),
    };

    // Upsert: Insert hoặc Update nếu đã tồn tại
    await db
      .insert(localRecipes)
      .values(insertData)
      .onConflictDoUpdate({
        target: localRecipes.slug,
        set: {
          name: insertData.name,
          aiData: insertData.aiData,
          lastFetchedAt: insertData.lastFetchedAt,
        },
      });

    console.log(`[DB] Recipe cached: ${recipe.slug}`);
  } catch (error) {
    console.error(`[DB] Failed to cache recipe ${recipe.slug}:`, error);
    throw error;
  }
}

/**
 * Lấy recipe từ SQLite cache
 * @param slug - Unique identifier của recipe
 * @returns Recipe data hoặc null nếu không tìm thấy
 */
export async function getCachedRecipe(slug: string): Promise<{
  slug: string;
  name: string;
  aiData: any;
  lastFetchedAt: Date;
} | null> {
  try {
    const results = await db
      .select()
      .from(localRecipes)
      .where(eq(localRecipes.slug, slug))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const recipe = results[0];
    
    return {
      slug: recipe.slug,
      name: recipe.name,
      aiData: recipe.aiData ? JSON.parse(recipe.aiData) : null,
      lastFetchedAt: recipe.lastFetchedAt,
    };
  } catch (error) {
    console.error(`[DB] Failed to get cached recipe ${slug}:`, error);
    throw error;
  }
}

/**
 * Xóa recipe khỏi cache
 * @param slug - Unique identifier của recipe
 */
export async function deleteCachedRecipe(slug: string): Promise<void> {
  try {
    await db.delete(localRecipes).where(eq(localRecipes.slug, slug));
    console.log(`[DB] Recipe deleted from cache: ${slug}`);
  } catch (error) {
    console.error(`[DB] Failed to delete cached recipe ${slug}:`, error);
    throw error;
  }
}

/**
 * Lấy tất cả recipes từ cache
 * @returns Danh sách tất cả cached recipes
 */
export async function getAllCachedRecipes(): Promise<Array<{
  slug: string;
  name: string;
  aiData: any;
  lastFetchedAt: Date;
}>> {
  try {
    const results = await db.select().from(localRecipes);
    
    return results.map((recipe) => ({
      slug: recipe.slug,
      name: recipe.name,
      aiData: recipe.aiData ? JSON.parse(recipe.aiData) : null,
      lastFetchedAt: recipe.lastFetchedAt,
    }));
  } catch (error) {
    console.error('[DB] Failed to get all cached recipes:', error);
    throw error;
  }
}

/**
 * Kiểm tra xem cache đã cũ chưa (cần refresh)
 * @param slug - Unique identifier của recipe
 * @param maxAgeMs - Thời gian tối đa (ms) trước khi cache được coi là cũ. Default: 1 giờ
 * @returns true nếu cache còn mới, false nếu đã cũ hoặc không tồn tại
 */
export async function isCacheValid(
  slug: string,
  maxAgeMs: number = 60 * 60 * 1000 // 1 hour default
): Promise<boolean> {
  try {
    const cached = await getCachedRecipe(slug);
    
    if (!cached) {
      return false;
    }
    
    const now = Date.now();
    const cacheAge = now - cached.lastFetchedAt.getTime();
    
    return cacheAge < maxAgeMs;
  } catch (error) {
    console.error(`[DB] Failed to check cache validity for ${slug}:`, error);
    return false;
  }
}

/**
 * Xóa tất cả cache (dùng khi cần reset)
 */
export async function clearAllCache(): Promise<void> {
  try {
    await db.delete(localRecipes);
    console.log('[DB] All cache cleared');
  } catch (error) {
    console.error('[DB] Failed to clear all cache:', error);
    throw error;
  }
}
