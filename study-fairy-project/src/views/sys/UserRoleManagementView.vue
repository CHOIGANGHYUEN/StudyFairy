<template>
  <div class="admin-container list-layout">
    <UserRoleForm
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      :roles="roles"
      v-model:formData="form"
      @submit="handleSubmit"
      @reset="resetForm"
    />

    <div class="card flex-1 flex flex-col min-h-0 mb-0">
      <div class="overflow-y-auto flex-1 p-0">
        <UserRoleList
          :mappings="mappings"
          :is-submitting="isSubmitting"
          :total-count="totalCount"
          @edit="editMapping"
          @delete="deleteMapping"
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
import UserRoleForm from "@/components/sys/role/UserRoleForm.vue";
import UserRoleList from "@/components/sys/role/UserRoleList.vue";
import Pagination from "@/components/Pagination.vue";
import { useUserRoleManagement } from "@/composables/sys/role/useUserRoleManagement";

const {
  currentPage,
  totalPages,
  totalCount,
  isSubmitting,
  isEditMode,
  mappings,
  roles,
  form,
  handlePageChange,
  handleSubmit,
  editMapping,
  deleteMapping,
  resetForm,
} = useUserRoleManagement();
</script>

<style scoped>
/* Page-specific layout styles can remain here */
</style>
