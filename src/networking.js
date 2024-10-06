import axios from "axios";

const instance = axios.create({
    baseURL: location.origin,
})

instance.interceptors.request.use((config) => {
    config.headers["content-type"] = "application/json";
    config.headers["nypcapikey"] = import.meta.env.VITE_BACKEND_API_KEY
    config.withCredentials = true;

    return config;
}, (err) => {
    return Promise.reject(err);
})

export default instance;