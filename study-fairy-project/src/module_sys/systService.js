/**
 * module_sys 전용 공통 서비스 (API 호출)
 */
import api from "@/service/api";

// 사용자 관리 (syst001)
export const getUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// 권한 관리 (syst002)
export const getRoles = () => api.get("/roles");
export const getRoleById = (id) => api.get(`/roles/${id}`);
export const createRole = (data) => api.post("/roles", data);
export const updateRole = (id, data) => api.put(`/roles/${id}`, data);
export const deleteRole = (id) => api.delete(`/roles/${id}`);

export const getUserRoles = () => api.get("/user-roles");
export const getUserRoleById = (id) => api.get(`/user-roles/${id}`);
export const createUserRole = (data) => api.post("/user-roles", data);
export const updateUserRole = (id, data) => api.put(`/user-roles/${id}`, data);
export const deleteUserRole = (id) => api.delete(`/user-roles/${id}`);

export const getMenuRoles = () => api.get("/role-menus");
export const getMenuRoleById = (id) => api.get(`/role-menus/${id}`);
export const createMenuRole = (data) => api.post("/role-menus", data);
export const updateMenuRole = (id, data) => api.put(`/role-menus/${id}`, data);
export const deleteMenuRole = (id) => api.delete(`/role-menus/${id}`);

// 메뉴 관리 (syst003)
export const getMenus = () => api.get("/menus");
export const getMenuById = (id) => api.get(`/menus/${id}`);
export const createMenu = (data) => api.post("/menus", data);
export const updateMenu = (id, data) => api.put(`/menus/${id}`, data);
export const deleteMenu = (id) => api.delete(`/menus/${id}`);

// 테이블 관리 (syst004)
export const getTables = (dbms, langu) =>
  api.get(`/tables?dbms=${dbms}&langu=${langu}`);
export const getTableById = (tablen, dbms, langu) =>
  api.get(`/tables/${tablen}?dbms=${dbms}&langu=${langu}`);
export const saveTable = (data) => api.post("/tables", data);
export const deleteTable = (tablen) => api.delete(`/tables/${tablen}`);
export const executeSql = (data) => api.post("/tables/execute-sql", data);
