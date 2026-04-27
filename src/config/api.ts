export const API_CONFIG = {
    BASE_URL: 'https://lms-production-da0a.up.railway.app',
    LMS_PREFIX: '/lms',
};

export const getApiUrl = (endpoint: string) => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.LMS_PREFIX}${endpoint}`;
};
