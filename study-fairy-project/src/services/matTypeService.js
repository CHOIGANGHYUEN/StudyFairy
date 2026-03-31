import api from ".";

const BASE_URL = "/mat-types";

export const getMatTypes = (params) => {
  return api.get(BASE_URL, { params });
};

export const getMatTypeById = (id) => {
  return api.get(`${BASE_URL}/${id}`);
};

export const createMatType = (data) => {
  return api.post(BASE_URL, data);
};

export const updateMatType = (id, data) => {
  return api.put(`${BASE_URL}/${id}`, data);
};

export const deleteMatType = (id) => {
  return api.delete(`${BASE_URL}/${id}`);
};
