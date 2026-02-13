export interface BlogGroup {
    _id?: string;
    id?: string;
    name: string;
    slug: string;
}

export interface BlogContentBlock {
    type: 'paragraph' | 'image';
    data: string | { url: string; caption: string };
}

export interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    content?: BlogContentBlock[] | string;
    tags?: string[];
    group?: string | BlogGroup;
    coverImage?: string;
    images?: string[];
    author?: { id: string; name: string };
    views: number;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface BlogListResponse {
    status: string;
    data: {
        data: BlogPost[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
    status_code: number;
}

export interface BlogResponse {
    status: string;
    data: BlogPost;
    message: string;
    status_code: number;
}
