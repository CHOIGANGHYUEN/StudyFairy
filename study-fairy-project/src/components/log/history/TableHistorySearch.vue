<template>
  <div class="card-section filter-section mb-4">
    <div class="flex flex-wrap gap-4 items-end">
      <div class="form-group flex-1 min-w-[200px]">
        <label>테이블 명 (ID)</label>
        <input
          type="text"
          v-model="localFilters.tablen"
          placeholder="검색할 테이블명 입력"
          class="form-control"
          @keyup.enter="onSearch"
        />
      </div>
      <div class="form-group min-w-[150px]">
        <label>메타 유형</label>
        <select
          v-model="localFilters.targetType"
          class="form-control"
          @change="onSearch"
        >
          <option value="">전체 (All)</option>
          <option value="TABLE">테이블 (TABLE)</option>
          <option value="FIELD">컬럼 (FIELD)</option>
          <option value="INDEX">인덱스 (INDEX)</option>
          <option value="INDEX_FIELD">인덱스 필드 (INDEX_FIELD)</option>
        </select>
      </div>
      <div class="form-group min-w-[150px]">
        <label>작업 유형</label>
        <select
          v-model="localFilters.actionType"
          class="form-control"
          @change="onSearch"
        >
          <option value="">전체 (All)</option>
          <option value="INSERT">생성 (INSERT)</option>
          <option value="UPDATE">수정 (UPDATE)</option>
          <option value="DELETE">삭제 (DELETE)</option>
        </select>
      </div>
      <div class="form-group min-w-[150px]">
        <label>DB 반영 여부</label>
        <select
          v-model="localFilters.isApplied"
          class="form-control"
          @change="onSearch"
        >
          <option value="">전체 (All)</option>
          <option value="true">반영됨</option>
          <option value="false">미반영</option>
        </select>
      </div>
      <button @click="onSearch" class="btn btn-primary h-[42px]">
        조회
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'search']);

const localFilters = ref({ ...props.modelValue });

watch(
  () => props.modelValue,
  (newVal) => {
    localFilters.value = { ...newVal };
  },
  { deep: true }
);

function onSearch() {
  emit('update:modelValue', localFilters.value);
  emit('search');
}
</script>

<style scoped>
.filter-section {
  background-color: var(--bg-color-secondary, #f8f9fa);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color, #e2e8f0);
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-secondary, #4a5568);
}
.form-control {
  width: 100%;
}
</style>