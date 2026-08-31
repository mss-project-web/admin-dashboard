import api from "../axios";
import { unwrapResponse } from "../axios/types";

export const systemApi = {
    getHealth: async () => {
        const response = await api.get('/health');
        return unwrapResponse(response);
    },
    getSystem: async () => {
        const response = await api.get('/');
        return unwrapResponse(response);
    },
    getSystemLogs: async () => {
        const response = await api.get('/system-logs');
        return unwrapResponse(response);
    }
}
