import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Define custom types if needed, extending Axios types
export type ApiClient = AxiosInstance;

export interface ApiRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

export interface ApiEnvelope<T> {
    status: 'success' | 'fail';
    data: T;
    message: string;
    status_code: number;
    errors?: unknown;
}

export type ApiResponse<T> = AxiosResponse<ApiEnvelope<T>>;
export type ApiErrorResponse = AxiosError;

export function unwrapResponse<T>(response: ApiResponse<T>): T {
    return response.data.data;
}
