import axios from 'axios';

let authToken = null;

export function setAuthToken(newToken){
    authToken = newToken;
}

export function getAuthToken(){
    return authToken;
}

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
        return response.data.data;
    }
    ,(errors)=>{
        if(errors.response?.status===401){
            setAuthToken(null);
            window.location.href = '/login';
        }
        throw errors;
    }
)

export default api;
