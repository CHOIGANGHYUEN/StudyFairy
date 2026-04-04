import api from "@/service/api";

const BASE_URL = "/mat-types";

export const getMatTypes = (params) => api.get(BASE_URL, { params });
export const getMatTypeById = (id) => api.get(`${BASE_URL}/${id}`);
export const createMatType = (data) => api.post(BASE_URL, data);
export const updateMatType = (id, data) => api.put(`${BASE_URL}/${id}`, data);
export const deleteMatType = (id) => api.delete(`${BASE_URL}/${id}`);
