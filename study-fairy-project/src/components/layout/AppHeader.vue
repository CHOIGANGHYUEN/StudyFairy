<template>
  <header class="app-header">
    <div class="logo" @click="goToHome">🧚 Study Fairy</div>
    <div class="user-info">
      <!-- 상태 관리 스토어의 accessToken 여부로 로그인 상태 표시 -->
      <span v-if="authStore.accessToken" class="status logged-in">
        <img
          v-if="authStore.user?.picture"
          :src="authStore.user.picture"
          alt="프로필"
          class="avatar"
        />
        <span class="dot green" v-else></span>
        <span class="user-name">{{ authStore.user?.name || "사용자" }} 님</span>
        <span class="role-badge" v-if="authStore.user?.roles?.length">{{
          authStore.user.roles[0]
        }}</span>
        <button @click="handleLogout" class="btn-logout ml-2">로그아웃</button>
      </span>
      <!-- router-link 대신 button으로 변경하여 직접 로그인 함수 호출 -->
      <button v-else @click="goToLogin" class="btn btn-primary">로그인</button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const goToHome = () => {
  router.push("/");
};

const goToLogin = () => {
  router.push("/login");
};

const handleLogout = () => {
  // 스토어 상태 초기화
  authStore.setAccessToken(null);
  // 사용자 정보가 있다면 함께 초기화 (필요시)
  if (authStore.user) authStore.user = null;

  // 로컬 스토리지 데이터 초기화
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_expires_at");

  toast.success("로그아웃 되었습니다.");
  router.push("/login");
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

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.user-name {
  font-weight: 700;
  color: #1e293b;
}

.role-badge {
  font-size: 0.65rem;
  background-color: #f3e8ff;
  color: #7e22ce;
  padding: 0.15rem 0.4rem;
  border-radius: 0.375rem;
  font-weight: 800;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-logout {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-logout:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}
.ml-2 {
  margin-left: 0.75rem;
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .app-header {
    padding: 1rem;
  }
  .user-name,
  .role-badge {
    display: none;
  }
}
</style>
