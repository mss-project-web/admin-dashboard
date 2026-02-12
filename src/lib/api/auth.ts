import api from '@/lib/axios';
import { AuthResponse } from '@/types';

export const authApi = {
    login: async (credentials: { email: string; password: string }) => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    logout: async () => {
        await api.post('/auth/logout');
    },

    refreshToken: async () => {
        await api.post('/auth/refresh');
    },
};
