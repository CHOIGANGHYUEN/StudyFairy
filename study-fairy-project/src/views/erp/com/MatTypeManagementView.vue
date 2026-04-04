<template>
  <div class="management-container">
    <PageTitle title="자재 유형 관리" />

    <div class="controls">
      <button @click="openFormModal()" class="btn-primary">
        새 자재 유형 추가
      </button>
    </div>

    <MatTypeList
      :mat-types="matTypes"
      @edit-item="openFormModal"
      @delete-item="handleDelete"
      :is-loading="isLoading"
    />

    <Modal v-if="isFormVisible" @close="closeFormModal">
      <template #header>
        <h3>{{ formTitle }}</h3>
      </template>
      <template #body>
        <MatTypeForm
          :mat-type-data="selectedMatType"
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
import MatTypeList from "@/components/erp/com/MatTypeList.vue";
import MatTypeForm from "@/components/erp/com/MatTypeForm.vue";
import Modal from "@/components/layout/Modal.vue";
import { useMatTypeManagement } from "@/composables/erp/com/useMatTypeManagement";

const {
  matTypes,
  isLoading,
  isSubmitting,
  isFormVisible,
  selectedMatType,
  formTitle,
  openFormModal,
  closeFormModal,
  handleSave,
  handleDelete,
} = useMatTypeManagement();
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
