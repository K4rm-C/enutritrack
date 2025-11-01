// frontend/doctor-dashboard/js/config.js
const API_CONFIG = {
    BASE_URL: 'http://localhost:3001',
    SERVICES: {
        AUTH: 'http://localhost:3001',
        USER: 'http://localhost:3002',
        DOCTOR: 'http://localhost:3003',
        PATIENT: 'http://localhost:3004',
        APPOINTMENT: 'http://localhost:3005',
        ALERT: 'http://localhost:3006',
        NUTRITION: 'http://localhost:3007',
        ACTIVITY: 'http://localhost:3008',
        RECOMMENDATION: 'http://localhost:3009'
    }
};

const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user'
};