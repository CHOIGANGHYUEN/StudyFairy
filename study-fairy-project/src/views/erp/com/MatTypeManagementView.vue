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
import { ref, onMounted, computed } from "vue";
import PageTitle from "@/components/PageTitle.vue";
import MatTypeList from "@/components/erp/com/MatTypeList.vue";
import MatTypeForm from "@/components/erp/com/MatTypeForm.vue";
import * as matTypeService from "@/service/matTypeService";
import Modal from "@/components/layout/Modal.vue";

const matTypes = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const isFormVisible = ref(false);
const selectedMatType = ref(null);

const formTitle = computed(() =>
  selectedMatType.value?.id ? "자재 유형 수정" : "자재 유형 생성",
);

onMounted(fetchMatTypes);

async function fetchMatTypes() {
  isLoading.value = true;
  try {
    const response = await matTypeService.getMatTypes();
    matTypes.value = response.data;
  } catch (error) {
    console.error("자재 유형 목록 조회 실패:", error);
    alert("데이터를 불러오는 데 실패했습니다.");
  } finally {
    isLoading.value = false;
  }
}

function openFormModal(matType = null) {
  selectedMatType.value = matType ? { ...matType } : {};
  isFormVisible.value = true;
}

function closeFormModal() {
  isFormVisible.value = false;
  selectedMatType.value = null;
}

async function handleSave(formData) {
  isSubmitting.value = true;
  try {
    if (formData.id) {
      await matTypeService.updateMatType(formData.id, formData);
      alert("자재 유형이 성공적으로 수정되었습니다.");
    } else {
      await matTypeService.createMatType(formData);
      alert("자재 유형이 성공적으로 생성되었습니다.");
    }
    closeFormModal();
    await fetchMatTypes();
  } catch (error) {
    console.error("저장 실패:", error);
    alert(error.response?.data?.message || "저장에 실패했습니다.");
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete(id) {
  if (!confirm("정말로 이 자재 유형을 삭제하시겠습니까?")) return;
  try {
    await matTypeService.deleteMatType(id);
    alert("삭제되었습니다.");
    await fetchMatTypes();
  } catch (error) {
    console.error("삭제 실패:", error);
    alert(error.response?.data?.message || "삭제에 실패했습니다.");
  }
}
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
