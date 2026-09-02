import axiosInstance from "../../../api/axios";

interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  try {
    const res = await axiosInstance.post('/auth/login', credentials);

    return res.data.data;
  } catch {
      throw new Error('Login failed');
  }
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const res = await axiosInstance.post('/auth/refresh', refreshToken);
    return res.data.data;
  } catch {
      throw new Error('Login failed');
  }
};