<template>
  <div class="management-container">
    <PageTitle title="자재 유형 관리" />

    <div class="controls">
      <button @click="openFormModal()" class="btn-primary">
        새 자재 유형 추가
      </button>
    </div>

    <!-- 자재 유형 목록 (기존 MatTypeList) -->
    <section class="card-section">
      <div class="card-header">
        <h2 class="section-title">자재 유형 목록</h2>
      </div>
      <div v-if="isLoading" class="loading-state">데이터를 불러오는 중...</div>
      <div v-else-if="!matTypes.length" class="empty-state">
        등록된 자재 유형이 없습니다.
      </div>
      <div class="table-container" v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>자재 유형 코드</th>
              <th>자재 유형명</th>
              <th>조달 유형</th>
              <th>가격 제어</th>
              <th>사용 여부</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in matTypes" :key="item.id">
              <td>{{ item.matType }}</td>
              <td>{{ getMatTypeName(item) }}</td>
              <td>{{ item.procureType }}</td>
              <td>{{ item.priceCtrlType }}</td>
              <td>{{ item.useYn ? "Y" : "N" }}</td>
              <td class="action-buttons">
                <button @click="openFormModal(item)" class="btn-secondary">
                  수정
                </button>
                <button @click="handleDelete(item.id)" class="btn-danger">
                  삭제
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Modal v-if="isFormVisible" @close="closeFormModal">
      <template #header>
        <h3>{{ formTitle }}</h3>
      </template>
      <template #body>
        <!-- 자재 유형 폼 (기존 MatTypeForm) -->
        <form @submit.prevent="submitMatTypeForm" class="mat-type-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="matType">자재 유형 코드 *</label>
              <input
                id="matType"
                v-model="matTypeForm.matType"
                type="text"
                required
                :disabled="isEditMode"
              />
            </div>
            <div class="form-group">
              <label for="company">회사 ID *</label>
              <input
                id="company"
                v-model="matTypeForm.company"
                type="text"
                required
                :disabled="isEditMode"
              />
            </div>
            <div class="form-group">
              <label for="langu">언어 코드 *</label>
              <input
                id="langu"
                v-model="matTypeForm.langu"
                type="text"
                required
              />
              <p class="input-hint">
                수정 시, 해당 언어의 명칭/설명이 없으면 새로 추가됩니다.
              </p>
            </div>
            <div class="form-group">
              <label for="matTypeNm">자재 유형명 *</label>
              <input
                id="matTypeNm"
                v-model="matTypeForm.matTypeNm"
                type="text"
                required
              />
            </div>
            <div class="form-group full-width">
              <label for="description">설명</label>
              <textarea
                id="description"
                v-model="matTypeForm.description"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="procureType">조달 유형</label>
              <input
                id="procureType"
                v-model="matTypeForm.procureType"
                type="text"
              />
            </div>
            <div class="form-group">
              <label for="priceCtrlType">가격 제어</label>
              <input
                id="priceCtrlType"
                v-model="matTypeForm.priceCtrlType"
                type="text"
              />
            </div>
            <div class="form-group checkbox-group">
              <label
                ><input type="checkbox" v-model="matTypeForm.qtyUpdateYn" />
                수량 업데이트</label
              >
              <label
                ><input type="checkbox" v-model="matTypeForm.valUpdateYn" />
                금액 업데이트</label
              >
              <label
                ><input type="checkbox" v-model="matTypeForm.useYn" /> 사용
                여부</label
              >
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeFormModal" class="btn-secondary">
              취소
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? "저장 중..." : "저장" }}
            </button>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import PageTitle from "@/components/PageTitle.vue";
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

const matTypeForm = ref({});
const isEditMode = computed(() => !!selectedMatType.value?.id);

watch(
  selectedMatType,
  (newData) => {
    const defaultName =
      newData?.names?.find((n) => n.langu === "ko") ||
      newData?.names?.[0] ||
      {};
    matTypeForm.value = {
      id: newData?.id || null,
      company: newData?.company || "1000",
      matType: newData?.matType || "",
      procureType: newData?.procureType || "E",
      priceCtrlType: newData?.priceCtrlType || "S",
      qtyUpdateYn: newData?.qtyUpdateYn ?? true,
      valUpdateYn: newData?.valUpdateYn ?? true,
      useYn: newData?.useYn ?? true,
      langu: defaultName.langu || "ko",
      matTypeNm: defaultName.matTypeNm || "",
      description: defaultName.description || "",
    };
  },
  { immediate: true, deep: true },
);

function submitMatTypeForm() {
  const payload = {
    ...matTypeForm.value,
    qtyUpdateYn: matTypeForm.value.qtyUpdateYn ? 1 : 0,
    valUpdateYn: matTypeForm.value.valUpdateYn ? 1 : 0,
    useYn: matTypeForm.value.useYn ? 1 : 0,
  };
  handleSave(payload);
}

function getMatTypeName(matType) {
  if (!matType.names || matType.names.length === 0) return "-";
  const nameInKorean = matType.names.find((n) => n.langu === "ko");
  return nameInKorean ? nameInKorean.matTypeNm : matType.names[0].matTypeNm;
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
.mat-type-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
.form-group textarea {
  min-height: 80px;
}
.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  grid-column: 1 / -1;
  padding-top: 1.5rem;
}
.input-hint {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
