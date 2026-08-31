import api from '@/lib/axios';
import { ApiEnvelope, unwrapResponse } from '@/lib/axios/types';

export interface PermissionSettings {
    departments: {
        [departmentName: string]: string[];
    };
}

export const permissionService = {
    async getSettings(): Promise<PermissionSettings> {
        const res = await api.get<ApiEnvelope<PermissionSettings>>('/settings/permissions');
        return unwrapResponse(res);
    },

    async updateSettings(settings: PermissionSettings): Promise<void> {
        await api.put('/settings/permissions', settings);
    }
};
