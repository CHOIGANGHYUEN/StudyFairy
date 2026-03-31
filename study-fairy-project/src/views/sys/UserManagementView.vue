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

    <UserForm
      v-model="newUser"
      :is-submitting="isSubmitting"
      @register="handleRegister"
    />

    <section class="card-section search-section">
      <div class="search-grid">
        <div class="form-group">
          <label for="searchUserId">사용자 ID</label>
          <input
            type="text"
            id="searchUserId"
            v-model="searchParams.userId"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="form-group">
          <label for="searchCreatedBy">생성자</label>
          <input
            type="text"
            id="searchCreatedBy"
            v-model="searchParams.createdBy"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>
      <div class="search-actions">
        <button class="btn-primary search-btn" @click="handleSearch">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon-sm"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          조회
        </button>
      </div>
    </section>

    <UserList
      :users="users"
      :total-count="totalCount"
      :current-page="currentPage"
      :total-pages="totalPages"
      :format-date="formatDate"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import UserForm from "@/components/sys/user/UserForm.vue";
import UserList from "@/components/sys/user/UserList.vue";
import { useUserManagement } from "@/composables/useUserManagement";

const {
  isSubmitting,
  users,
  newUser,
  searchParams,
  currentPage,
  totalPages,
  totalCount,
  handleRegister,
  handleSearch,
  handlePageChange,
  formatDate,
} = useUserManagement();
</script>

<style scoped>
.search-section {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
}
.search-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.search-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
.search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
}
.icon-sm {
  width: 1.2rem;
  height: 1.2rem;
}
</style>
