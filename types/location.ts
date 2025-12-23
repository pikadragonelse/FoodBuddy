// ========================
// Location & Map Types
// ========================

/** Tọa độ GPS */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Kết quả từ Goong API */
export interface GoongPlace {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  compound?: {
    district?: string;
    commune?: string;
    province?: string;
  };
}

/** Restaurant từ grounding search */
export interface GroundedRestaurant {
  name: string;
  address: string;
  rating?: number;
  priceLevel?: string;
  distance?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  photoUrl?: string;
}
