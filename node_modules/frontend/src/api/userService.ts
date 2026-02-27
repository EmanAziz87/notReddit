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

export default { fetchMe, login };
