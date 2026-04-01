import api from "@/service/api";

export const generateSummary = (data) => {
  return api.post("/summary", data);
};
