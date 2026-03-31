<template>
  <div class="pdf-viewer-container card-section">
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <span>PDF 파일을 불러오는 중입니다...</span>
    </div>
    <div v-else-if="!pdfDocument" class="no-file-placeholder">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="placeholder-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p>PDF 파일을 선택하면 여기에 미리보기가 표시됩니다.</p>
    </div>

    <template v-if="pdfDocument">
      <div class="pdf-toolbar">
        <div class="toolbar-group">
          <button
            @click="emit('zoom-out')"
            class="toolbar-btn"
            title="축소"
            :disabled="isLoading || currentScale <= 0.5"
          >
            <svg
              class="icon-sm"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6"
              />
            </svg>
          </button>
          <span class="scale-display">{{ Math.round(currentScale * 100) }}%</span>
          <button
            @click="emit('zoom-in')"
            class="toolbar-btn"
            title="확대"
            :disabled="isLoading || currentScale >= 3.0"
          >
            <svg
              class="icon-sm"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6h6"
              />
            </svg>
          </button>
        </div>
        <div class="toolbar-divider"></div>
        <div class="toolbar-group">
          <button
            @click="emit('prev-page')"
            class="toolbar-btn"
            title="이전 페이지"
            :disabled="isLoading || currentPageNum <= 1"
          >
            <svg
              class="icon-sm"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span class="page-display">
            <input
              type="number"
              :value="currentPageNum"
              @change="onGoToPage"
              class="page-input"
              min="1"
              :max="totalPages"
              :disabled="isLoading"
            />
            <span class="page-total">/ {{ totalPages }}</span>
          </span>
          <button
            @click="emit('next-page')"
            class="toolbar-btn"
            title="다음 페이지"
            :disabled="isLoading || currentPageNum >= totalPages"
          >
            <svg
              class="icon-sm"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <div class="toolbar-divider"></div>
        <div class="toolbar-group">
          <button
            @click="emit('show-markdown')"
            class="toolbar-btn btn-secondary"
            title="전체 텍스트를 마크다운으로 보기"
            :disabled="isLoading || isCopying"
          >
            <svg
              v-if="!isCopying"
              xmlns="http://www.w3.org/2000/svg"
              class="icon-sm"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A1 1 0 0111.293 2.707l4 4A1 1 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clip-rule="evenodd"
              />
            </svg>
            <span v-else class="spinner-sm-dark"></span>
          </button>
        </div>
      </div>

      <div class="pdf-viewer-scroll-area">
        <div
          class="pdf-viewer"
          ref="pdfViewerRef"
          @mouseup="emit('mouseup')"
        ></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";

const props = defineProps({
  isLoading: Boolean,
  isCopying: Boolean,
  pdfDocument: Object,
  currentScale: Number,
  currentPageNum: Number,
  totalPages: Number,
});

const emit = defineEmits([
  "zoom-in",
  "zoom-out",
  "prev-page",
  "next-page",
  "go-to-page",
  "show-markdown",
  "mouseup",
  "update:isLoading",
]);

const pdfViewerRef = ref(null);

const onGoToPage = (e) => {
  emit("go-to-page", e);
};

const renderCurrentPage = async () => {
  if (!pdfViewerRef.value || !props.pdfDocument) return;
  emit("update:isLoading", true);
  pdfViewerRef.value.innerHTML = "";

  try {
    const page = await props.pdfDocument.getPage(props.currentPageNum);
    const viewport = page.getViewport({ scale: props.currentScale });

    const pageContainer = document.createElement("div");
    pageContainer.className = "pdf-page-container";
    pageContainer.style.width = `${viewport.width}px`;
    pageContainer.style.height = `${viewport.height}px`;
    pageContainer.style.position = "relative";
    pdfViewerRef.value.appendChild(pageContainer);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "1";
    pageContainer.appendChild(canvas);

    const renderContext = { canvasContext: context, viewport: viewport };
    await page.render(renderContext).promise;

    const textContent = await page.getTextContent();
    const textLayerDiv = document.createElement("div");
    textLayerDiv.className = "textLayer";
    textLayerDiv.style.width = `${viewport.width}px`;
    textLayerDiv.style.height = `${viewport.height}px`;
    textLayerDiv.style.position = "absolute";
    textLayerDiv.style.top = "0";
    textLayerDiv.style.left = "0";
    textLayerDiv.style.zIndex = "5";

    textContent.items.forEach((item) => {
      if (!item.str || item.str.trim() === "") return;

      const span = document.createElement("span");
      span.textContent = item.str + " ";
      const tx = item.transform[4];
      const ty = item.transform[5];
      const [x, y] = viewport.convertToViewportPoint(tx, ty);
      const fontSize = Math.abs(item.transform[0]) * viewport.scale;

      span.style.left = `${x}px`;
      span.style.top = `${y - fontSize * 0.8}px`;
      span.style.fontSize = `${fontSize}px`;
      span.style.fontFamily = item.fontName || "sans-serif";
      span.style.position = "absolute";
      span.style.color = "transparent";
      span.style.cursor = "text";
      span.style.whiteSpace = "pre";
      textLayerDiv.appendChild(span);
    });

    pageContainer.appendChild(textLayerDiv);
  } catch (err) {
    console.warn(`페이지 ${props.currentPageNum} 렌더링 오류:`, err);
  } finally {
    emit("update:isLoading", false);
  }
};

watch(
  () => [props.currentPageNum, props.currentScale, props.pdfDocument],
  async () => {
    if (props.pdfDocument) {
      await nextTick();
      await renderCurrentPage();
    }
  }
);
</script>

<style scoped>
.pdf-viewer-container {
  flex-grow: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background-color: #fff;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  z-index: 10;
  flex-shrink: 0;
}
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: var(--bg-color-secondary);
  padding: 0.35rem;
  border-radius: var(--border-radius);
}
.toolbar-divider {
  width: 1px;
  height: 2rem;
  background-color: var(--border-color);
  margin: 0 1rem;
}
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: transparent;
  color: var(--text-color-secondary);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}
.toolbar-btn:hover:not(:disabled) {
  background-color: #fff;
  color: var(--text-color-primary);
  box-shadow: var(--shadow-sm);
}
.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.toolbar-btn.btn-secondary {
  background-color: #fff;
  border: 1px solid var(--border-color);
}
.scale-display {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-color-primary);
  min-width: 3.5rem;
  text-align: center;
}
.page-display {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color-primary);
}
.page-input {
  width: 3.5rem;
  text-align: center;
  font-weight: 600;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  margin: 0 0.4rem;
  padding: 0.3rem;
  background-color: #fff;
  transition: border-color 0.2s;
}
.page-input:focus {
  outline: none;
  border-color: var(--primary-color);
}
.page-total {
  color: var(--text-color-secondary);
}

.pdf-viewer-scroll-area {
  flex-grow: 1;
  overflow: auto;
  padding: 1rem 0.5rem;
  background-color: #94a3b8;
  border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
}

.pdf-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.no-file-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--text-color-secondary);
  text-align: center;
  padding: 2rem;
  background-color: var(--bg-color-secondary);
  border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
}
.placeholder-icon {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  color: var(--border-color-hover);
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  gap: 1rem;
  color: var(--text-color-primary);
  font-weight: 600;
  font-size: 1.1rem;
}
</style>
