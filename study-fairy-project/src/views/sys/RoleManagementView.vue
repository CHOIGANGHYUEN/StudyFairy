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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </template>
    </PageTitle>

    <RoleForm
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      v-model:formData="form"
      @submit="handleSubmit"
      @reset="resetForm"
    />

    <section class="card-section search-section">
      <div class="search-grid">
        <div class="form-group">
          <label for="searchRoleId">권한 ID</label>
          <input
            type="text"
            id="searchRoleId"
            v-model="searchParams.roleId"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="form-group">
          <label for="searchDescription">설명</label>
          <input
            type="text"
            id="searchDescription"
            v-model="searchParams.description"
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

    <RoleList
      :roles="roles"
      :is-submitting="isSubmitting"
      :total-count="totalCount"
      :current-page="currentPage"
      :total-pages="totalPages"
      @edit="editRole"
      @delete="deleteRole"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import RoleForm from "@/components/sys/role/RoleForm.vue";
import RoleList from "@/components/sys/role/RoleList.vue";
import { useRoleManagement } from "@/composables/useRoleManagement";

const {
  isSubmitting,
  isEditMode,
  roles,
  form,
  searchParams,
  currentPage,
  totalPages,
  totalCount,
  handleSubmit,
  editRole,
  deleteRole,
  resetForm,
  handleSearch,
  handlePageChange,
} = useRoleManagement();
</script>

<style scoped>
.icon {
  color: #8b5cf6;
}
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
