import axios from 'axios';
import { TOKEN_KEY, USER_KEY, getAuthToken, setAuthToken } from './token';

export { setAuthToken };

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api'
});

api.interceptors.request.use((config)=>{
    const token = getAuthToken();
    if(token!==null){
        config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
})

api.interceptors.response.use(
    (response)=>{
        if(response.config.responseType === 'blob'){
            return response.data;
        }
        return response.data.data;
    }
    ,(errors)=>{
        if(errors.response?.status===401){
            setAuthToken(null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            if(window.location.pathname !== '/login'){
                window.location.href = '/login';
            }
        }
        throw errors;
    }
)

export default api;
