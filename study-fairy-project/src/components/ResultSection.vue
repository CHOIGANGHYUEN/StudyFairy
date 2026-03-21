<template>
  <div>
    <!-- 4. 요약 실행 -->
    <section class="run-section">
      <h2>4. 요약 실행</h2>
      <button
        @click="$emit('run')"
        :disabled="disabled || isLoading"
        class="btn-run"
      >
        <span v-if="isLoading && summaryLoading">요약 진행 중...</span>
        <span v-else>요약 실행 (RUN)</span>
      </button>
    </section>

    <!-- 5. 결과 목록 -->
    <section v-if="results && results.length > 0" class="result-list-section">
      <div class="result-header-main">
        <h2>5. 요약 결과</h2>
        <span class="badge">총 {{ results.length }}개 완료</span>
      </div>

      <ul class="result-list">
        <!-- 페이징 처리된 목록 순회 -->
        <li
          v-for="(item, index) in paginatedResults"
          :key="index"
          class="result-item"
        >
          <div class="result-item-header">
            <h3>{{ item.title }}</h3>
            <div class="button-group">
              <!-- 미리보기 버튼 -->
              <button @click="togglePreview(index)" class="btn btn-preview">
                {{ previewIndex === index ? "미리보기 닫기" : "미리보기" }}
              </button>
              <!-- 다운로드 버튼 -->
              <button @click="downloadResult(item)" class="btn btn-download">
                HTML 다운로드
              </button>
              <!-- 구글 독스 변환 버튼 -->
              <button @click="$emit('export', item)" class="btn btn-export">
                구글 독스
              </button>
            </div>
          </div>

          <!-- 미리보기 영역 (토글) -->
          <transition name="fade">
            <div v-if="previewIndex === index" class="result-content-preview">
              <div v-html="item.content"></div>
            </div>
          </transition>
        </li>
      </ul>

      <!-- 페이징 컨트롤 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="btn-page"
        >
          이전
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="btn-page"
        >
          다음
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  // 기존의 단일 문자열이 아닌 배열 형태로 결과를 받습니다.
  results: {
    type: Array,
    default: () => [],
  },
  isLoading: Boolean,
  summaryLoading: Boolean,
  disabled: Boolean,
});

const emit = defineEmits(["run", "export"]);

// --- 페이징 로직 ---
const currentPage = ref(1);
const itemsPerPage = 5;

const totalPages = computed(() => {
  return Math.ceil(props.results.length / itemsPerPage);
});

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return props.results.slice(start, end);
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    previewIndex.value = -1; // 페이지 이동 시 열려있던 미리보기 초기화
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    previewIndex.value = -1;
  }
};

// --- 미리보기 로직 ---
const previewIndex = ref(-1);

const togglePreview = (index) => {
  if (previewIndex.value === index) {
    previewIndex.value = -1;
  } else {
    previewIndex.value = index;
  }
};

// --- 다운로드 로직 ---
const downloadResult = (item) => {
  // HTML 형식으로 다운로드되도록 Blob 객체 생성
  const blob = new Blob(
    [
      `<html><head><meta charset="utf-8"><title>${item.title}</title></head><body><h1>${item.title}</h1>${item.content}</body></html>`,
    ],
    { type: "text/html;charset=utf-8;" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // 파일 이름에서 특수문자를 제거하여 안전하게 다운로드
  const safeTitle = item.title.replace(/[^a-zA-Z0-9가-힣\s]/g, "").trim();
  link.setAttribute("download", `${safeTitle || "요약"}.html`);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.run-section {
  text-align: center;
}

.btn-run {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-run:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-run:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

/* 결과 헤더 */
.result-header-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.result-header-main h2 {
  margin: 0;
}

.badge {
  background-color: #eff6ff;
  color: #2563eb;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* 리스트 스타일 */
.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  background-color: #f8fafc;
  overflow: hidden;
}

.result-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.result-item-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview {
  background-color: #f1f5f9;
  color: #475569;
}
.btn-preview:hover {
  background-color: #e2e8f0;
}

.btn-download {
  background-color: #10b981;
  color: white;
}
.btn-download:hover {
  background-color: #059669;
}

.btn-export {
  background-color: #f59e0b;
  color: white;
}
.btn-export:hover {
  background-color: #d97706;
}

/* 미리보기 영역 */
.result-content-preview {
  padding: 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #334155;
}

/* 페이징 컨트롤 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-page {
  padding: 0.5rem 1rem;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-page:hover:not(:disabled) {
  background-color: #f1f5f9;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: bold;
  color: #475569;
}

/* 트랜지션 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
