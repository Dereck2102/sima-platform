import axios from 'axios';

// 10.0.2.2 es el "localhost" desde dentro del Emulador Android
export const API_URL = 'http://192.168.100.127:3000/api'; 

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});