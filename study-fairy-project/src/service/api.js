import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import router from "@/router";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 (Request Interceptor)
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    if (token) {
      // 헤더에 토큰 추가
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request headers:", config.headers.Authorization);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 (Response Interceptor)
api.interceptors.response.use(
  (response) => {
    // 응답이 성공적일 때의 로직
    return response;
  },
  (error) => {
    // 응답이 에러일 때의 로직
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      // 인증 실패 시 (토큰 만료 등)
      authStore.logout(); // Pinia 스토어의 상태 및 sessionStorage 초기화

      // 로그인 페이지로 리디렉션
      // 사용자가 다시 로그인한 후 원래 가려던 페이지로 보낼 수 있도록
      // 현재 경로를 쿼리 파라미터로 추가할 수 있습니다.
      router.push({
        path: "/login",
        query: { returnUrl: router.currentRoute.value.fullPath },
      });

      console.warn("인증 실패(401): 토큰이 만료되었거나 유효하지 않습니다.");
    }

    return Promise.reject(error);
  },
);

export default api;
