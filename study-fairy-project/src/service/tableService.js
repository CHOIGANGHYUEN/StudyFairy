import api from "@/service/api";

const BASE_URL = "/tables";

export const getTables = (langu = "KO") =>
  api.get(BASE_URL, { params: { langu } });
export const getTableDetails = (tablen, langu = "KO") =>
  api.get(`${BASE_URL}/${tablen}`, { params: { langu } });
export const saveTableSpec = (tableData) => api.post(BASE_URL, tableData);
export const deleteTableSpec = (tablen) => api.delete(`${BASE_URL}/${tablen}`);
export const executeTableScript = (data) =>
  api.post(`${BASE_URL}/execute`, data);
