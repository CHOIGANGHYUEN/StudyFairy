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
import { ref, onMounted, computed } from "vue";
import PageTitle from "@/components/PageTitle.vue";
import MatClassList from "@/components/erp/com/MatClassList.vue";
import MatClassForm from "@/components/erp/com/MatClassForm.vue";
import * as matClassService from "@/service/matClassService";
import Modal from "@/components/layout/Modal.vue";

const matClasses = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const isFormVisible = ref(false);
const selectedMatClass = ref(null);

const formTitle = computed(() =>
  selectedMatClass.value?.id ? "자재 분류 수정" : "자재 분류 생성",
);

onMounted(fetchMatClasses);

async function fetchMatClasses() {
  isLoading.value = true;
  try {
    const response = await matClassService.getMatClasses();
    matClasses.value = response.data;
  } catch (error) {
    console.error("자재 분류 목록 조회 실패:", error);
  } finally {
    isLoading.value = false;
  }
}

function openFormModal(matClass = null) {
  selectedMatClass.value = matClass ? { ...matClass } : {};
  isFormVisible.value = true;
}

function closeFormModal() {
  isFormVisible.value = false;
  selectedMatClass.value = null;
}

async function handleSave(formData) {
  isSubmitting.value = true;
  try {
    if (formData.id) {
      await matClassService.updateMatClass(formData.id, formData);
      alert("자재 분류가 성공적으로 수정되었습니다.");
    } else {
      await matClassService.createMatClass(formData);
      alert("자재 분류가 성공적으로 생성되었습니다.");
    }
    closeFormModal();
    await fetchMatClasses();
  } catch (error) {
    console.error("저장 실패:", error);
    alert(error.response?.data?.message || "저장에 실패했습니다.");
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete(id) {
  if (
    !confirm(
      "정말로 이 자재 분류를 삭제하시겠습니까? (하위 분류가 있다면 문제가 발생할 수 있습니다.)",
    )
  )
    return;
  try {
    await matClassService.deleteMatClass(id);
    alert("삭제되었습니다.");
    await fetchMatClasses();
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
