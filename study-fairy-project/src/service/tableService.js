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

export const deleteTableSpec = async (tablen) => {
  const response = await api.delete(`${BASE_URL}/${tablen}`);
  return response.data;
};

export const executeTableScript = async ({ tablen, script }) => {
  const response = await api.post(`${BASE_URL}/execute`, { tablen, script });
  return response.data;
};
