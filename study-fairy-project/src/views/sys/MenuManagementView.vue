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
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
      </template>
    </PageTitle>

    <MenuForm
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      v-model:formData="menuForm"
      :available-languages="availableLanguages"
      :flat-menus="flatMenus"
      @submit="handleRegisterOrUpdate"
      @reset="resetForm"
    />

    <div class="card flex-1 flex flex-col min-h-0 mb-0">
      <div class="overflow-y-auto flex-1 p-0">
        <MenuList
          :paginated-menus="paginatedMenus"
          :expanded-menus="expandedMenus"
          @toggle="toggleMenu"
          @edit="editMenu"
          @delete="deleteMenu"
        />
      </div>
      <div class="border-t p-4 flex justify-center bg-white rounded-b-sm">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @update:current-page="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import MenuForm from "@/components/sys/menu/MenuForm.vue";
import MenuList from "@/components/sys/menu/MenuList.vue";
import Pagination from "@/components/Pagination.vue";
import { useMenuManagement } from "@/composables/sys/menu/useMenuManagement";

const {
  isSubmitting,
  isEditMode,
  menuForm,
  availableLanguages,
  flatMenus,
  paginatedMenus,
  expandedMenus,
  currentPage,
  totalPages,
  handlePageChange,
  toggleMenu,
  handleRegisterOrUpdate,
  editMenu,
  resetForm,
} = useMenuManagement();
</script>

<style scoped>
/* Page-specific styles */
</style>
