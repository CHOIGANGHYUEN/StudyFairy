<template>
  <div class="admin-container list-layout">
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

    <!-- 사용자 등록 폼 (기존 UserForm) -->
    <section class="card-section">
      <div class="card-header">
        <h2 class="section-title">새 사용자 등록</h2>
      </div>
      <form @submit.prevent="submitForm">
        <div class="form-grid">
          <div class="form-group full-width">
            <label for="userId">사용자 ID *</label>
            <input
              type="text"
              id="userId"
              v-model="localUserId"
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
          :disabled="isSubmitting || !localUserId"
        >
          {{ isSubmitting ? "등록 중..." : "사용자 추가" }}
        </button>
      </form>
    </section>

    <div class="card flex-1 flex flex-col min-h-0 mb-0">
      <div class="overflow-y-auto flex-1 p-0">
        <!-- 사용자 목록 (기존 UserList) -->
        <section class="card-section list-section">
          <div class="card-header list-header">
            <h2 class="section-title">등록된 사용자 목록</h2>
            <span class="badge badge-blue">{{ paginatedUsers.length }}명</span>
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
                <tr v-for="user in paginatedUsers" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td class="font-bold">{{ user.userId }}</td>
                  <td>{{ user.createdBy || "-" }}</td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>{{ formatDate(user.changedAt) }}</td>
                </tr>
                <tr v-if="paginatedUsers.length === 0">
                  <td colspan="5" class="empty-state">
                    등록된 사용자가 없습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <div class="border-t p-4 flex justify-center bg-white rounded-b-sm">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @update:current-page="currentPage = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PageTitle from "@/components/PageTitle.vue";
import Pagination from "@/components/Pagination.vue";
import { useUserManagement } from "@/composables/sys/user/useUserManagement";

const {
  isSubmitting,
  currentPage,
  totalPages,
  paginatedUsers,
  handleRegister,
} = useUserManagement();

const localUserId = ref("");

const submitForm = () => {
  handleRegister(localUserId.value);
  localUserId.value = "";
};

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.data-table tr:hover td {
  background-color: #f8fafc;
}
</style>
