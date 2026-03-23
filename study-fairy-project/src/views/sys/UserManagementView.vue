<template>
  <div class="admin-container">
    <header class="page-header">
      <h1 class="page-title">
        <div class="icon-wrapper">
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
        </div>
        사용자 관리
      </h1>
      <p class="page-subtitle">시스템 이용자를 등록하고 관리합니다.</p>
    </header>

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
            <p class="input-hint">ID는 중복될 수 없으며 필수 입력 사항입니다.</p>
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

const authStore = useAuthStore();
const isSubmitting = ref(false);
const users = ref([]); // 실제로는 API에서 불러올 데이터

const newUser = ref({
  userId: "",
});

// 초기 데이터 로드 (Mock 데이터 예시)
onMounted(() => {
  fetchUsers();
});

const fetchUsers = async () => {
  // TODO: 실제 API 연동 시 아래 로직 교체
  // const response = await axios.get('/api/users');
  // users.value = response.data;

  // 임시 데이터
  users.value = [
    {
      id: 1,
      userId: "admin",
      createdBy: "SYSTEM",
      createdAt: new Date(),
      changedAt: new Date(),
    },
  ];
};

const handleRegister = async () => {
  if (!newUser.value.userId) return;

  isSubmitting.value = true;

  try {
    // DB 명세에 따른 데이터 객체 구성
    const registrationData = {
      userId: newUser.value.userId,
      createdBy: "ADMIN", // 실제로는 현재 로그인된 유저 정보 사용
      createdAt: new Date().toISOString(),
      changedBy: "ADMIN",
      changedAt: new Date().toISOString(),
    };

    console.log("등록 요청 데이터:", registrationData);

    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 성공 시 리스트 업데이트
    users.value.push({
      id: users.value.length + 1,
      ...registrationData,
    });

    // 폼 초기화
    newUser.value.userId = "";
    alert("사용자가 성공적으로 등록되었습니다.");
  } catch (error) {
    alert("등록 중 오류가 발생했습니다.");
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
.icon-wrapper {
  padding: 0.5rem;
  background-color: #f1f5f9;
  border-radius: 0.75rem;
}
.page-subtitle {
  color: #64748b;
  margin-top: 0.5rem;
  margin-left: 3.25rem; /* 아이콘 너비 + gap */
}
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
