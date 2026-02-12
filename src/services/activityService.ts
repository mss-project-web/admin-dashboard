import api from '@/lib/axios';

import { Activity, ActivityListItem, ActivityResponse } from '@/types/activity';

export const activityService = {
    getAll: async () => {
        const response = await api.get<{ status: string, data: { status: string, data: ActivityListItem[] } }>('/activities/');
        return response.data.data.data;
    },

    getById: async (id: string) => {
        const response = await api.get<{ status: string, data: Activity }>(`/activities/${id}`);
        return response.data.data;
    },

    create: async (data: FormData) => {
        const response = await api.post<ActivityResponse<Activity>>('/activities/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch<ActivityResponse<Activity>>(`/activities/${id}`, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/activities/${id}`);
        return response.data;
    }
};
