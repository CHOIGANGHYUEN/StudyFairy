import api from "@/service/api";

export const getSchedules = (params) => api.get("/schedules", { params });
export const getScheduleMinMax = (params) =>
  api.get("/schedules/min-max", { params });
export const createSchedule = (data) => api.post("/schedules", data);
export const createScheduleBulk = (data) => api.post("/schedules/bulk", data);
export const updateSchedule = (id, data) => api.put(`/schedules/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`);
export const getScheduleDetails = (params) =>
  api.get("/schedule-details", { params });
