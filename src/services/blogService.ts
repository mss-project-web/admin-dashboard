import api from '@/lib/axios';
import { BlogPost, BlogListResponse, BlogGroup } from '@/types/blog';
import { ApiEnvelope, unwrapResponse } from '@/lib/axios/types';

export const blogService = {
    getAll: async (page = 1, limit = 10, options?: { search?: string, group?: string, status?: string, month?: string, year?: string, sortKey?: string, sortDir?: 'asc'|'desc'|null }) => {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (options?.search) queryParams.append('search', options.search);
        if (options?.group) queryParams.append('group', options.group);
        if (options?.status) queryParams.append('status', options.status);
        if (options?.month) queryParams.append('month', options.month);
        if (options?.year) queryParams.append('year', options.year);
        if (options?.sortKey) queryParams.append('sortKey', options.sortKey);
        if (options?.sortDir) queryParams.append('sortDir', options.sortDir);

        const response = await api.get<ApiEnvelope<BlogListResponse['data']>>(`/blog/admin/preview?${queryParams.toString()}`);
        return unwrapResponse(response);
    },

    getBySlug: async (slug: string) => {
        return unwrapResponse(await api.get<ApiEnvelope<BlogPost>>(`/blog/admin/${slug}`));
    },

    create: async (data: Partial<BlogPost>) => {
        return unwrapResponse(await api.post<ApiEnvelope<BlogPost>>('/blog', data));
    },

    update: async (id: string, data: Partial<BlogPost>) => {
        return unwrapResponse(await api.put<ApiEnvelope<BlogPost>>(`/blog/${id}`, data));
    },

    delete: async (id: string) => {
        await api.delete(`/blog/${id}`);
    },

    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<ApiEnvelope<{ url: string }>>('/blog/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return unwrapResponse(response);
    },

    getGroups: async () => {
        const data = unwrapResponse(await api.get<ApiEnvelope<Array<BlogGroup | string>>>('/blog/groups'));

        return data.map((item: any) => {
            if (typeof item === 'string') {
                return { _id: item, id: item, name: item, slug: item };
            }
            return item;
        });
    },

    createGroup: async (name: string) => {
        // Groups are derived dynamically from existing blogs, so we just return a local object
        return { _id: name, id: name, name, slug: name } as BlogGroup;
    },

    updateGroup: async (id: string, name: string) => {
        return unwrapResponse(await api.put<ApiEnvelope<BlogGroup>>(`/blog/groups/${id}`, { name }));
    },

    deleteGroup: async (id: string) => {
        await api.delete(`/blog/groups/${id}`);
    }
};
