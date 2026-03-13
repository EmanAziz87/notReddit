import { api } from "./axios";

const fetchCommunity = async (communityId: string) => {
  const response = await api.get(`/communities/${communityId}`);
  return response.data.fetchedCommunity;
};

const createCommunity = async (formData: FormData) => {
  const response = await api.post(`/communities/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.createdCommunity;
};

export default { fetchCommunity, createCommunity };
