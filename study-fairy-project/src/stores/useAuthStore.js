import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    // sessionStorage에서 가져오거나 null로 초기화
    accessToken: sessionStorage.getItem("accessToken"),
    user: JSON.parse(sessionStorage.getItem("user")),
    returnUrl: null,
  }),
  actions: {
    setAccessToken(token) {
      this.accessToken = token;
      if (token) {
        sessionStorage.setItem("accessToken", token);
      } else {
        sessionStorage.removeItem("accessToken");
      }
    },
    login(user, token) {
      this.user = user;
      this.accessToken = token;
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("accessToken", token);
    },
    logout() {
      this.user = null;
      this.accessToken = null;
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("accessToken");
    },
  },
});
