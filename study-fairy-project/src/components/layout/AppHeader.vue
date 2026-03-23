<template>
  <header class="app-header">
    <div class="logo" @click="goToHome">🧚 Study Fairy</div>
    <div class="user-info">
      <!-- 상태 관리 스토어의 accessToken 여부로 로그인 상태 표시 -->
      <span v-if="authStore.accessToken" class="status logged-in">
        <span class="dot green"></span> 로그인됨
      </span>
      <!-- router-link 대신 button으로 변경하여 직접 로그인 함수 호출 -->
      <button v-else @click="handleLogin" class="btn">로그인</button>
    </div>
  </header>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";

const router = useRouter();
const authStore = useAuthStore();
let tokenClient;

const goToHome = () => {
  router.push("/");
};

// 컴포넌트 마운트 시 구글 로그인 클라이언트 초기화
onMounted(() => {
  if (window.google) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope:
        "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/documents",
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          console.log(
            "🔥 로그인 성공! 액세스 토큰:",
            tokenResponse.access_token,
          );
          authStore.setAccessToken(tokenResponse.access_token);
          // 로그인 성공 후 요약 페이지로 자동 이동
          router.push("/summary");
        }
      },
    });
  } else {
    console.error("Google Identity Services 스크립트가 로드되지 않았습니다.");
  }
});

// 로그인 버튼 클릭 시 실행
const handleLogin = () => {
  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else {
    alert("구글 로그인 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
  }
};
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  cursor: pointer;
  color: #2563eb;
  user-select: none;
}

.user-info {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #334155;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot.green {
  background-color: #10b981;
}
</style>
