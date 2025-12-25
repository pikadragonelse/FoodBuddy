import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Linking, Text, TouchableOpacity } from 'react-native';
import { openRestaurantInMaps } from '../utils/mapLinker';

interface MapButtonProps {
    /** Exact restaurant name for query */
    restaurantName: string;
    /** Address for more precise query (optional) */
    address?: string;
    /** Direct URL from Google (optional) */
    googleMapsUrl?: string;
}

/**
 * Button to open restaurant in Google Maps
 * Uses "Name + Address" for best accuracy
 */
export default function MapButton({ restaurantName, address, googleMapsUrl }: MapButtonProps) {
    const handlePress = () => {
        // Force Google Maps if the URL is Track-Asia (legacy/cached)
        if (googleMapsUrl && googleMapsUrl.includes('track-asia.com')) {
            console.log("🔄 Redirecting Track-Asia URL to Google Maps...");
            openRestaurantInMaps(restaurantName, address);
            return;
        }

        if (googleMapsUrl) {
            console.log("🔗 Opening Maps URL:", googleMapsUrl);
            Linking.openURL(googleMapsUrl).catch(err => {
                console.error("Failed to open URL:", err);
                // Fallback to name search
                openRestaurantInMaps(restaurantName, address);
            });
        } else {
            openRestaurantInMaps(restaurantName, address);
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            className="bg-[#4285F4] rounded-xl px-6 py-4 flex-row items-center justify-center shadow-lg"
            style={{
                shadowColor: '#4285F4',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
            }}
        >
            <Feather name="map-pin" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white font-semibold text-base">
                Xem trên Google Maps
            </Text>
        </TouchableOpacity>
    );
}
