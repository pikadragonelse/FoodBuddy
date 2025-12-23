import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Schema cho bảng local_recipes
 * Dùng để cache dữ liệu từ Supabase về SQLite local
 * 
 * Cấu trúc:
 * - slug: Primary Key, unique identifier cho recipe
 * - name: Tên món ăn
 * - aiData: JSON stringify của ai_data từ Supabase (vì SQLite không có kiểu JSON native)
 * - lastFetchedAt: Timestamp (integer) để biết khi nào cần update lại cache
 */
export const localRecipes = sqliteTable('local_recipes', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  aiData: text('ai_data'), // JSON stringify, parse khi lấy ra
  lastFetchedAt: integer('last_fetched_at', { mode: 'timestamp_ms' }).notNull(),
});

// Type definitions for TypeScript
export type LocalRecipe = typeof localRecipes.$inferSelect;
export type InsertLocalRecipe = typeof localRecipes.$inferInsert;

/**
 * Schema cho bảng recipe_search_cache
 * Dùng để cache kết quả tìm kiếm công thức từ Gemini
 * 
 * Cấu trúc:
 * - normalizedQuery: Primary Key, từ khóa đã chuẩn hóa (lowercase, trim)
 * - resultsJson: JSON stringify của mảng kết quả search
 * - updatedAt: Timestamp để tính TTL (Time To Live)
 */
export const recipeSearchCache = sqliteTable('recipe_search_cache', {
  normalizedQuery: text('normalized_query').primaryKey(),
  resultsJson: text('results_json').notNull(), // JSON stringify của RecipePreview[]
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

// Type definitions for TypeScript
export type RecipeSearchCacheRecord = typeof recipeSearchCache.$inferSelect;
export type InsertRecipeSearchCache = typeof recipeSearchCache.$inferInsert;
