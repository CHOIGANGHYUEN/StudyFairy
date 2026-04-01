import api from "@/service/api";

export const getRoleMenus = () => api.get("/role-menus");
export const createRoleMenu = (data) => api.post("/role-menus", data);
export const updateRoleMenu = (id, data) => api.put(`/role-menus/${id}`, data);
export const deleteRoleMenu = (id) => api.delete(`/role-menus/${id}`);
