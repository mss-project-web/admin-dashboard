import api from "@/lib/axios";

export const dashboardApi = {
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },
    getPopularContent: async () => {
        const response = await api.get('/dashboard/popular');
        return response.data;
    },
    getCharts: async () => {
        const response = await api.get('/dashboard/charts');
        return response.data;
    },
    getRecentLogs: async () => {
        const response = await api.get('/dashboard/recent');
        return response.data;
    }
};
