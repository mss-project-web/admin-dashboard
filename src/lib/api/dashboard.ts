import api from "@/lib/axios";
import { ApiEnvelope, unwrapResponse } from "@/lib/axios/types";

export const dashboardApi = {
    getSummary: async (startDate?: string, endDate?: string) => {
        let url = '/dashboard/summary';
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        return unwrapResponse(await api.get<ApiEnvelope<Record<string, unknown>>>(url));
    },
    getStats: async (startDate?: string, endDate?: string) => {
        let url = '/dashboard/stats';
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        return unwrapResponse(await api.get<ApiEnvelope<Record<string, unknown>>>(url));
    },
    getPopularContent: async () => {
        return unwrapResponse(await api.get<ApiEnvelope<Record<string, unknown>>>('/dashboard/popular'));
    },
    getCharts: async (startDate?: string, endDate?: string) => {
        let url = '/dashboard/charts';
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        return unwrapResponse(await api.get<ApiEnvelope<Record<string, unknown>>>(url));
    },
    getTimeseries: async (startDate?: string, endDate?: string) => {
        let url = '/dashboard/timeseries';
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        return unwrapResponse(await api.get<ApiEnvelope<Record<string, unknown>>>(url));
    },
    getDistribution: async (startDate?: string, endDate?: string) => {
        let url = '/dashboard/distribution';
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        return unwrapResponse(await api.get<ApiEnvelope<Record<string, unknown>>>(url));
    },
    getDashboardCharts: async (startDate?: string, endDate?: string) => {
        const [timeseries, distribution] = await Promise.all([
            dashboardApi.getTimeseries(startDate, endDate),
            dashboardApi.getDistribution(startDate, endDate),
        ]);
        const contentTypes = Array.isArray(timeseries) ? [] : (distribution.contentTypes as Array<{ label?: string; name?: string; value: number }> ?? []);
        return {
            systemActivity: (timeseries as Record<string, unknown>).systemActivity ?? [],
            loginActivity: (timeseries as Record<string, unknown>).loginActivity ?? [],
            contentDistribution: contentTypes.map((item) => ({ name: item.label ?? item.name ?? '', value: item.value })),
            contentStatus: (distribution as Record<string, unknown>).contentStatus ?? [],
            actionDistribution: (distribution as Record<string, unknown>).actions ?? [],
            topAuthors: (distribution as Record<string, unknown>).topAuthors ?? [],
        };
    },
    getRecentLogs: async () => {
        return unwrapResponse(await api.get<ApiEnvelope<unknown[]>>('/dashboard/recent'));
    },
    getRecentLogsPage: async (page = 1, limit = 10) => {
        return unwrapResponse(await api.get<ApiEnvelope<{ rows: unknown[]; pagination: Record<string, number> }>>(`/dashboard/recent-logs?page=${page}&limit=${limit}`));
    },
    getCloudflareAnalytics: async () => {
        return unwrapResponse(await api.get<ApiEnvelope<Record<string, unknown>>>('/dashboard/analytics/cloudflare'));
    }
};
