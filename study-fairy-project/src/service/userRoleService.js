import api from "@/service/api";

export const getUserRoles = (params) => api.get("/user-roles", { params });
export const createUserRole = (data) => api.post("/user-roles", data);
export const updateUserRole = (id, data) => api.put(`/user-roles/${id}`, data);
export const deleteUserRole = (id) => api.delete(`/user-roles/${id}`);
