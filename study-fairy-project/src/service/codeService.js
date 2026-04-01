import api from "@/service/api";

export const getCodeCategories = (categoryCode, groupCode) =>
  api.get(`/codes/items/${categoryCode}/${groupCode}`);
export const initializeCategories = () =>
  api.post("/codes/initialize-categories");
export const getCodeHeads = (categoryCode) =>
  api.get(`/codes/heads/${categoryCode}`);
export const getCodeItems = (categoryCode, groupCode) =>
  api.get(`/codes/items/${categoryCode}/${groupCode}`);
export const createCodeHead = (data) => api.post("/codes/heads", data);
export const updateCodeHead = (categoryCode, groupCode, data) =>
  api.put(`/codes/heads/${categoryCode}/${groupCode}`, data);
export const deleteCodeHead = (categoryCode, groupCode) =>
  api.delete(`/codes/heads/${categoryCode}/${groupCode}`);
export const createCodeItem = (data) => api.post("/codes/items", data);
export const updateCodeItem = (categoryCode, groupCode, subCode, data) =>
  api.put(`/codes/items/${categoryCode}/${groupCode}/${subCode}`, data);
export const deleteCodeItem = (categoryCode, groupCode, subCode) =>
  api.delete(`/codes/items/${categoryCode}/${groupCode}/${subCode}`);
