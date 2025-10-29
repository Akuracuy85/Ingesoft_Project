// src/services/Client.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

// 1. Configuración de la URL Base: Usamos import.meta.env, común en Vite/Modern Webpack
// Se establece un fallback a 'http://localhost:8080' si la variable de entorno no está definida
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Definición de una interfaz base para la respuesta de la API
// Esto ayuda al tipado de los datos que devuelve tu backend
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T; // Puedes ajustar este tipo si tu API usa 'eventos' en lugar de 'data'
  eventos?: T; // Agregamos 'eventos' para tipar tu respuesta específica
}

/**
 * Clase base para todas las llamadas HTTP.
 * Proporciona una instancia de Axios configurada y métodos CRUD.
 */
export default class HttpClient {
  protected client: AxiosInstance;
  protected basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;

    // 2. Creación de la instancia de Axios con configuración
    this.client = axios.create({
      baseURL: API_BASE_URL + basePath, // Combina la URL base del entorno con la ruta específica del servicio
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true, // Importante para manejar cookies de sesión/autenticación
    });

    // 3. Configuración de Interceptores (Manejo de Respuestas y Errores)
    this.client.interceptors.response.use(
      // Respuesta exitosa (2xx)
      (response: AxiosResponse<ApiResponse>) => response,

      // Manejo de errores de respuesta (4xx, 5xx, etc.)
      (error: AxiosError<ApiResponse>) => {
        if (!error.response) {
          // Error de red (Servidor no disponible, timeout)
          console.error("Server not available:", error.message);
        } else if (error.response.status >= 500) {
          // Errores de servidor (5xx)
          console.error("Server error (5xx):", error.message);
        } else {
          // Errores de cliente (4xx - ej. 401 Unauthorized, 404 Not Found)
          // Aquí puedes implementar lógica específica para el 401, etc.
          console.error(`HTTP Error ${error.response.status}:`, error.message);
        }
        
        // Rechaza la promesa para que el servicio que hizo la llamada maneje el error
        return Promise.reject(error);
      }
    );
  }

  // --- 4. Métodos CRUD Genéricos ---
  
  // Nota: Devolvemos el tipo de datos genérico T contenido en la respuesta de la API
  
  async get<T = any>(url: string = '', config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.get<ApiResponse<T>>(url, config);
    // Devolvemos los datos anidados (el objeto completo de tu API)
    return res.data as T; 
  }

  async post<T = any>(url: string = '', data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.post<ApiResponse<T>>(url, data, config);
    return res.data as T;
  }

  async put<T = any>(url: string = '', data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.put<ApiResponse<T>>(url, data, config);
    return res.data as T;
  }

  async patch<T = any>(url: string = '', data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.patch<ApiResponse<T>>(url, data, config);
    return res.data as T;
  }

  async delete<T = any>(url: string = '', config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.delete<ApiResponse<T>>(url, config);
    return res.data as T;
  }
}