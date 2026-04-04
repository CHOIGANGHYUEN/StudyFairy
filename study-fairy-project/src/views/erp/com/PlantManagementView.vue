<template>
  <div class="management-container">
    <PageTitle title="플랜트(Plant) 관리" />
    <div class="controls">
      <button @click="openFormModal()" class="btn-primary">
        새 플랜트 추가
      </button>
    </div>
    <PlantList
      :plants="plants"
      @edit-item="openFormModal"
      @copy-item="openCopyModal"
      @delete-item="handleDelete"
      :is-loading="isLoading"
    />
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @update:current-page="currentPage = $event"
    />

    <Modal v-if="isFormVisible" @close="closeFormModal">
      <template #header>
        <h3>{{ formTitle }}</h3>
      </template>
      <template #body>
        <PlantForm
          :plant-data="selectedPlant"
          :companies="companies"
          :languages="languages"
          :is-copy-mode="isCopyMode"
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
import PlantList from "@/components/erp/com/PlantList.vue";
import PlantForm from "@/components/erp/com/PlantForm.vue";
import Modal from "@/components/layout/Modal.vue";
import Pagination from "@/components/Pagination.vue";
import { usePlantManagement } from "@/composables/erp/com/usePlantManagement";

const {
  plants,
  companies,
  languages,
  currentPage,
  totalPages,
  isLoading,
  isSubmitting,
  isFormVisible,
  isCopyMode,
  selectedPlant,
  formTitle,
  openFormModal,
  openCopyModal,
  closeFormModal,
  handleSave,
  handleDelete,
} = usePlantManagement();
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
