import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { openGrabSearch } from '../utils/grabLinker';

interface GrabButtonProps {
    /** The search keyword to pass to Grab (e.g., restaurant name or food type) */
    keyword: string;

    /** Optional restaurant name for display purposes */
    restaurantName?: string;
}

/**
 * A reusable button component to open Grab Food with a search query
 * Uses Grab's brand color and includes an external link icon
 */
export default function GrabButton({ keyword, restaurantName }: GrabButtonProps) {
    const handlePress = () => {
        // Use restaurantName if provided, otherwise use keyword
        const searchTerm = restaurantName || keyword;
        openGrabSearch(searchTerm);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            className="bg-[#00B14F] rounded-xl px-6 py-4 flex-row items-center justify-center shadow-lg"
            style={{
                shadowColor: '#00B14F',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
            }}
        >
            <Feather name="external-link" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white font-semibold text-base">
                Đặt món trên Grab
            </Text>
        </TouchableOpacity>
    );
}
