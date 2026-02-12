import api from '@/lib/axios';
import { User, UserResponse } from '@/types/user';

export const userService = {
    getUsers: async () => {
        const response = await api.get<UserResponse>('/accounts');
        return response.data.data;
    },

    getUser: async (id: string) => {
        const response = await api.get<{ status: string, data: User } | User>(`/accounts/${id}`);
        console.log("getUser response:", response.data); // Debug log
        if ('data' in response.data && response.data.data) {
             return response.data.data;
        }
        return response.data as User;
    },

    createUser: async (data: Partial<User>) => {
        const response = await api.post<{ status: string, data: User }>('/accounts', data);
         // Check if data is nested in data.data or just data
        if ('data' in response.data && response.data.data) {
             return response.data.data;
        }
        return response.data as any as User;
    },
    
    updateUser: async (id: string, data: Partial<User>) => {
        const response = await api.put<{ status: string, data: User }>(`/accounts/${id}`, data);
        return response.data.data;
    },

    updateUserRole: async (id: string, role: string) => {
        const response = await api.patch<{ status: string, data: User }>(`/accounts/${id}/role`, { role });
        return response.data.data;
    },

    getMe: async () => {
        const response = await api.get<{ status: string, data: User }>('/accounts/me');
        return response.data.data;
    },

    deleteUser: async (id: string) => {
         const response = await api.delete<{ status: string, message: string }>(`/accounts/${id}`);
         return response.data;
    }
};
