// src/services/Client.ts

import axios, { 
    type AxiosInstance, 
    type AxiosRequestConfig, 
    type AxiosResponse, 
    type AxiosError 
} from 'axios';
// 🛑 Necesitamos una implementación de URLSearchParams (de Node o polyfill de navegador)
// Si estás en un entorno moderno de navegador, URLSearchParams está globalmente disponible.
// Si estás en Node (SSR/tests), puede que necesites importarlo: 
// import { URLSearchParams } from 'url'; 


// URL base de la API, obtenida de las variables de entorno o usa un default
const API_BASE_URL = import.meta.env.ENV == 'prod' ? '/api' : 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T; 
    eventos?: T; 
}


// ===============================================
// 🛑 FUNCIÓN DE SERIALIZACIÓN DE ARRAYS (Corrige k[]=v a k=v&k=v)
// ===============================================

const customParamsSerializer = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const value = params[key];
            
            if (Array.isArray(value)) {
                // Si es un array (e.g., categoriaIds: ['1', '2']), añade cada elemento con la misma clave
                value.forEach(item => {
                    // Solo añade si el ítem no es null/undefined/cadena vacía
                    if (item !== null && item !== undefined && item !== '') {
                        searchParams.append(key, item.toString());
                    }
                });
            } else if (value !== null && value !== undefined && value !== '') {
                // Para valores simples (e.g., precioMin), añadir directamente
                searchParams.append(key, value.toString());
            }
        }
    }
    
    return searchParams.toString();
};


export default class HttpClient {
    protected client: AxiosInstance;
    protected basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
        
        // La URL base completa será: API_BASE_URL + basePath
        this.client = axios.create({
            baseURL: API_BASE_URL + basePath, 
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            withCredentials: true,
            
            // 🛑 AGREGADO: Usar el serializador de arrays personalizado
            paramsSerializer: {
                serialize: customParamsSerializer,
            },
        });

        // ===============================================
        // 🛑 INTERCEPTOR DE SOLICITUD (Adjunta el Token)
        // ===============================================
        
        // Nota: Las rutas de tu interceptor de autenticación deben usar el path relativo
        // (es decir, el path que se añade al `baseURL`), no el basePath del constructor.
        
        this.client.interceptors.request.use(
            (config) => {
                // Rutas que NO requieren autenticación (rutas públicas/metadatos)
                const publicPaths = [
                    'auth/status', 
                    'auth/login',
                    'auth/register',
                    '/categoria', // Rutas de metadatos (si tu basePath es '/', deben ser relativas)
                    '/artista',   
                    '/evento/filtros/ubicaciones',
                    '/evento/publicados', // Las llamadas GET de eventos públicos (listado) no necesitan token
                ];

                // 🛑 CORRECCIÓN CLAVE: Usar la URL completa (incluyendo baseURL) para la verificación
                // O usar solo el path relativo, asumiendo que el baseURL se adjunta después
                // Usaremos el path completo para mayor seguridad:
                const fullUrl = config.baseURL + (config.url || '');

                const isPublic = publicPaths.some(path => 
                    fullUrl.includes(path)
                );
                
                if (!isPublic) {
                    const token = localStorage.getItem('userToken'); 
                    
                    if (token && config.headers) {
                        config.headers.Authorization = `Bearer ${token}`; 
                    }
                }
                
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // ===============================================
        // INTERCEPTOR DE RESPUESTA (Manejo de errores/401)
        // ===============================================
        this.client.interceptors.response.use(
            (response: AxiosResponse<ApiResponse>) => response,

            (error: AxiosError<ApiResponse>) => {
                
                // LÓGICA CLAVE: Silenciar el 401 ÚNICAMENTE para la ruta de /auth/status
                if (error.response?.status === 401 && error.config?.url?.includes('auth/status')) {
                    return Promise.reject(error); // Rechazo silencioso para que el servicio lo maneje
                }

                // Lógica de logging para otros errores (4xx y 5xx)
                if (error.response?.status === 401) {
                    // 🛑 Manejo global de 401 para TODAS las demás rutas
                    // Aquí podrías redirigir al login y limpiar el token
                    console.error("401 Unauthorized - Token inválido o expirado. Redirigiendo...");
                    // localStorage.removeItem('userToken'); 
                    // window.location.href = '/login'; 
                } else if (!error.response) {
                    console.error("Error de Red/Servidor no disponible:", error.message);
                } else if (error.response.status >= 500) {
                    console.error("Server Error (5xx):", error.message, error.response.data);
                } else {
                    console.error(`HTTP Error ${error.response.status}:`, error.message, error.response.data);
                }
                
                return Promise.reject(error);
            }
        );
    }
    
    // Métodos HTTP (son correctos)
    async get<T = any>(url: string = '', config?: AxiosRequestConfig): Promise<T> {
        const res = await this.client.get<ApiResponse<T>>(url, config);
        return res.data as T; 
    }

    async post<T = any>(url: string = '', data?: any, config?: AxiosRequestConfig): Promise<T> {
        const res = await this.client.post(url, data, config);
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