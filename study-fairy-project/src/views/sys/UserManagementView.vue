<template>
  <div class="admin-container">
    <PageTitle>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </template>
    </PageTitle>

    <!-- 사용자 등록 폼 섹션 -->
    <section class="card-section">
      <div class="card-header">
        <h2 class="section-title">새 사용자 등록</h2>
      </div>
      <form @submit.prevent="handleRegister">
        <div class="form-grid">
          <div class="form-group full-width">
            <label for="userId">사용자 ID *</label>
            <input
              type="text"
              id="userId"
              v-model="newUser.userId"
              placeholder="예: user_01, gildong@example.com"
              required
              :disabled="isSubmitting"
            />
            <p class="input-hint">
              ID는 중복될 수 없으며 필수 입력 사항입니다.
            </p>
          </div>
        </div>
        <button
          type="submit"
          class="btn-primary"
          :disabled="isSubmitting || !newUser.userId"
        >
          {{ isSubmitting ? "등록 중..." : "사용자 추가" }}
        </button>
      </form>
    </section>

    <!-- 사용자 리스트 테이블 섹션 -->
    <section class="card-section list-section">
      <div class="card-header list-header">
        <h2 class="section-title">등록된 사용자 목록</h2>
        <span class="badge">{{ users.length }}명</span>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID (PK)</th>
              <th>사용자 ID</th>
              <th>생성자</th>
              <th>생성일시</th>
              <th>수정일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td class="font-bold">{{ user.userId }}</td>
              <td>{{ user.createdBy || "-" }}</td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>{{ formatDate(user.changedAt) }}</td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="5" class="empty-state">등록된 사용자가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/service/api";
import PageTitle from "@/components/PageTitle.vue";

const authStore = useAuthStore();
const isSubmitting = ref(false);
const users = ref([]);

const newUser = ref({
  userId: "",
});

// 초기 데이터 로드 (Mock 데이터 예시)
onMounted(() => {
  fetchUsers();
});

const fetchUsers = async () => {
  try {
    const response = await api.get("/users");
    users.value = response.data;
  } catch (error) {
    console.error("사용자 목록 로드 오류:", error);
  }
};

const handleRegister = async () => {
  if (!newUser.value.userId) return;
  isSubmitting.value = true;
  try {
    await api.post("/users", {
      userId: newUser.value.userId,
      createdBy: authStore.user?.id || "SYSTEM",
      changedBy: authStore.user?.id || "SYSTEM",
    });
    newUser.value.userId = "";
    alert("사용자가 성공적으로 등록되었습니다.");
    await fetchUsers(); // 목록 새로고침
  } catch (error) {
    const message = error.response?.data?.message || "등록 실패";
    alert(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
/* UserManagementView에만 적용되는 고유 스타일 */
.input-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.4rem;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.badge {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.table-container {
  overflow-x: auto;
}
.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: #94a3b8;
}
.data-table tr:hover td {
  background-color: #f8fafc;
}
</style>
