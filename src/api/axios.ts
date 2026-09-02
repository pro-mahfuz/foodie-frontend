
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store in-memory access token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use((response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response?.status === 401 && !originalRequest._retry) {
      

      if (isRefreshing) {

        return new Promise(function (resolve, reject) {

          failedQueue.push({ resolve, reject });

        }).then((token) => {

          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);

        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        //console.log("response interceptor: ", error.response?.status);

        // const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {refreshToken: refreshToken}, {
        //   withCredentials: true
        // });

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {refreshToken: refreshToken});

        if(response){
          localStorage.removeItem('accessToken');
          //localStorage.removeItem('refreshToken');
        }

        const newAccessToken = response.data.data.accessToken;
        //const newRefreshToken = response.data.data.refreshToken;

        localStorage.setItem('accessToken', newAccessToken);
        //localStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);

      } catch (err) {
          processQueue(err, null);

          //localStorage.removeItem('accessToken');
          //window.location.href = '/signin';
          return Promise.reject(err);

      } finally {

          isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;