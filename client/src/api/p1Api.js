import axios from 'axios';

import { getAuthToken } from './token';

// P1's client returns the raw axios response, so its pages read
// `response.data.data.<resource>`. P2's client unwraps to `data` directly.
// They stay separate; only the token is shared (see api/token.js).

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
