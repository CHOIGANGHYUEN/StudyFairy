<template>
  <section class="toc-section-container">
    <div class="header">
      <h2 class="title">
        <div class="icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </div>
        2. 목차 설정
      </h2>
      <p class="subtitle">
        요약할 목차를 직접 입력하거나 복사해서 붙여넣으세요. (줄바꿈 기준)
      </p>
    </div>

    <div class="input-area">
      <textarea
        v-model="rawTocText"
        placeholder="예시:&#10;1. 서론&#10;2. 본론 - 시장 분석&#10;3. 결론 및 제언"
        class="toc-textarea"
        :disabled="isLoading"
      ></textarea>
      <button
        @click="parseToc"
        class="btn-parse"
        :disabled="isLoading || !rawTocText.trim()"
      >
        목차 목록으로 변환
      </button>
    </div>

    <div v-if="toc.length > 0" class="toc-list-section">
      <div class="list-header">
        <h3>
          선택된 항목
          <span class="badge"
            >{{ selectedTocItems.length }} / {{ toc.length }}</span
          >
        </h3>
        <div class="list-actions">
          <button @click="selectAll" class="btn-text">전체 선택</button>
          <button @click="clearSelection" class="btn-text">선택 해제</button>
        </div>
      </div>

      <ul class="toc-list">
        <li v-for="(item, index) in toc" :key="index" class="toc-item">
          <label class="checkbox-container">
            <input
              type="checkbox"
              :value="item"
              v-model="localSelectedTocItems"
            />
            <span class="checkmark"></span>
            <span class="item-text">{{ item.title }}</span>
          </label>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  toc: {
    type: Array,
    required: true,
  },
  selectedTocItems: {
    type: Array,
    required: true,
  },
  isLoading: Boolean,
});

const emit = defineEmits(["update:toc", "update:selectedTocItems"]);

const rawTocText = ref("");

// v-model 처리를 위한 computed 속성
const localSelectedTocItems = computed({
  get: () => props.selectedTocItems,
  set: (val) => emit("update:selectedTocItems", val),
});

// 텍스트를 줄바꿈 단위로 잘라서 목차 객체 배열로 변환
const parseToc = () => {
  if (!rawTocText.value.trim()) return;

  const lines = rawTocText.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const newToc = lines.map((line, index) => ({
    id: Date.now() + index,
    title: line,
  }));

  emit("update:toc", newToc);
  // 변환 시 기본적으로 전체 선택 상태로 만듦
  emit("update:selectedTocItems", [...newToc]);
};

const selectAll = () => {
  emit("update:selectedTocItems", [...props.toc]);
};

const clearSelection = () => {
  emit("update:selectedTocItems", []);
};
</script>

<style scoped>
.toc-section-container {
  background-color: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.header {
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.icon-wrapper {
  padding: 0.375rem;
  background-color: #f0fdf4;
  border-radius: 0.5rem;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #16a34a;
}

.subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
  margin-left: 2.25rem;
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.toc-textarea {
  width: 100%;
  height: 120px;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  transition: border-color 0.2s;
}

.toc-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-parse {
  padding: 0.625rem;
  background-color: #1e293b;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-parse:hover:not(:disabled) {
  background-color: #0f172a;
}

.btn-parse:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 목차 리스트 스타일 */
.toc-list-section {
  border-top: 1px solid #f1f5f9;
  padding-top: 1.5rem;
  animation: fadeIn 0.3s ease-in;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-header h3 {
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
  margin: 0;
}

.badge {
  padding: 0.125rem 0.5rem;
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  border-radius: 9999px;
  margin-left: 0.25rem;
}

.list-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-text {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-text:hover {
  text-decoration: underline;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toc-item {
  background-color: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: background-color 0.2s;
}

.toc-item:hover {
  background-color: #f1f5f9;
}

/* 커스텀 체크박스 스타일 */
.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 2rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #334155;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  height: 1.25rem;
  width: 1.25rem;
  background-color: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.checkbox-container:hover input ~ .checkmark {
  border-color: #cbd5e1;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.item-text {
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
