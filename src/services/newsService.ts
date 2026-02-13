import api from "@/lib/axios";
import { News } from "@/types/news";
import { createFormDataForUpdate } from '@/lib/api-utils';

export const newsService = {
    getAll: async () => {
        const response = await api.get<{ status: string; data: { status: string; data: News[] } }>("/news/");
        return response.data.data.data;
    },

    getById: async (id: string) => {
        const response = await api.get<{ status: string; data: { status: string; data: News } }>(`/news/${id}`);
        return response.data.data.data;
    },

    create: async (data: FormData) => {
        const response = await api.post("/news/", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    update: async (id: string, data: any, newImages?: File[], deletedImageUrls?: string[]) => {
        const formData = createFormDataForUpdate(data, newImages, deletedImageUrls);
        const response = await api.patch(`/news/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/news/${id}`);
        return response.data;
    },
};
