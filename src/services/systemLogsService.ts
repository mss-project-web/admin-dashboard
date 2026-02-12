import api from "@/lib/axios";

export const systemLogsService = {
    getAll: async () => {
        try {
            const response = await api.get('/system-logs');
            const data = response?.data?.data || response?.data || [];

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
