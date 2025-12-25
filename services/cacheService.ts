import AsyncStorage from '@react-native-async-storage/async-storage';
import { SmartFoodSuggestion } from './foodService';

const CACHE_PREFIX = 'food_buddy_cache_';
const CACHE_EXPIRY = 1000 * 60 * 60 * 4; // 4 hours

interface CacheItem {
    timestamp: number;
    data: SmartFoodSuggestion[];
}

/**
 * Generates a cache key based on location and scenario tags
 */
const getCacheKey = (location: string, tags: string[]): string => {
    // Normalize location (e.g., just the district/city part to increase cache hits)
    const normalizedLoc = location.toLowerCase().replace(/\s/g, '');
    const sortedTags = [...tags].sort().join('_').toLowerCase();
    return `${CACHE_PREFIX}${normalizedLoc}_${sortedTags}`;
};

/**
 * Saves suggestions to local cache
 */
export const saveToCache = async (
    location: string,
    tags: string[],
    suggestions: SmartFoodSuggestion[]
): Promise<void> => {
    try {
        const key = getCacheKey(location, tags);
        const item: CacheItem = {
            timestamp: Date.now(),
            data: suggestions,
        };
        await AsyncStorage.setItem(key, JSON.stringify(item));
        console.log(`💾 [CACHE] Saved results for: ${key}`);
    } catch (error) {
        console.warn('⚠️ [CACHE] Failed to save:', error);
    }
};

/**
 * Retrieves suggestions from cache if not expired
 */
export const getFromCache = async (
    location: string,
    tags: string[]
): Promise<SmartFoodSuggestion[] | null> => {
    try {
        const key = getCacheKey(location, tags);
        const rawData = await AsyncStorage.getItem(key);

        if (!rawData) return null;

        const item: CacheItem = JSON.parse(rawData);
        const isExpired = Date.now() - item.timestamp > CACHE_EXPIRY;

        if (isExpired) {
            console.log(`🧹 [CACHE] Expired for: ${key}`);
            await AsyncStorage.removeItem(key);
            return null;
        }

        console.log(`✨ [CACHE] Hit for: ${key}`);
        return item.data;
    } catch (error) {
        console.warn('⚠️ [CACHE] Failed to read:', error);
        return null;
    }
};

/**
 * Clears all food buddy related cache
 */
export const clearCache = async (): Promise<void> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const foodKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
        await AsyncStorage.multiRemove(foodKeys);
        console.log('🧹 [CACHE] All food cache cleared');
    } catch (error) {
        console.error('❌ [CACHE] Clear failed:', error);
    }
};
