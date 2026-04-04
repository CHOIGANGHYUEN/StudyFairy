import api from "@/service/api";

const BASE_URL = "/units";

export const getUnits = () => api.get(BASE_URL);
export const getUnitById = (id) => api.get(`${BASE_URL}/${id}`);
export const createUnit = (data) => api.post(BASE_URL, data);
export const updateUnit = (id, data) => api.put(`${BASE_URL}/${id}`, data);
export const deleteUnit = (id) => api.delete(`${BASE_URL}/${id}`);
