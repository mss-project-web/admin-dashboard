export interface News {
    _id: string;
    name: string;
    description: string;
    date: string; // ISO Date string
    images: string[];
    link?: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface NewsFormData {
    name: string;
    description: string;
    date: string;
    images?: (string | File)[];
    link?: string;
}
