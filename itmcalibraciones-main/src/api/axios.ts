import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// Obtener la URL base desde las variables de entorno (Vite)
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Interceptor de Solicitud (Agrega el token)
api.interceptors.request.use(
  (config) => {
    // Usamos getState() para leer el token de Zustand fuera de un componente React
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 2. Interceptor de Respuesta (Maneja errores 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si el token venció o es inválido, cerramos sesión forzada
      useAuthStore.getState().logout();

      // Opcional: Redirigir al login si no estamos ya ahí
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
