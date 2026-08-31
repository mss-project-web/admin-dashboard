import api from '@/lib/axios';
import { ApiEnvelope, unwrapResponse } from '@/lib/axios/types';
import { User } from '@/types/user';

interface PaginatedUsers {
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const userService = {
    getUsers: async (page = 1, limit = 20, search?: string) => {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (search) params.append('search', search);
        return unwrapResponse(await api.get<ApiEnvelope<PaginatedUsers>>(`/accounts?${params.toString()}`));
    },
    getUser: async (id: string) => unwrapResponse(await api.get<ApiEnvelope<User>>(`/accounts/${id}`)),
    createUser: async (data: Partial<User>) => unwrapResponse(await api.post<ApiEnvelope<User>>('/accounts', data)),
    updateUser: async (id: string, data: Partial<User>) => unwrapResponse(await api.put<ApiEnvelope<User>>(`/accounts/${id}`, data)),
    updateUserRole: async (id: string, role: string) => unwrapResponse(await api.patch<ApiEnvelope<User>>(`/accounts/${id}/role`, { role })),
    resetUserPassword: async (id: string) => unwrapResponse(await api.post<ApiEnvelope<{ tempPassword: string }>>(`/accounts/${id}/reset-password`)),
    updateMyProfile: async (data: Partial<User> & { currentPassword?: string; password?: string }) => unwrapResponse(await api.put<ApiEnvelope<User>>('/accounts/me', data)),
    getMe: async () => unwrapResponse(await api.get<ApiEnvelope<User>>('/accounts/me')),
    updateMe: async (data: Partial<Pick<User, 'firstName' | 'lastName' | 'phoneNumber'>>) => unwrapResponse(await api.put<ApiEnvelope<User>>('/accounts/me', data)),
    deleteUser: async (id: string) => unwrapResponse(await api.delete<ApiEnvelope<null>>(`/accounts/${id}`)),
};
