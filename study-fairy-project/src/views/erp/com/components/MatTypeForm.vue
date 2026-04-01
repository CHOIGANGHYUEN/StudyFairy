<template>
  <form @submit.prevent="submitForm" class="mat-type-form">
    <div class="form-grid">
      <!-- Main MatType Fields -->
      <div class="form-group">
        <label for="matType">자재 유형 코드 *</label>
        <input
          id="matType"
          v-model="form.matType"
          type="text"
          required
          :disabled="isEditMode"
        />
      </div>
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

      <!-- MatTypex Fields -->
      <div class="form-group">
        <label for="langu">언어 코드 *</label>
        <input id="langu" v-model="form.langu" type="text" required />
        <p class="input-hint">
          수정 시, 해당 언어의 명칭/설명이 없으면 새로 추가됩니다.
        </p>
      </div>
      <div class="form-group">
        <label for="matTypeNm">자재 유형명 *</label>
        <input id="matTypeNm" v-model="form.matTypeNm" type="text" required />
      </div>
      <div class="form-group full-width">
        <label for="description">설명</label>
        <textarea id="description" v-model="form.description"></textarea>
      </div>

      <!-- Other MatType Fields -->
      <div class="form-group">
        <label for="procureType">조달 유형</label>
        <input id="procureType" v-model="form.procureType" type="text" />
      </div>
      <div class="form-group">
        <label for="priceCtrlType">가격 제어</label>
        <input id="priceCtrlType" v-model="form.priceCtrlType" type="text" />
      </div>
      <div class="form-group checkbox-group">
        <label>
          <input type="checkbox" v-model="form.qtyUpdateYn" />
          수량 업데이트
        </label>
        <label>
          <input type="checkbox" v-model="form.valUpdateYn" />
          금액 업데이트
        </label>
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
  matTypeData: {
    type: Object,
    default: () => ({}),
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["save", "cancel"]);

const form = ref({});

const isEditMode = computed(() => !!props.matTypeData?.id);

watch(
  () => props.matTypeData,
  (newData) => {
    // 폼 데이터 초기화
    const defaultName =
      newData?.names?.find((n) => n.langu === "ko") ||
      newData?.names?.[0] ||
      {};
    form.value = {
      id: newData?.id || null,
      companyId: newData?.companyId || "1000", // 기본값 설정
      matType: newData?.matType || "",
      procureType: newData?.procureType || "E",
      priceCtrlType: newData?.priceCtrlType || "S",
      qtyUpdateYn: newData?.qtyUpdateYn ?? true,
      valUpdateYn: newData?.valUpdateYn ?? true,
      useYn: newData?.useYn ?? true,
      // MatTypex 관련 필드
      langu: defaultName.langu || "ko",
      matTypeNm: defaultName.matTypeNm || "",
      description: defaultName.description || "",
    };
  },
  { immediate: true, deep: true },
);

function submitForm() {
  // Checkbox 값을 1 또는 0으로 변환
  const payload = {
    ...form.value,
    qtyUpdateYn: form.value.qtyUpdateYn ? 1 : 0,
    valUpdateYn: form.value.valUpdateYn ? 1 : 0,
    useYn: form.value.useYn ? 1 : 0,
  };
  emit("save", payload);
}
</script>

<style scoped>
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
.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.form-group input[type="text"],
.form-group textarea {
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
