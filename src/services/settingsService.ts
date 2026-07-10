import api from "@/lib/axios";

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
        const response = await api.get<{ status: string; data: SiteSettings }>("/settings");
        return response.data.data;
    },

    update: async (data: SiteSettings) => {
        const response = await api.put("/settings", data);
        return response.data;
    },

    uploadQr: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post<{ status: string; data: { url: string } }>("/blog/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data.url;
    },
};
