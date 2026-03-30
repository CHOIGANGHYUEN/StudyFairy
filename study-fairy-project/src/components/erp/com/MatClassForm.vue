<template>
  <form @submit.prevent="submitForm" class="mat-class-form">
    <div class="form-grid">
      <!-- Main MatClass Fields -->
      <div class="form-group">
        <label for="companyId">회사 ID *</label>
        <input
          id="companyId"
          v-model="form.companyId"
          type="text"
          required
          :disabled="isEditMode"
        />
      </div>
      <div class="form-group">
        <label for="matClass">자재 분류 코드 *</label>
        <input
          id="matClass"
          v-model="form.matClass"
          type="text"
          required
          :disabled="isEditMode"
        />
      </div>

      <div class="form-group">
        <label for="classLevel">분류 레벨 *</label>
        <input
          id="classLevel"
          v-model.number="form.classLevel"
          type="number"
          min="1"
          required
        />
      </div>
      <div class="form-group">
        <label for="parentClass">상위 분류</label>
        <select
          id="parentClass"
          v-model="form.parentClass"
          :disabled="form.classLevel <= 1"
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

      <!-- MatClassx Fields -->
      <div class="form-group">
        <label for="langu">언어 코드 *</label>
        <input id="langu" v-model="form.langu" type="text" required />
        <p class="input-hint">
          수정 시, 해당 언어의 명칭/설명이 없으면 새로 추가됩니다.
        </p>
      </div>
      <div class="form-group">
        <label for="matClassNm">자재 분류명 *</label>
        <input id="matClassNm" v-model="form.matClassNm" type="text" required />
      </div>
      <div class="form-group full-width">
        <label for="description">설명</label>
        <textarea id="description" v-model="form.description"></textarea>
      </div>

      <div class="form-group checkbox-group full-width">
        <label>
          <input type="checkbox" v-model="form.useYn" />
          사용 여부
        </label>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn-secondary">
        취소
      </button>
      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        {{ isSubmitting ? "저장 중..." : "저장" }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  matClassData: { type: Object, default: () => ({}) },
  matClasses: { type: Array, default: () => [] },
  isSubmitting: { type: Boolean, default: false },
});

const emit = defineEmits(["save", "cancel"]);

const form = ref({});

const isEditMode = computed(() => !!props.matClassData?.id);

const availableParentClasses = computed(() => {
  return props.matClasses.filter(
    (c) =>
      c.classLevel === form.value.classLevel - 1 &&
      c.companyId === form.value.companyId,
  );
});

watch(
  () => form.value.classLevel,
  (newLevel) => {
    if (newLevel <= 1) {
      form.value.parentClass = "";
    }
  },
);

watch(
  () => props.matClassData,
  (newData) => {
    const defaultName =
      newData?.names?.find((n) => n.langu === "ko") ||
      newData?.names?.[0] ||
      {};
    form.value = {
      id: newData?.id || null,
      companyId: newData?.companyId || "1000",
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
    matClass.names.find((n) => n.langu === form.value.langu) ||
    matClass.names.find((n) => n.langu === "ko") ||
    matClass.names[0];
  return nameObj.matClassNm;
}

function submitForm() {
  const payload = { ...form.value, useYn: form.value.useYn ? 1 : 0 };
  emit("save", payload);
}
</script>

<style scoped>
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
.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
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
