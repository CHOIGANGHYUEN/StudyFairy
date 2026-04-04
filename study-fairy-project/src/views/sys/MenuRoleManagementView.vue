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
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      :roles="roles"
      :menus="menus"
      :form-data="form"
      @submit="handleSubmit"
      @reset="resetForm"
    />

    <MenuRoleList
      :mappings="mappings"
      :is-submitting="isSubmitting"
      @copy="copyMapping"
      @edit="editMapping"
      @delete="deleteMapping"
    />
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import MenuRoleForm from "@/components/sys/role/MenuRoleForm.vue";
import MenuRoleList from "@/components/sys/role/MenuRoleList.vue";
import { useMenuRoleManagement } from "@/composables/sys/role/useMenuRoleManagement";

const {
  isSubmitting,
  isEditMode,
  mappings,
  roles,
  menus,
  form,
  handleSubmit,
  copyMapping,
  editMapping,
  deleteMapping,
  resetForm,
} = useMenuRoleManagement();
</script>

<style scoped>
.icon {
  color: #3b82f6;
  width: 1.5rem;
  height: 1.5rem;
}
</style>
