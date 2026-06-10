import axios from 'axios';

// Lógica inteligente: Vite sabe si estás programando (dev) o en producción (build)
const getBaseURL = () => {
    if (import.meta.env.DEV) {
        // Si ejecutaste "npm run dev" (Estás en tu PC)
        return 'http://localhost:8080/api/v1'; 
    }
    // Si ejecutaste "npm run build" (Se subió al servidor)
    return 'http://159.89.54.99/api/v1'; 
};

export const api = axios.create({
    baseURL: getBaseURL(),
    /*headers: {
        'Content-Type': 'application/json',
    },*/
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Sesión expirada o Token inválido');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);