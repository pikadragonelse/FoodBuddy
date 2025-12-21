import { Alert, Linking } from 'react-native';

/**
 * Opens Grab app with a food search query
 * Falls back to web URL if the Grab app is not installed
 * 
 * @param keyword - The search keyword (restaurant name, food type, etc.)
 * @returns Promise<void>
 */
export async function openGrabSearch(keyword: string): Promise<void> {
    // Validate keyword
    if (!keyword || keyword.trim().length === 0) {
        Alert.alert('Lỗi', 'Vui lòng nhập từ khóa tìm kiếm');
        return;
    }

    // Encode keyword to handle spaces and Vietnamese characters
    const encodedKeyword = encodeURIComponent(keyword.trim());

    // Grab app deep link URI scheme
    const grabAppUrl = `grab://open?screenType=SEARCH&searchKeyword=${encodedKeyword}&serviceType=FOOD`;

    // Fallback web URL if app is not installed
    const grabWebUrl = `https://food.grab.com/vn/en/restaurants?search=${encodedKeyword}`;

    try {
        // Check if the Grab app URL scheme is supported
        const canOpen = await Linking.canOpenURL(grabAppUrl);

        if (canOpen) {
            // Open Grab app
            await Linking.openURL(grabAppUrl);
        } else {
            // Fallback to web browser
            const canOpenWeb = await Linking.canOpenURL(grabWebUrl);

            if (canOpenWeb) {
                await Linking.openURL(grabWebUrl);
            } else {
                throw new Error('Cannot open Grab URL');
            }
        }
    } catch (error) {
        console.error('Error opening Grab:', error);

        // Show user-friendly error message
        Alert.alert(
            'Không thể mở Grab',
            'Vui lòng kiểm tra kết nối internet hoặc cài đặt ứng dụng Grab.',
            [{ text: 'OK' }]
        );
    }
}
