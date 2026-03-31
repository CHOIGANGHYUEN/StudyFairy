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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      </template>
    </PageTitle>

    <MenuRoleForm
      v-model="form"
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      :roles="roles"
      :menus="menus"
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
          <label for="searchMenuId">메뉴 ID</label>
          <input
            type="text"
            id="searchMenuId"
            v-model="searchParams.menuId"
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

    <MenuRoleList
      :mappings="mappings"
      :is-submitting="isSubmitting"
      :total-count="totalCount"
      :current-page="currentPage"
      :total-pages="totalPages"
      :format-date="formatDate"
      @copy="copyMapping"
      @edit="editMapping"
      @delete="deleteMapping"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import MenuRoleForm from "@/components/sys/menu-role/MenuRoleForm.vue";
import MenuRoleList from "@/components/sys/menu-role/MenuRoleList.vue";
import { useMenuRoleManagement } from "@/composables/useMenuRoleManagement";

const {
  isSubmitting,
  isEditMode,
  mappings,
  roles,
  menus,
  form,
  searchParams,
  currentPage,
  totalPages,
  totalCount,
  handleSubmit,
  copyMapping,
  editMapping,
  deleteMapping,
  resetForm,
  handleSearch,
  handlePageChange,
  formatDate,
} = useMenuRoleManagement();
</script>

<style scoped>
.icon {
  color: #3b82f6;
  width: 1.5rem;
  height: 1.5rem;
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
