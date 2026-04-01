<template>
  <div class="markdown-modal-overlay" @click.self="emit('close')">
    <div class="markdown-modal-panel">
      <div class="markdown-modal-header">
        <h3 class="section-title">마크다운 변환 결과</h3>
        <button @click="emit('close')" class="close-btn">
          <svg
            class="icon-lg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="markdown-modal-content">
        <pre>{{ markdownContent }}</pre>
      </div>
      <div class="markdown-modal-footer">
        <button @click="emit('copy')" class="btn btn-secondary">
          클립보드에 복사
        </button>
        <button @click="emit('close')" class="btn btn-primary">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  markdownContent: String,
});

const emit = defineEmits(["close", "copy"]);
</script>

<style scoped>
.markdown-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
}
.markdown-modal-panel {
  width: 100%;
  max-width: 800px;
  height: 90vh;
  background-color: #fff;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.markdown-modal-header {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.close-btn {
  margin-left: auto;
  padding: 0.5rem;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-color-secondary);
}
.close-btn:hover {
  background-color: var(--bg-color-secondary-hover);
  color: var(--text-color-primary);
}
.markdown-modal-content {
  padding: 1.5rem;
  flex-grow: 1;
  overflow-y: auto;
  background-color: var(--bg-color-secondary);
}
.markdown-modal-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--text-color-primary);
  margin: 0;
}
.markdown-modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid var(--border-color);
  background-color: #fff;
}
</style>
