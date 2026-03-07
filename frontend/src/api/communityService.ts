import { api } from "./axios";

const fetchCommunity = async (communityId: string) => {
  const response = await api.get(`/communities/${communityId}`);
  return response.data.fetchedCommunity;
};

export default { fetchCommunity };
