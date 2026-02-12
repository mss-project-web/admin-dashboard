import api from "@/lib/axios";
import { PrayerRoom } from "@/types/prayer-room";

export const prayerRoomService = {
    getAll: async () => {
        const response = await api.get<{ status: string; data: PrayerRoom[] }>("/prayer-rooms/");
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await api.get<{ status: string; data: PrayerRoom }>(`/prayer-rooms/${id}`);
        return response.data.data;
    },

    create: async (data: FormData) => {
        // Create uses FormData for file uploads
        const response = await api.post("/prayer-rooms/", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    update: async (id: string, data: any) => {
        // Update uses JSON as per requirements
        const response = await api.put(`/prayer-rooms/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/prayer-rooms/${id}`);
        return response.data;
    },
};
