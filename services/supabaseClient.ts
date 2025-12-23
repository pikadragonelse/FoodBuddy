import { createClient } from '@supabase/supabase-js';

// ========================
// Environment Variables
// ========================
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// ========================
// Validation
// ========================
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ [Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// ========================
// Supabase Client
// ========================
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // Không cần auth cho public recipes
  },
});

// ========================
// Types for Supabase Tables
// ========================

/**
 * Type cho bảng `recipes` trên Supabase
 * Đây là schema của bảng cloud
 */
export interface SupabaseRecipe {
  slug: string;          // Primary Key
  name: string;          // Tên món ăn
  ai_data: any;          // JSON object chứa RecipeDetails
  created_at?: string;   // Timestamp tạo
  updated_at?: string;   // Timestamp cập nhật
}

// Export URL để debug nếu cần
export { SUPABASE_URL };
