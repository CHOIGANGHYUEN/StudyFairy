<template>
  <div class="admin-container list-layout">
    <PageTitle title="회사 관리" />
    <CompanyForm
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      v-model:formData="form"
      :available-languages="languages"
      @submit="handleSubmit"
      @reset="resetForm"
    />

    <div class="card flex-1 flex flex-col min-h-0 mb-0">
      <div class="overflow-y-auto flex-1 p-0">
        <CompanyList
          :companies="paginatedCompanies"
          :is-submitting="isSubmitting"
          @edit="handleEdit"
          @delete="handleDelete"
        />
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
import PageTitle from "@/components/PageTitle.vue";
import CompanyForm from "@/components/sys/company/CompanyForm.vue";
import CompanyList from "@/components/sys/company/CompanyList.vue";
import Pagination from "@/components/Pagination.vue";
import { useCompanyManagement } from "@/composables/erp/com/useCompanyManagement";
const {
  isSubmitting,
  isEditMode,
  form,
  languages,
  currentPage,
  totalPages,
  paginatedCompanies,
  handleSubmit,
  handleEdit,
  handleDelete,
  resetForm,
} = useCompanyManagement();
</script>

<style scoped>
/* Page-specific layout styles can remain here */
</style>
