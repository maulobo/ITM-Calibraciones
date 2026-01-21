import axios, { InternalAxiosRequestConfig } from 'axios';
import useStore from "../store";

const API_URL = process.env.NEXT_PUBLIC_URL_API;

export const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

authApi.defaults.headers.common['Content-Type'] = 'application/json';

authApi.interceptors.request.use((request: InternalAxiosRequestConfig) => {
  const token = useStore.getState().token
  request.headers.set('Authorization', `Bearer ${token}`);
  return request;
});

export const api = axios.create({
  baseURL: API_URL,
});

