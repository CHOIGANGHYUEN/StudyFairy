import api from "@/service/api";

const BASE_URL = "/units";

export const getUnits = () => {
  return api.get(BASE_URL);
};

export const getUnitById = (id) => {
  return api.get(`${BASE_URL}/${id}`);
};

export const createUnit = (unitData) => {
  return api.post(BASE_URL, unitData);
};

export const updateUnit = (id, unitData) => {
  return api.put(`${BASE_URL}/${id}`, unitData);
};

export const deleteUnit = (id) => {
  return api.delete(`${BASE_URL}/${id}`);
};
