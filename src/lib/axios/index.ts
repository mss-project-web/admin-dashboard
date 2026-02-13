import axios from 'axios';
import { ApiRequestConfig } from './types';

const baseURL = '/api';

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
        if (error.config?.url?.endsWith('/auth/login') || error.config?.url?.endsWith('/auth/logout') || error.config?.url?.endsWith('/auth/refresh')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await api.post('/auth/refresh');

                return api(originalRequest);
            } catch (refreshError) {
                // Try to logout to clear cookies if possible, to avoid middleware redirect loops
                try {
                    await api.post('/auth/logout');
                } catch (e) {
                    console.error("Logout failed during refresh error handling", e);
                }

                if (typeof window !== 'undefined') {
                    if (!window.location.pathname.includes('/auth/login')) {
                        // Force reload to hit middleware with cleared cookies (hopefully) or just redirect
                        window.location.href = '/auth/login?error=session_expired';
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


        if (data?.message) {
            return data.message;
        }

        if (status === 400 || status === 422) {
            return "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
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
