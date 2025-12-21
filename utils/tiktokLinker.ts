import { Alert, Linking } from 'react-native';

/**
 * Opens TikTok with a search query for reviews
 * 
 * Note: TikTok deep links for search are unreliable on iOS due to URL decoding issues.
 * The search query may not work perfectly, but this is a known limitation of TikTok's app.
 * 
 * @param keyword - The search keyword (restaurant name, food type, etc.)
 * @returns Promise<void>
 */
export async function openTikTokSearch(keyword: string): Promise<void> {
    // Validate keyword
    if (!keyword || keyword.trim().length === 0) {
        Alert.alert('Lỗi', 'Vui lòng nhập từ khóa tìm kiếm');
        return;
    }

    // Prepend "Review" to the keyword for better search results
    const searchQuery = `Review ${keyword.trim()}`;

    console.log('🔍 TikTok Search Query:', searchQuery);

    // Build URLs
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Deep link for TikTok app (try this first)
    const appUrl = `snssdk1233://search?keyword=${encodedQuery}`;
    
    // Web fallback URL
    const webUrl = `https://www.tiktok.com/search?q=${encodedQuery}`;

    console.log('🔗 App URL:', appUrl);
    console.log('🔗 Web URL:', webUrl);

    try {
        // Try to open TikTok app first
        const canOpenApp = await Linking.canOpenURL(appUrl);
        
        if (canOpenApp) {
            console.log('📱 Opening TikTok app...');
            await Linking.openURL(appUrl);
            console.log('✅ Successfully opened TikTok app');
        } else {
            // Fallback to web browser
            console.log('🌐 TikTok app not available, opening in browser...');
            await Linking.openURL(webUrl);
            console.log('✅ Successfully opened TikTok in browser');
        }
    } catch (error) {
        console.error('❌ Failed to open TikTok:', error);

        // Show simple error message
        Alert.alert(
            'Không thể mở TikTok',
            'Vui lòng kiểm tra kết nối internet hoặc cài đặt ứng dụng TikTok.',
            [{ text: 'OK' }]
        );
    }
}
