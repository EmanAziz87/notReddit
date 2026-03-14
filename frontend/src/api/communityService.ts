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

const editCommunity = async (communityId: string, formData: FormData) => {
  await api.put(`/communities/edit/${communityId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default { fetchCommunity, createCommunity, editCommunity };
