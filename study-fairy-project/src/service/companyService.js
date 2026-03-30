import api from './api';

const BASE_URL = '/companies';

export const getCompanies = () => {
    return api.get(BASE_URL);
};

export const getCompanyById = (id) => {
    return api.get(`${BASE_URL}/${id}`);
};

export const createCompany = (companyData) => {
    return api.post(BASE_URL, companyData);
};

export const updateCompany = (id, companyData) => {
    return api.put(`${BASE_URL}/${id}`, companyData);
};

export const deleteCompany = (id) => {
    return api.delete(`${BASE_URL}/${id}`);
};
