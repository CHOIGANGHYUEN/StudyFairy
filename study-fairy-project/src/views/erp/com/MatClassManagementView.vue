<template>
  <div class="admin-container management-container">
    <PageTitle title="자재 분류 관리" />

    <div class="controls">
      <button @click="openFormModal()" class="btn-primary">
        새 자재 분류 추가
      </button>
    </div>

    <!-- 자재 분류 목록 (기존 MatClassList) -->
    <section class="card-section">
      <div class="card-header">
        <h2 class="section-title">자재 분류 목록</h2>
      </div>
      <div v-if="isLoading" class="loading-state">데이터를 불러오는 중...</div>
      <div v-else-if="!matClasses.length" class="empty-state">
        등록된 자재 분류가 없습니다.
      </div>
      <div class="table-container" v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>회사 ID</th>
              <th>분류 코드</th>
              <th>분류명</th>
              <th>상위 분류</th>
              <th class="text-center">레벨</th>
              <th class="text-center">상태</th>
              <th class="text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sortedMatClasses" :key="item.id">
              <td>{{ item.company }}</td>
              <td class="font-bold">{{ item.matClass }}</td>
              <td
                :style="{ paddingLeft: `${(item.classLevel - 1) * 20 + 8}px` }"
              >
                <span v-if="item.classLevel > 1" class="text-gray-400 mr-1">
                </span>
                {{ getMatClassName(item) }}
              </td>
              <td>{{ item.parentClass || "-" }}</td>
              <td class="text-center">{{ item.classLevel }}</td>
              <td class="text-center">
                <span
                  :class="['status-badge', item.useYn ? 'active' : 'inactive']"
                >
                  {{ item.useYn ? "사용" : "미사용" }}
                </span>
              </td>
              <td class="action-buttons text-center">
                <button
                  @click="openFormModal(item)"
                  class="btn-icon"
                  title="수정"
                >
                  ✏️
                </button>
                <button
                  @click="handleDelete(item.id)"
                  class="btn-icon"
                  title="삭제"
                >
                  🗑️
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
        <!-- 자재 분류 폼 (기존 MatClassForm) -->
        <form @submit.prevent="submitMatClassForm" class="mat-class-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="company">회사 ID *</label>
              <input
                id="company"
                v-model="matClassForm.company"
                type="text"
                required
                :disabled="isEditMode"
              />
            </div>
            <div class="form-group">
              <label for="matClass">자재 분류 코드 *</label>
              <input
                id="matClass"
                v-model="matClassForm.matClass"
                type="text"
                required
                :disabled="isEditMode"
              />
            </div>
            <div class="form-group">
              <label for="classLevel">분류 레벨 *</label>
              <input
                id="classLevel"
                v-model.number="matClassForm.classLevel"
                type="number"
                min="1"
                required
              />
            </div>
            <div class="form-group">
              <label for="parentClass">상위 분류</label>
              <select
                id="parentClass"
                v-model="matClassForm.parentClass"
                :disabled="matClassForm.classLevel <= 1"
              >
                <option value="">없음</option>
                <option
                  v-for="pc in availableParentClasses"
                  :key="pc.matClass"
                  :value="pc.matClass"
                >
                  {{ getMatClassName(pc) }} ({{ pc.matClass }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="langu">언어 코드 *</label>
              <input
                id="langu"
                v-model="matClassForm.langu"
                type="text"
                required
              />
            </div>
            <div class="form-group">
              <label for="matClassNm">자재 분류명 *</label>
              <input
                id="matClassNm"
                v-model="matClassForm.matClassNm"
                type="text"
                required
              />
            </div>
            <div class="form-group full-width">
              <label for="description">설명</label>
              <textarea
                id="description"
                v-model="matClassForm.description"
              ></textarea>
            </div>
            <div class="form-group checkbox-group full-width">
              <label
                ><input type="checkbox" v-model="matClassForm.useYn" /> 사용
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

const matClassForm = ref({});
const isEditMode = computed(() => !!selectedMatClass.value?.id);

const sortedMatClasses = computed(() => {
  return [...matClasses.value].sort((a, b) => {
    if (a.classLevel !== b.classLevel) return a.classLevel - b.classLevel;
    return a.matClass.localeCompare(b.matClass);
  });
});

const availableParentClasses = computed(() => {
  return matClasses.value.filter(
    (c) =>
      c.classLevel === matClassForm.value.classLevel - 1 &&
      c.company === matClassForm.value.company,
  );
});

watch(
  () => matClassForm.value.classLevel,
  (newLevel) => {
    if (newLevel <= 1) matClassForm.value.parentClass = "";
  },
);

watch(
  selectedMatClass,
  (newData) => {
    const defaultName =
      newData?.names?.find((n) => n.langu === "ko") ||
      newData?.names?.[0] ||
      {};
    matClassForm.value = {
      id: newData?.id || null,
      company: newData?.company || "1000",
      matClass: newData?.matClass || "",
      parentClass: newData?.parentClass || "",
      classLevel: newData?.classLevel || 1,
      useYn: newData?.useYn ?? true,
      langu: defaultName.langu || "ko",
      matClassNm: defaultName.matClassNm || "",
      description: defaultName.description || "",
    };
  },
  { immediate: true, deep: true },
);

function getMatClassName(matClass) {
  if (!matClass.names || matClass.names.length === 0) return "-";
  const nameObj =
    matClass.names.find(
      (n) => n.langu === (matClassForm.value.langu || "ko"),
    ) ||
    matClass.names.find((n) => n.langu === "ko") ||
    matClass.names[0];
  return nameObj ? nameObj.matClassNm : "-";
}

function submitMatClassForm() {
  const payload = {
    ...matClassForm.value,
    useYn: matClassForm.value.useYn ? 1 : 0,
  };
  handleSave(payload);
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
.text-center {
  text-align: center;
}
.text-gray-400 {
  color: #9ca3af;
}
.mr-1 {
  margin-right: 0.25rem;
}
.mat-class-form {
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
  padding-top: 0.5rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
