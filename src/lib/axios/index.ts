import axios from 'axios';
import { ApiRequestConfig } from './types';

// Use dynamic baseURL based on environment
const baseURL = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config as ApiRequestConfig;
        if (error.config?.url?.endsWith('/auth/login') || error.config?.url?.endsWith('/auth/logout')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await api.post('/auth/refresh');

                return api(originalRequest);
            } catch (refreshError) {
                if (typeof window !== 'undefined') {
                    if (!window.location.pathname.includes('/auth/login')) {
                        window.location.href = '/auth/login';
                    }
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const handleApiError = (error: any) => {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as any;


        if (status === 400 || status === 422) {
            return data.message || "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
        }

        if (status === 401 || status === 403) {
            return "เซสชันหมดอายุหรือไม่มีสิทธิ์เข้าถึง";
        }

        if (status === 404) {
            return "ไม่พบข้อมูลหรือบริการที่เรียกใช้งาน";
        }

        if (status && status >= 500) {
            return "เกิดข้อผิดพลาดที่ระบบเซิร์ฟเวอร์";
        }

        if (error.code === 'ERR_NETWORK') {
            return "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต";
        }
    }
    return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
};

export default api;
