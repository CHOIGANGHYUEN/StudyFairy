<template>
  <div class="admin-container">
    <h1>문서 요약 서비스</h1>
    <p v-if="error" style="color: red">오류: {{ error }}</p>

    <!-- 0. AI 모델 선택 영역 -->
    <section class="section-box">
      <h2>0. AI 모델 선택</h2>
      <select v-model="selectedModel" :disabled="isLoading" class="form-select">
        <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash</option>
        <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro</option>
      </select>
    </section>

    <!-- 1. 파일 선택 영역 -->
    <section class="section-box">
      <h2>1. 파일 선택</h2>
      <div class="button-group">
        <input type="file" multiple @change="handleFileChange" :disabled="isLoading" />
        <button @click="openGoogleDrivePicker" :disabled="isLoading" class="btn btn-export">
          구글 드라이브 열기
        </button>
      </div>
      <ul v-if="selectedFiles.length > 0" class="item-list">
        <li v-for="(file, idx) in selectedFiles" :key="idx">{{ file.name }}</li>
      </ul>
    </section>

    <!-- 2. 목차 직접 입력 및 선택 영역 -->
    <section class="section-box">
      <h2>2. 목차 선택</h2>
      <div class="button-group">
        <input v-model="newTocTitle" @keyup.enter="addToc" placeholder="목차를 입력하세요" :disabled="isLoading" class="form-input" />
        <button @click="addToc" :disabled="isLoading" class="btn btn-preview">추가</button>
      </div>
      <ul v-if="toc.length > 0" class="item-list">
        <li v-for="(item, idx) in toc" :key="idx">
          <label>
            <input type="checkbox" :value="item" v-model="selectedTocItems" :disabled="isLoading" />
            {{ item.title }}
          </label>
        </li>
      </ul>
    </section>

    <!-- 3. 요약 프롬프트 영역 -->
    <section class="section-box">
      <h2>3. 요약 프롬프트</h2>
      <textarea v-model="summaryPrompt" placeholder="요약 프롬프트를 입력하세요." :disabled="isLoading" class="prompt-textarea"></textarea>
    </section>

    <!-- 4. 요약 실행 영역 -->
    <section class="run-section section-box">
      <h2>4. 요약 실행</h2>
      <button @click="runSummary" :disabled="selectedTocItems.length === 0 || isLoading" class="btn-run">
        <span v-if="isLoading && summaryLoading">요약 진행 중...</span>
        <span v-else>요약 실행 (RUN)</span>
      </button>
    </section>

    <!-- 5. 요약 결과 목록 -->
    <section v-if="summaryResult && summaryResult.length > 0" class="result-list-section section-box">
      <div class="result-header-main">
        <h2>5. 요약 결과</h2>
        <span class="badge">총 {{ summaryResult.length }}개 완료</span>
      </div>

      <ul class="result-list">
        <li v-for="(item, index) in paginatedResults" :key="index" class="result-item">
          <div class="result-item-header">
            <h3>{{ item.title }}</h3>
            <div class="button-group">
              <button @click="togglePreview(index)" class="btn btn-preview">
                {{ previewIndex === index ? "미리보기 닫기" : "미리보기" }}
              </button>
              <button @click="downloadResult(item)" class="btn btn-download">Markdown 다운로드</button>
              <button @click="exportToGoogleDocs(item)" class="btn btn-export">구글 독스</button>
            </div>
          </div>

          <transition name="fade">
            <div v-if="previewIndex === index" class="result-content-preview">
              <div v-html="sanitizedHTML(item.content)"></div>
            </div>
          </transition>
        </li>
      </ul>

      <!-- 페이징 컨트롤 -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1" class="btn-page">이전</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-page">다음</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useSummary } from "@/composables/useSummary";
const {
  selectedModel, selectedFiles, toc, selectedTocItems, summaryPrompt, summaryResult,
  isLoading, summaryLoading, error, newTocTitle,
  handleFileChange, openGoogleDrivePicker, addToc, runSummary, exportToGoogleDocs,
  currentPage, totalPages, paginatedResults, previewIndex, prevPage, nextPage, togglePreview,
  sanitizedHTML, downloadResult
} = useSummary();
</script>

<style scoped>
.section-box {
  margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #e2e8f0;
  border-radius: 0.75rem; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.section-box h2 { margin-top: 0; font-size: 1.25rem; color: #1e293b; margin-bottom: 1rem; }
.prompt-textarea { width: 100%; height: 100px; resize: vertical; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; }
.form-select, .form-input { padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; font-size: 1rem; }
.form-input { width: 250px; }
.item-list { margin-top: 1rem; padding-left: 1.5rem; }
.button-group { display: flex; gap: 0.5rem; }
.run-section { text-align: center; }
.btn-run { padding: 0.75rem 2rem; font-size: 1.1rem; font-weight: bold; background-color: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: background-color 0.2s; }
.btn-run:hover:not(:disabled) { background-color: #2563eb; }
.btn-run:disabled { background-color: #94a3b8; cursor: not-allowed; }
.result-header-main { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.result-header-main h2 { margin: 0; }
.badge { background-color: #eff6ff; color: #2563eb; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
.result-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
.result-item { border: 1px solid #cbd5e1; border-radius: 0.5rem; background-color: #f8fafc; overflow: hidden; }
.result-item-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background-color: #ffffff; border-bottom: 1px solid #e2e8f0; }
.result-item-header h3 { margin: 0; font-size: 1.1rem; color: #1e293b; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.btn { padding: 0.5rem 0.75rem; font-size: 0.85rem; font-weight: 600; border: none; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s; }
.btn-preview { background-color: #f1f5f9; color: #475569; }
.btn-preview:hover { background-color: #e2e8f0; }
.btn-download { background-color: #10b981; color: white; }
.btn-download:hover { background-color: #059669; }
.btn-export { background-color: #f59e0b; color: white; }
.btn-export:hover { background-color: #d97706; }
.result-content-preview { padding: 1.5rem; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 0.95rem; line-height: 1.6; color: #334155; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; }
.btn-page { padding: 0.5rem 1rem; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 0.375rem; cursor: pointer; }
.btn-page:hover:not(:disabled) { background-color: #f1f5f9; }
.btn-page:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { font-weight: bold; color: #475569; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
