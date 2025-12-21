import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { openTikTokSearch } from '../utils/tiktokLinker';

interface TikTokButtonProps {
    /** The search keyword to pass to TikTok (e.g., restaurant name or food type) */
    keyword: string;
}

/**
 * A reusable button component to open TikTok with a review search query
 * Uses TikTok's brand aesthetic with black background
 * Automatically prepends "Review" to the search keyword
 */
export default function TikTokButton({ keyword }: TikTokButtonProps) {
    const handlePress = () => {
        openTikTokSearch(keyword);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            className="bg-black rounded-xl px-6 py-4 flex-row items-center justify-center shadow-lg"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
            }}
        >
            <FontAwesome name="play-circle" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white font-bold text-base">
                Xem Review trên TikTok
            </Text>
        </TouchableOpacity>
    );
}
