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
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </template>
    </PageTitle>

    <ScheduleForm
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      :form-data="form"
      :sys001-items="sys001Items"
      :sys002-items="sys002Items"
      :year-options="yearOptions"
      @submit="handleSubmit"
      @reset="resetForm"
    />

    <ScheduleSearch
      :search-params="searchParams"
      :sys001-items="sys001Items"
      :year-options="yearOptions"
      :min-sch-date="minSchDate"
      :max-sch-date="maxSchDate"
      @search="handleSearch"
    />

    <ScheduleList
      :schedules="schedules"
      :is-submitting="isSubmitting"
      :current-page="currentPage"
      :total-pages="totalPages"
      @edit="editSchedule"
      @delete="deleteSchedule"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import ScheduleForm from "@/components/sys/schedule/ScheduleForm.vue";
import ScheduleSearch from "@/components/sys/schedule/ScheduleSearch.vue";
import ScheduleList from "@/components/sys/schedule/ScheduleList.vue";
import { useScheduleManagement } from "@/composables/sys/schedule/useScheduleManagement";

const {
  currentPage,
  totalPages,
  isSubmitting,
  isEditMode,
  yearOptions,
  schedules,
  sys001Items,
  sys002Items,
  searchParams,
  minSchDate,
  maxSchDate,
  form,
  handlePageChange,
  handleSearch,
  handleSubmit,
  editSchedule,
  deleteSchedule,
  resetForm,
} = useScheduleManagement();
</script>

<style scoped>
.icon {
  color: #f59e0b;
  width: 1.5rem;
  height: 1.5rem;
}
</style>
