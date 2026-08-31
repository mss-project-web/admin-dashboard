import api from "@/lib/axios";
import { ApiEnvelope, unwrapResponse } from '@/lib/axios/types';

export interface Phone { label: string; number: string; }

export interface SiteSettings {
    contact: {
        phones: Phone[];
        email: string;
        socials: { facebook?: string; instagram?: string; youtube?: string; line?: string; tiktok?: string };
        address?: string;
        mapUrl?: string;
        openingHours?: string;
    };
    donation: {
        bankName?: string;
        accountName?: string;
        accountNumber?: string;
        promptpay?: string;
        qrImage?: string;
        note?: string;
    };
}

export const settingsService = {
    get: async (): Promise<SiteSettings> => {
        const response = await api.get<ApiEnvelope<SiteSettings>>("/settings");
        return unwrapResponse(response);
    },

    update: async (data: SiteSettings) => {
        const response = await api.put<ApiEnvelope<SiteSettings>>("/settings", data);
        return unwrapResponse(response);
    },

    uploadQr: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post<ApiEnvelope<{ url: string }>>("/blog/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return unwrapResponse(response).url;
    },
};
