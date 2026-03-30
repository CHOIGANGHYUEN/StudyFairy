import api from "./api";

export const getMatClasses = (params = {}) =>
  api.get("/mat-classes", { params });
export const getMatClassById = (id) => api.get(`/mat-classes/${id}`);
export const createMatClass = (data) => api.post("/mat-classes", data);
export const updateMatClass = (id, data) => api.put(`/mat-classes/${id}`, data);
export const deleteMatClass = (id) => api.delete(`/mat-classes/${id}`);
