import api from "@/service/api";

const BASE_URL = "/companies";

export const getCompanies = () => api.get(BASE_URL);
export const getCompanyById = (id) => api.get(`${BASE_URL}/${id}`);
export const createCompany = (companyData) => api.post(BASE_URL, companyData);
export const updateCompany = (id, companyData) =>
  api.put(`${BASE_URL}/${id}`, companyData);
export const deleteCompany = (id) => api.delete(`${BASE_URL}/${id}`);
