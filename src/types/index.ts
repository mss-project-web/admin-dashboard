export interface User {
    id: string;
    username: string;
    role: string;
    name?: string;
    email?: string;
}

export interface AuthResponse {
    access_token: string;
}

export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}
