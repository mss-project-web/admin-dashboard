import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Define custom types if needed, extending Axios types
export type ApiClient = AxiosInstance;

export interface ApiRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

export type ApiResponse<T = any> = AxiosResponse<T>;
export type ApiErrorResponse = AxiosError;
