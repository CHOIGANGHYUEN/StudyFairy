<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-container sql-modal">
      <div class="modal-header">
        <h3 class="modal-title">DDL 스크립트 생성 및 실행</h3>
        <button class="btn-close" @click="$emit('update:modelValue', false)">
          <svg
            class="icon-sm"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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

      <div class="modal-body custom-modal-body">
        <!-- 상단 옵션 탭 -->
        <div class="options-bar">
          <div class="segmented-control">
            <label
              :class="['segment', { active: selection === 'CREATE_TABLE' }]"
            >
              <input
                type="radio"
                v-model="selection"
                value="CREATE_TABLE"
                class="hidden"
              />
              테이블 생성
            </label>
            <label
              :class="['segment', { active: selection === 'ALTER_TABLE' }]"
            >
              <input
                type="radio"
                v-model="selection"
                value="ALTER_TABLE"
                class="hidden"
              />
              컬럼 수정
            </label>
            <label
              :class="['segment', { active: selection === 'ALTER_INDEX' }]"
            >
              <input
                type="radio"
                v-model="selection"
                value="ALTER_INDEX"
                class="hidden"
              />
              인덱스 변경
            </label>
            <label :class="['segment', { active: selection === 'DROP_TABLE' }]">
              <input
                type="radio"
                v-model="selection"
                value="DROP_TABLE"
                class="hidden"
              />
              테이블 삭제
            </label>
          </div>
        </div>

        <!-- 하단 코드 에디터 -->
        <div class="editor-wrapper">
          <div class="editor-toolbar">
            <div class="mac-dots">
              <div class="mac-dot red"></div>
              <div class="mac-dot yellow"></div>
              <div class="mac-dot green"></div>
              <span class="filename">generated_script.sql</span>
            </div>
            <button @click="copyToClipboard" class="copy-btn">
              <svg
                class="icon-xs"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              복사
            </button>
          </div>
          <textarea
            v-model="localDdl"
            class="code-textarea flex-1"
            placeholder="생성된 DDL 스크립트가 없습니다."
            spellcheck="false"
          ></textarea>
        </div>
      </div>

      <div class="modal-footer custom-modal-footer">
        <div class="warning-msg">
          <svg
            class="icon-sm"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span
            >스크립트 직접 수정 후 실행 가능합니다. DB 구조 변경에
            주의하세요.</span
          >
        </div>
        <div class="footer-actions">
          <button
            @click="$emit('update:modelValue', false)"
            class="btn btn-outline"
          >
            닫기
          </button>
          <button
            @click="$emit('execute', selection)"
            class="btn btn-danger"
            :disabled="!localDdl"
          >
            <svg
              class="icon-sm mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            DB 즉시 실행
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  modelValue: Boolean,
  generatedDdl: String,
});
const emit = defineEmits([
  "update:modelValue",
  "update:generatedDdl",
  "generate",
  "execute",
]);
const selection = ref("CREATE_TABLE");

const localDdl = computed({
  get: () => props.generatedDdl,
  set: (val) => emit("update:generatedDdl", val),
});

watch(selection, (newVal) => {
  emit("generate", newVal);
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      emit("generate", selection.value);
    }
  },
);

async function copyToClipboard() {
  if (!localDdl.value) return;
  try {
    await navigator.clipboard.writeText(localDdl.value);
    alert("스크립트가 클립보드에 복사되었습니다.");
  } catch (err) {
    console.error(err);
    alert("클립보드 복사에 실패했습니다.");
  }
}
</script>

<style scoped>
.sql-modal {
  max-width: 900px !important;
  width: 95vw;
  height: 80vh;
  display: flex;
  flex-direction: column;
}
.custom-modal-body {
  display: flex;
  flex-direction: column;
  padding: 0;
  background-color: var(--bg-color);
  flex: 1;
  overflow: hidden;
}

/* Segmented Control (모던 탭) */
.options-bar {
  background-color: white;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}
.segmented-control {
  display: inline-flex;
  background-color: var(--bg-color-secondary);
  padding: 0.3rem;
  border-radius: 10px;
  gap: 0.25rem;
}
.segment {
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}
.segment:hover {
  color: var(--text-color-primary);
}
.segment.active {
  background-color: white;
  color: var(--primary-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* IDE 스타일 에디터 래퍼 */
.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid #334155;
  background-color: #0f172a; /* Slate 900 */
}
.editor-toolbar {
  background-color: #1e293b; /* Slate 800 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #334155;
}
.mac-dots {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.mac-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.mac-dot.red {
  background-color: #f87171;
}
.mac-dot.yellow {
  background-color: #facc15;
}
.mac-dot.green {
  background-color: #4ade80;
}
.filename {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  font-family: monospace;
  color: #94a3b8;
}
.copy-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: color 0.2s;
}
.copy-btn:hover {
  color: white;
}
.code-textarea {
  flex: 1;
  font-family: "Consolas", "Courier New", Courier, monospace;
  background-color: transparent;
  color: #a7f3d0; /* Emerald 200 */
  border: none;
  padding: 1.5rem;
  resize: none;
  line-height: 1.7;
  font-size: 0.9rem;
}
.code-textarea:focus {
  outline: none;
}
.custom-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.75rem;
  border-top: 1px solid var(--border-color);
  background-color: white;
}
.warning-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #b91c1c;
  font-size: 0.85rem;
  font-weight: 600;
}
.footer-actions {
  display: flex;
  gap: 0.5rem;
}
.icon-xs {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 640px) {
  .segmented-control {
    flex-direction: column;
    width: 100%;
  }
  .segment {
    text-align: center;
  }
  .footer-actions {
    flex-direction: column;
    width: 100%;
  }
  .footer-actions button {
    width: 100%;
  }
  .custom-modal-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
