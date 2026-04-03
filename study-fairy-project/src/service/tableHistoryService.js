import api from "@/service/api";

const BASE_URL = "/log/table-history";

export const getTableHistories = async (params) => {
  const response = await api.get(BASE_URL, { params });
  return response.data;
};
