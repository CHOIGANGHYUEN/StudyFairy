import api from "@/service/api";

export const getMenus = () => api.get("/menus");
export const createMenu = (data) => api.post("/menus", data);
export const updateMenu = (id, data) => api.put(`/menus/${id}`, data);
export const deleteMenu = (id) => api.delete(`/menus/${id}`);
