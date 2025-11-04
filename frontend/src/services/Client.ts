import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

// URL base de la API, obtenida de las variables de entorno o usa un default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T; 
    eventos?: T; 
}

export default class HttpClient {
    protected client: AxiosInstance;
    protected basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;

        this.client = axios.create({
            // Configura la URL base
            baseURL: API_BASE_URL + basePath, 
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            withCredentials: true, // Útil si usas cookies de sesión
        });

        // ===============================================
        // 🛑 INTERCEPTOR DE SOLICITUD (Adjunta el Token Condicionalmente)
        // ===============================================
        this.client.interceptors.request.use(
            (config) => {
                // Rutas que NO requieren autenticación (rutas públicas/metadatos)
                const publicPaths = [
                    'auth/status', 
                    'auth/login',
                    'auth/register',
                    'categoria', // Rutas de metadatos
                    'artista',   
                    'evento/filtros/ubicaciones',
                ];

                const isPublic = publicPaths.some(path => 
                    config.url?.includes(path)
                );
                
                if (!isPublic) {
                    const token = localStorage.getItem('userToken'); // Usa tu llave real
                    
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
        // 🛑 INTERCEPTOR DE RESPUESTA (Manejo Silencioso del 401)
        // ===============================================
        this.client.interceptors.response.use(
            (response: AxiosResponse<ApiResponse>) => response,

            (error: AxiosError<ApiResponse>) => {
                
                // 🛑 LÓGICA CLAVE: Silenciar el 401 ÚNICAMENTE para la ruta de /auth/status
                // Esto permite que el try/catch en AuthService.ts lo capture y lo maneje limpiamente.
                if (error.response?.status === 401 && error.config?.url?.includes('/auth/status')) {
                    
                    // Solo devolvemos el rechazo para que checkSession lo procese; 
                    // NO hacemos console.error aquí para evitar el error no manejado en la consola.
                    return Promise.reject(error);
                }

                // Lógica de logging para otros errores 4xx (diferentes a 401 en /auth/status) y 5xx.
                if (!error.response) {
                    // Error de red (servidor no disponible)
                    console.error("Server not available:", error.message);
                } else if (error.response.status >= 500) {
                    // Error de servidor (5xx)
                    console.error("Server error (5xx):", error.message);
                } else {
                    // Error de cliente (4xx)
                    console.error(`HTTP Error ${error.response.status}:`, error.message);
                }
                
                return Promise.reject(error);
            }
        );
    }
    
    // Métodos HTTP para la API
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