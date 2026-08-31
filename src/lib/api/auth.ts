import api from '@/lib/axios';
import { AuthResponse } from '@/types';
import { ApiEnvelope, unwrapResponse } from '@/lib/axios/types';

export const authApi = {
    login: async (credentials: { email: string; password: string }) => {
        const response = await api.post<ApiEnvelope<AuthResponse>>('/auth/login', credentials);
        return unwrapResponse(response);
    },

    logout: async () => {
        await api.post('/auth/logout');
    },

    refreshToken: async () => {
        await api.post('/auth/refresh');
    },

    resetPassword: async (email: string) => {
        const response = await api.post<ApiEnvelope<null>>('/auth/reset-password', { email });
        return unwrapResponse(response);
    },
};
