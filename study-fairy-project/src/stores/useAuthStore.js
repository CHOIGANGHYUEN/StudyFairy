import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    credential: null,
    accessToken: null,
  }),
  actions: {
    setCredential(credential) {
      this.credential = credential;
    },
    setAccessToken(accessToken) {
      this.accessToken = accessToken;
    }
  },
});
