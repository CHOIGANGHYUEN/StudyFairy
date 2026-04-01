import api from "@/service/api";

export const loginWithGoogle = (accessToken) => {
  return api.post("/auth/google/login", { accessToken });
};
