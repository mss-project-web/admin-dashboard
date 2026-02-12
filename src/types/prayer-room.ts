export interface PrayerRoom {
    _id: string;
    name: string;
    place: string;
    detail: string;
    faculty?: string;
    location: [number, number]; // [lat, lng]
    openingHours: string;
    images: string[];
    youtube_url?: string;
    capacity: number;
    google_map_url?: string;
    facilities: string[];
    phone: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface PrayerRoomFormData {
    name: string;
    place: string;
    detail: string;
    faculty?: string;
    location: [number, number];
    openingHours: string;
    images?: (string | File)[]; // For UI handling
    youtube_url?: string;
    capacity: number;
    google_map_url?: string;
    facilities: string[];
    phone: string;
}
