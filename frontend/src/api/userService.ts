import { api } from "./axios";

interface loginData {
  username: string;
  password: string;
}

const fetchMe = async () => {
  const response = await api.get(`/users/me`);
  return response.data;
};

const login = async (loginDetails: loginData) => {
  const response = await api.post(`/users/login`, loginDetails);
  return response.data;
};

const logout = async () => {
  await api.delete(`/users/logout`);
};

const register = async (formData: FormData) => {
  await api.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default { fetchMe, login, logout, register };
