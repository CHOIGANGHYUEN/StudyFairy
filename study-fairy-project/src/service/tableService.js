import api from "@/service/api";

const BASE_URL = "/tables";

export const getTables = async () => {
  const response = await api.get(BASE_URL);
  return response.data;
};

export const saveTableSpec = async (tableData) => {
  const response = await api.post(BASE_URL, tableData);
  return response.data;
};
