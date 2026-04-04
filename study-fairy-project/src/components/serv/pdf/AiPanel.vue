<template>
  <div class="ai-interaction-area">
    <div class="ai-panel card-section">
      <h3 class="section-title">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon-lg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM4 11a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zM4 15a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        AI 질문 패널
      </h3>

      <div class="form-group">
        <label class="form-label">AI 모델</label>
        <select
          :value="selectedModel"
          @input="emit('update:selectedModel', $event.target.value)"
          class="form-control model-select"
        >
          <option
            v-for="m in availableModels"
            :key="m.value"
            :value="m.value"
          >
            {{ m.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">질문하기</label>
        <textarea
          :value="geminiQuestion"
          @input="emit('update:geminiQuestion', $event.target.value)"
          class="form-control"
          rows="5"
          placeholder="PDF에서 텍스트를 드래그하여 선택한 후, 질문을 입력하세요. 예: 이 내용을 세 문단으로 요약해줘."
          :disabled="!selectedText || geminiIsLoading"
        ></textarea>
      </div>

      <button
        @click="emit('ask-gemini')"
        class="btn btn-primary w-full"
        :disabled="!selectedText || !geminiQuestion || geminiIsLoading"
      >
        <span v-if="geminiIsLoading" class="spinner-sm"></span>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="icon-sm"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 011 1v5a1 1 0 11-2 0V9a1 1 0 011-1z"
          />
        </svg>
        {{ geminiIsLoading ? "답변 생성 중..." : "AI에게 질문하기" }}
      </button>
    </div>

    <div class="ai-result-area card-section">
      <h3 class="section-title">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon-lg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
        AI 답변
      </h3>
      <div v-if="geminiError" class="alert alert-danger">
        {{ geminiError }}
      </div>
      <div
        class="gemini-output"
        v-html="geminiResponse"
        :class="{ 'is-loading': geminiIsLoading }"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedModel: String,
  availableModels: Array,
  geminiQuestion: String,
  selectedText: String,
  geminiIsLoading: Boolean,
  geminiResponse: String,
  geminiError: String,
});

const emit = defineEmits([
  "update:selectedModel",
  "update:geminiQuestion",
  "ask-gemini",
]);
</script>

<style scoped>
.ai-interaction-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
}

.ai-panel {
  padding: 1.5rem;
  gap: 1.5rem;
  flex-shrink: 0;
}

.ai-result-area {
  padding: 1.5rem;
  flex-grow: 1;
  min-height: 0;
}

/* Using global .form-group, but adding local gap */
.form-group {
  gap: 0.5rem;
}

.gemini-output {
  flex-grow: 1;
  overflow-y: auto;
  font-size: 0.95rem;
  line-height: 1.7;
  word-break: break-word;
  background-color: var(--bg-color-secondary);
  padding: 1.25rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}
.gemini-output.is-loading {
  opacity: 0.6;
  transition: opacity 0.3s;
}

.gemini-output :deep(p) {
  margin-top: 0;
  margin-bottom: 1rem;
}
.gemini-output :deep(p:last-child) {
  margin-bottom: 0;
}
.gemini-output :deep(pre) {
  background-color: #1e293b;
  color: #f8fafc;
  padding: 1.25rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.85rem;
  margin: 1rem 0;
}
.gemini-output :deep(code) {
  background-color: #e2e8f0;
  color: #b91c1c;
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 0.85em;
  border-radius: var(--border-radius-sm);
  font-family: monospace;
}
.gemini-output :deep(pre code) {
  background-color: transparent;
  color: inherit;
  padding: 0;
}
.gemini-output :deep(h1),
.gemini-output :deep(h2),
.gemini-output :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
  color: #0f172a;
}
</style>
