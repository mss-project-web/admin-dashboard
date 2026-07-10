import api from '@/lib/axios';
import { BlogPost, BlogListResponse, BlogResponse, BlogGroup } from '@/types/blog';

export const blogService = {
    getAll: async () => {
        const response = await api.get<BlogListResponse>(`/blog/admin/preview`);
        if (Array.isArray(response.data)) return response.data;
        if (response.data?.data && Array.isArray(response.data.data)) return response.data.data;
        if (response.data?.data?.data && Array.isArray(response.data.data.data)) return response.data.data.data;
        return [];
    },

    getBySlug: async (slug: string) => {
        const response = await api.get<any>(`/blog/admin/${slug}`);
        return response.data?.data || response.data;
    },

    create: async (data: Partial<BlogPost>) => {
        const response = await api.post<BlogResponse>('/blog', data);
        return response.data?.data || response.data;
    },

    update: async (id: string, data: Partial<BlogPost>) => {
        const response = await api.put<BlogResponse>(`/blog/${id}`, data);
        return response.data?.data || response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/blog/${id}`);
    },

    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<{
            status: string;
            data: { url: string };
            message: string;
            status_code: number
        }>('/blog/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    },

    getGroups: async () => {
        const response = await api.get<any>('/blog/groups');
        let data: any[] = [];

        if (Array.isArray(response.data)) {
            data = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
            data = response.data.data;
        }

        return data.map((item: any) => {
            if (typeof item === 'string') {
                return { _id: item, id: item, name: item, slug: item };
            }
            return item;
        });
    },

    createGroup: async (name: string) => {
        const response = await api.post<BlogGroup>('/blog/groups', { name });
        return (response.data as any)?.data || response.data;
    },

    updateGroup: async (id: string, name: string) => {
        const response = await api.put<BlogGroup>(`/blog/groups/${id}`, { name });
        return (response.data as any)?.data || response.data;
    },

    deleteGroup: async (id: string) => {
        await api.delete(`/blog/groups/${id}`);
    }
};
