import api from "../axios";

export const systemApi = {
    getHealth: async () => {
        const response = await api.get('/health');
        return response.data;
    },
    getSystem: async () => {
        const response = await api.get('/');
        return response.data;
    }
}
