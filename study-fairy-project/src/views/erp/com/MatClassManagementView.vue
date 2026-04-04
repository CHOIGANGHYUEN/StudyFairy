<template>
  <div class="admin-container management-container">
    <PageTitle title="자재 분류 관리" />

    <div class="controls">
      <button @click="openFormModal()" class="btn-primary">
        새 자재 분류 추가
      </button>
    </div>

    <MatClassList
      :mat-classes="matClasses"
      @edit-item="openFormModal"
      @delete-item="handleDelete"
      :is-loading="isLoading"
    />

    <Modal v-if="isFormVisible" @close="closeFormModal">
      <template #header>
        <h3>{{ formTitle }}</h3>
      </template>
      <template #body>
        <MatClassForm
          :mat-class-data="selectedMatClass"
          :mat-classes="matClasses"
          :is-submitting="isSubmitting"
          @save="handleSave"
          @cancel="closeFormModal"
        />
      </template>
    </Modal>
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import MatClassList from "@/components/erp/com/MatClassList.vue";
import MatClassForm from "@/components/erp/com/MatClassForm.vue";
import Modal from "@/components/layout/Modal.vue";
import { useMatClassManagement } from "@/composables/erp/com/useMatClassManagement";

const {
  matClasses,
  isLoading,
  isSubmitting,
  isFormVisible,
  selectedMatClass,
  formTitle,
  openFormModal,
  closeFormModal,
  handleSave,
  handleDelete,
} = useMatClassManagement();
</script>

<style scoped>
.management-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.controls {
  display: flex;
  justify-content: flex-end;
}
</style>
