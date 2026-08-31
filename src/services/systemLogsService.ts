import api from "@/lib/axios";
import { ApiEnvelope, unwrapResponse } from '@/lib/axios/types';

export const systemLogsService = {
    getAll: async () => {
        try {
            const response = await api.get<ApiEnvelope<Array<{ createdAt: string }>>>('/system-logs');
            const data = unwrapResponse(response);

            // Sort by createdAt desc
            return Array.isArray(data) ? data.sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ) : [];
        } catch (error) {
            console.error("Error in systemLogsService.getAll:", error);
            throw error;
        }
    }
};
