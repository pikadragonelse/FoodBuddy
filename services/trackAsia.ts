const SERP_API_KEY = process.env.EXPO_PUBLIC_SERP_API_KEY;
const BASE_URL = "https://serpapi.com/search.json";

// Helper: Convert Google Image URL to High Res
export const getHighQualityUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    // Replace scaling params like =w122-h92-k-no with =w1080-h1080-k-no to get high res
    // Or simpler: remove params entirely if possible, but often specific dimensions are safer.
    // Google LH3 URLs often use =sXXX for size or =wXXX-hXXX.

    // Pattern 1: =w122-h92-k-no -> =w1080-h1080-k-no
    if (url.includes('=w')) {
        return url.replace(/=w\d+-h\d+(-k-no)?/, '=w1080-h1080-k-no');
    }
    // Pattern 2: =s120 -> =s1080
    if (url.includes('=s')) {
        return url.replace(/=s\d+/, '=s1080');
    }

    // Fallback: Append high res param if no params found (rare)
    return `${url}=w1080-h1080-k-no`;
};

export interface TrackAsiaPlace {
    place_id: string;
    name: string;
    description: string; // Mapped to address
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    rating?: number;
    user_ratings_total?: number;
    open_now?: boolean; // Whether the place is currently open
    // SerpApi specific fields can be added if needed, but keeping interface compatible
    thumbnail?: string;
}

/**
 * Searches for nearby restaurants using SerpApi (Google Maps Engine)
 * Replaces Track-Asia implementation.
 */
export const searchNearbyRestaurants = async (
    lat: number,
    lng: number,
    radius: number = 5000, // SerpApi relies on zoom level in 'll' parameter, roughly mapping to radius
    keyword: string = "restaurant"
): Promise<any[]> => {
    if (!SERP_API_KEY) {
        console.warn("⚠️ Missing SERP_API_KEY (EXPO_PUBLIC_SERP_API_KEY)");
        return [];
    }

    try {
        // Construct LL parameter. Zoom 14 is roughly city/district level, 15 is neighborhood.
        // We can approximate radius by zoom, but standard 14z-15z is good for "nearby".
        const zoom = radius < 2000 ? "15z" : "14z";
        const ll = `@${lat},${lng},${zoom}`;

        const url = `${BASE_URL}?engine=google_maps&q=${encodeURIComponent(keyword)}&ll=${ll}&type=search&api_key=${SERP_API_KEY}&hl=vi`;

        console.log(`🔍 [SERP-API SEARCH]: "${keyword}" at ${ll}`);

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ SerpApi Error:", data.error);
            return [];
        }

        if (data.local_results) {
            // Debug: Log complete structure to find photos/menu and verify location
            if (data.local_results.length > 0) {
                const sample = data.local_results[0];
                console.log(`🔍 [DEBUG SERP] Full Object Keys:`, Object.keys(sample));
                console.log(`🔍 [DEBUG SERP] Photos field:`, sample.photos ? 'Found' : 'Missing', sample.photos);
                console.log(`🔍 [DEBUG SERP] Images field:`, sample.images ? 'Found' : 'Missing', sample.images);
                console.log(`🔍 [DEBUG SERP] Menu field:`, sample.menu);
                console.log(`🔍 [DEBUG SERP] GPS:`, sample.gps_coordinates);
                console.log(`🔍 [DEBUG SERP] Thumbnail:`, sample.thumbnail);
                console.log(`🔍 [DEBUG URL] Used URL:`, url);
            }

            // Map SerpApi results to TrackAsiaPlace structure for compatibility
            return data.local_results.map((result: any) => {
                // Smart open_now mapping based on Vietnamese patterns:
                // - "Mở cửa" / "Open" / "Sắp đóng cửa" → true (open or closing soon)
                // - "Đã đóng cửa" / "Closed" → false (closed)
                // - undefined or other → undefined (unknown)
                let openNow: boolean | undefined = undefined;
                if (result.open_state) {
                    const state = result.open_state.toLowerCase();

                    // Priority 1: Check if explicitly closed
                    if (state.startsWith("đã đóng cửa") || state.startsWith("đóng cửa")) {
                        openNow = false;
                    }
                    // Priority 2: Check if closing soon (still open!)
                    else if (state.includes("sắp đóng cửa")) {
                        openNow = true;
                    }
                    // Priority 3: Check if open
                    else if (state.includes("mở cửa")) {
                        openNow = true;
                    }
                    // English fallbacks
                    else if (state.includes("closed") && !state.includes("closing")) {
                        openNow = false;
                    } else if (state.includes("open") && !state.includes("closed")) {
                        openNow = true;
                    }
                }

                return {
                    place_id: result.place_id,
                    name: result.title,
                    description: result.address,
                    geometry: {
                        location: {
                            lat: result.gps_coordinates?.latitude || 0,
                            lng: result.gps_coordinates?.longitude || 0,
                        }
                    },
                    rating: result.rating,
                    user_ratings_total: result.reviews,
                    open_now: openNow,
                    thumbnail: getHighQualityUrl(result.thumbnail)
                };
            });
        } else {
            // Sometimes results are in place_results (if single match) or other fields
            return [];
        }

    } catch (error) {
        console.error("❌ Network Error calling SerpApi:", error);
        return [];
    }
};

/**
 * Searches for a specific place using keyword (Text Search via SerpApi)
 */
export const smartLocationSearch = async (
    query: string,
    lat: number,
    lng: number
): Promise<any> => {
    if (!SERP_API_KEY) {
        console.warn("⚠️ Missing SERP_API_KEY");
        return null;
    }

    try {
        const ll = `@${lat},${lng},14z`;
        const url = `${BASE_URL}?engine=google_maps&q=${encodeURIComponent(query)}&ll=${ll}&type=search&api_key=${SERP_API_KEY}&hl=vi`;

        console.log(`🔍 [SERP-API TEXT SEARCH]: "${query}"`);

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ SerpApi Smart Search Error:", data.error);
            return null;
        }

        const results = data.local_results;

        if (results && results.length > 0) {
            const place = results[0];
            return {
                name: place.title,
                address: place.address,
                lat: place.gps_coordinates?.latitude || 0,
                lng: place.gps_coordinates?.longitude || 0,
                place_id: place.place_id,
                distance: 0, // Distance calculation requires user location. 
                // Callers usually calculate distance themselves or we can add helper if we have user coords passed in (we do have lat/lng passed as context).
                // Ideally we calculate it here, but strict compatibility just needs standard return.
                thumbnail: getHighQualityUrl(place.thumbnail)
            };
        }
        return null;
    } catch (error) {
        console.error("❌ SerpApi Smart Search Error:", error);
        return null;
    }
};

/**
 * Gets place details from SerpApi (if needed)
 * Mapped to return generic object
 */
export const getPlaceDetail = async (placeId: string): Promise<any> => {
    if (!SERP_API_KEY) return null;
    try {
        // SerpApi Place Detail uses place_id parameter (or data_id/lsig)
        // Usually for Place Detail we might use Google Place API directly or SerpApi implementation.
        // For SerpApi, we can search by place_id using q=... or specific params if supported, 
        // but 'place_id' is a supported parameter for engine=google_maps?
        // Actually, checking docs: engine=google_maps supports place_id.

        const url = `${BASE_URL}?engine=google_maps&place_id=${placeId}&api_key=${SERP_API_KEY}&hl=vi`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.place_results) {
            return data.place_results;
        }
        return null;
    } catch (error) {
        console.error("❌ SerpApi Details Error:", error);
        return null;
    }
};

/**
 * Generates a Google Maps link from coordinates and name
 * This allows users to open the location in Google Maps 
 */
export const getMapsURL = (lat: number, lng: number, name: string): string => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&location=${lat},${lng}`;
};

/**
 * Fallback Photo URL
 */
export const getPhotoUrl = (photoReference?: string): string => {
    if (!photoReference) {
        return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800';
    }
    // If we have a URL (from SerpApi thumbnail), use it.
    if (photoReference.startsWith('http')) {
        return photoReference;
    }
    return `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800`;
};
