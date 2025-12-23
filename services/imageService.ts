import AsyncStorage from '@react-native-async-storage/async-storage';

// ========================
// Configuration
// ========================
const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

// Cache Configuration
const CACHE_PREFIX = 'unsplash_cache_';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_SIZE = 200; // Maximum number of cached items

// ========================
// Types
// ========================
interface CacheEntry {
  url: string;
  timestamp: number;
  keyword: string;
}

// ========================
// In-Memory Cache (Layer 1 - Fast access)
// ========================
const memoryCache = new Map<string, CacheEntry>();

// ========================
// Cache Utilities
// ========================

/**
 * Normalize keyword for consistent cache keys
 */
const normalizeKeyword = (keyword: string): string => {
  return keyword.toLowerCase().trim().replace(/\s+/g, '_');
};

/**
 * Get cache key for a keyword
 */
const getCacheKey = (keyword: string): string => {
  return `${CACHE_PREFIX}${normalizeKeyword(keyword)}`;
};

/**
 * Check if cache entry is still valid (not expired)
 */
const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
};

/**
 * Get from memory cache (Layer 1)
 */
const getFromMemoryCache = (keyword: string): string | null => {
  const normalizedKey = normalizeKeyword(keyword);
  const entry = memoryCache.get(normalizedKey);
  
  if (entry && isCacheValid(entry)) {
    console.log(`⚡ Memory cache HIT for: "${keyword}"`);
    return entry.url;
  }
  
  // Remove expired entry
  if (entry) {
    memoryCache.delete(normalizedKey);
  }
  
  return null;
};

/**
 * Get from AsyncStorage cache (Layer 2)
 */
const getFromStorageCache = async (keyword: string): Promise<string | null> => {
  try {
    const cacheKey = getCacheKey(keyword);
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (cached) {
      const entry: CacheEntry = JSON.parse(cached);
      
      if (isCacheValid(entry)) {
        console.log(`💾 Storage cache HIT for: "${keyword}"`);
        // Populate memory cache for faster subsequent access
        memoryCache.set(normalizeKeyword(keyword), entry);
        return entry.url;
      } else {
        // Remove expired entry
        await AsyncStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.warn('⚠️ Storage cache read error:', error);
  }
  
  return null;
};

/**
 * Save to both cache layers
 */
const saveToCache = async (keyword: string, url: string): Promise<void> => {
  const entry: CacheEntry = {
    url,
    timestamp: Date.now(),
    keyword: normalizeKeyword(keyword),
  };
  
  // Save to memory cache
  memoryCache.set(normalizeKeyword(keyword), entry);
  
  // Save to AsyncStorage
  try {
    const cacheKey = getCacheKey(keyword);
    await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    console.log(`💾 Cached image for: "${keyword}"`);
  } catch (error) {
    console.warn('⚠️ Storage cache write error:', error);
  }
};

/**
 * Clean up expired cache entries (call periodically)
 */
export const cleanupImageCache = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key: string) => key.startsWith(CACHE_PREFIX));
    
    let removedCount = 0;
    
    for (const key of cacheKeys) {
      try {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          if (!isCacheValid(entry)) {
            await AsyncStorage.removeItem(key);
            removedCount++;
          }
        }
      } catch {
        // Remove corrupted entry
        await AsyncStorage.removeItem(key);
        removedCount++;
      }
    }
    
    // Also check if cache size exceeds limit
    const remainingKeys = cacheKeys.length - removedCount;
    if (remainingKeys > MAX_CACHE_SIZE) {
      // Get all remaining entries with timestamps
      const entries: { key: string; timestamp: number }[] = [];
      
      for (const key of cacheKeys) {
        try {
          const cached = await AsyncStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry = JSON.parse(cached);
            entries.push({ key, timestamp: entry.timestamp });
          }
        } catch {
          // Skip corrupted entries
        }
      }
      
      // Sort by timestamp (oldest first) and remove oldest entries
      entries.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = entries.slice(0, remainingKeys - MAX_CACHE_SIZE);
      
      for (const { key } of toRemove) {
        await AsyncStorage.removeItem(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired cache entries`);
    }
    
    // Also clean memory cache
    for (const [key, entry] of memoryCache.entries()) {
      if (!isCacheValid(entry)) {
        memoryCache.delete(key);
      }
    }
  } catch (error) {
    console.warn('⚠️ Cache cleanup error:', error);
  }
};

/**
 * Clear all image cache
 */
export const clearImageCache = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key: string) => key.startsWith(CACHE_PREFIX));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
    
    memoryCache.clear();
    console.log(`🗑️ Cleared ${cacheKeys.length} cached images`);
  } catch (error) {
    console.warn('⚠️ Cache clear error:', error);
  }
};

/**
 * Get cache statistics
 */
export const getImageCacheStats = async (): Promise<{
  memoryCount: number;
  storageCount: number;
  totalSizeEstimate: string;
}> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key: string) => key.startsWith(CACHE_PREFIX));
    
    // Estimate size (rough estimate: ~200 bytes per entry)
    const estimatedBytes = cacheKeys.length * 200;
    const sizeStr = estimatedBytes < 1024 
      ? `${estimatedBytes} B`
      : `${(estimatedBytes / 1024).toFixed(1)} KB`;
    
    return {
      memoryCount: memoryCache.size,
      storageCount: cacheKeys.length,
      totalSizeEstimate: sizeStr,
    };
  } catch {
    return {
      memoryCount: memoryCache.size,
      storageCount: 0,
      totalSizeEstimate: 'N/A',
    };
  }
};

// ========================
// Main Function: Get Unsplash Image (with Cache)
// ========================
export const getUnsplashImage = async (keyword: string): Promise<string> => {
  try {
    // 1. Check Memory Cache (Layer 1 - fastest)
    const memoryCached = getFromMemoryCache(keyword);
    if (memoryCached) {
      return memoryCached;
    }
    
    // 2. Check AsyncStorage Cache (Layer 2)
    const storageCached = await getFromStorageCache(keyword);
    if (storageCached) {
      return storageCached;
    }
    
    // 3. Cache MISS - Fetch from Unsplash API
    if (UNSPLASH_ACCESS_KEY) {
      console.log(`📸 Fetching Unsplash image for: "${keyword}"`);
      const response = await fetch(
        `${UNSPLASH_API_URL}?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`, 
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const imageUrl = data.results[0].urls.regular;
          console.log(`✅ Unsplash Image Found: ${imageUrl}`);
          
          // Save to cache for future use
          await saveToCache(keyword, imageUrl);
          
          return imageUrl;
        }
      } else {
        console.warn(`⚠️ Unsplash API Error: ${response.status}`);
      }
    }

    // 4. Fallback: Use LoremFlickr (No Key needed)
    console.log(`⚠️ Using LoremFlickr fallback for: "${keyword}"`);
    const fallbackUrl = `https://loremflickr.com/800/600/${encodeURIComponent(keyword)}/food`;
    
    // Also cache fallback URLs
    await saveToCache(keyword, fallbackUrl);
    
    return fallbackUrl;

  } catch (error) {
    console.error('❌ Image Service Error:', error);
    // Ultimate fallback (don't cache error fallback)
    return 'https://loremflickr.com/800/600/food';
  }
};

// ========================
// Batch Fetch with Cache (Optimized for multiple images)
// ========================
export const getUnsplashImages = async (keywords: string[]): Promise<Map<string, string>> => {
  const results = new Map<string, string>();
  const uncachedKeywords: string[] = [];
  
  // First, check cache for all keywords
  for (const keyword of keywords) {
    const memoryCached = getFromMemoryCache(keyword);
    if (memoryCached) {
      results.set(keyword, memoryCached);
      continue;
    }
    
    const storageCached = await getFromStorageCache(keyword);
    if (storageCached) {
      results.set(keyword, storageCached);
      continue;
    }
    
    uncachedKeywords.push(keyword);
  }
  
  // Fetch uncached images in parallel (with concurrency limit)
  const CONCURRENCY = 3;
  for (let i = 0; i < uncachedKeywords.length; i += CONCURRENCY) {
    const batch = uncachedKeywords.slice(i, i + CONCURRENCY);
    const promises = batch.map(async (keyword) => {
      const url = await getUnsplashImage(keyword);
      results.set(keyword, url);
    });
    await Promise.all(promises);
  }
  
  return results;
};

// Run cleanup on module load (debounced to not affect startup)
setTimeout(() => {
  cleanupImageCache();
}, 5000);
