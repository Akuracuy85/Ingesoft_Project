// src/services/Client.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

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
      baseURL: API_BASE_URL + basePath, 
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true, 
    });


    this.client.interceptors.response.use(

      (response: AxiosResponse<ApiResponse>) => response,


      (error: AxiosError<ApiResponse>) => {
        if (!error.response) {

          console.error("Server not available:", error.message);
        } else if (error.response.status >= 500) {

          console.error("Server error (5xx):", error.message);
        } else {

          console.error(`HTTP Error ${error.response.status}:`, error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
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