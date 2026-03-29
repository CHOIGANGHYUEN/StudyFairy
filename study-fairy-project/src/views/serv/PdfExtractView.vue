<template>
  <div class="pdf-extract-page">
    <PageTitle title="PDF 텍스트 추출 및 AI 질문">
      <template #subtitle>
        <p class="page-subtitle">
          PDF 파일을 업로드하여 텍스트를 추출하고, AI에게 다양한 질문을 통해
          인사이트를 얻어보세요.
        </p>
      </template>
    </PageTitle>

    <div class="pdf-extract-layout">
      <!-- Left Column: PDF Viewer and Controls -->
      <div class="pdf-viewer-area">
        <FileUpload
          :is-loading="isLoading"
          :file-name="fileName"
          @file-change="onFileChange"
          @google-drive-click="openGoogleDrivePicker"
        />
        <PdfViewer
          :is-loading="isLoading"
          :is-copying="isCopying"
          :pdf-document="pdfDocument"
          :current-page-num="currentPageNum"
          :total-pages="totalPages"
          :current-scale="currentScale"
          @update:is-loading="isLoading = $event"
          @zoom-in="zoomIn"
          @zoom-out="zoomOut"
          @prev-page="prevPage"
          @next-page="nextPage"
          @go-to-page="goToPage"
          @show-markdown="showMarkdown"
          @mouseup="handleMouseUp"
        />
      </div>

      <!-- Right Column: AI Interaction Panel -->
      <AiPanel
        v.model:selectedModel="selectedModel"
        v.model:geminiQuestion="geminiQuestion"
        :available-models="availableModels"
        :selected-text="selectedText"
        :gemini-is-loading="geminiIsLoading"
        :gemini-response="geminiResponse"
        :gemini-error="geminiError"
        @ask-gemini="askGemini"
      />
    </div>

    <!-- Markdown View Modal -->
    <MarkdownModal
      v-if="showMarkdownModal"
      :markdown-content="markdownContent"
      @close="showMarkdownModal = false"
      @copy="copyMarkdownFromModal"
    />
  </div>
</template>

<script setup>
import { ref, shallowRef, watch } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/service/api";
import "pdfjs-dist/web/pdf_viewer.css";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import DOMPurify from "dompurify";
import { marked } from "marked";

import PageTitle from "@/components/PageTitle.vue";
import FileUpload from "@/components/serv/pdf/FileUpload.vue";
import PdfViewer from "@/components/serv/pdf/PdfViewer.vue";
import AiPanel from "@/components/serv/pdf/AiPanel.vue";
import MarkdownModal from "@/components/serv/pdf/MarkdownModal.vue";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// PDF 및 기본 로딩 상태
const pdfDocument = shallowRef(null);
const currentPageNum = ref(1);
const totalPages = ref(0);
const currentScale = ref(1.25);
const selectedText = ref("");
const isLoading = ref(false);
const authStore = useAuthStore();
const fileName = ref("");

// 텍스트 추출/변환 관련 상태
const isCopying = ref(false);
const showMarkdownModal = ref(false);
const markdownContent = ref("");

// Gemini 관련 상태
const selectedModel = ref("gemini-1.5-flash-preview");
const availableModels = ref([
  { value: "gemini-1.5-flash-preview", label: "Gemini 1.5 Flash (빠름, 권장)" },
  {
    value: "gemini-1.5-pro-preview",
    label: "Gemini 1.5 Pro (고성능, 복잡한 추론)",
  },
  { value: "gemini-1.0-pro", label: "Gemini 1.0 Pro (일반)" },
]);
const geminiQuestion = ref("");
const geminiResponse = ref("AI의 답변이 여기에 마크다운 형식으로 표시됩니다.");
const geminiIsLoading = ref(false);
const geminiError = ref(null);

watch(selectedText, (newText) => {
  if (!newText) {
    geminiQuestion.value = "";
    geminiResponse.value = "AI의 답변이 여기에 마크다운 형식으로 표시됩니다.";
    geminiError.value = null;
  }
});

const askGemini = async () => {
  if (!selectedText.value || !geminiQuestion.value) return;

  geminiIsLoading.value = true;
  geminiError.value = null;
  try {
    const response = await api.post("/interact", {
      contextText: selectedText.value,
      question: geminiQuestion.value,
      model: selectedModel.value,
    });

    const rawHtml = marked.parse(response.data.text);
    geminiResponse.value = DOMPurify.sanitize(rawHtml);
  } catch (err) {
    const message =
      err.response?.data?.message || err.message || "AI 요청에 실패했습니다.";
    geminiError.value = "AI 질문 처리 중 오류: " + message;
    console.error(err);
    geminiResponse.value = "오류가 발생했습니다. 다시 시도해주세요.";
  } finally {
    geminiIsLoading.value = false;
  }
};

const onFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file || file.type !== "application/pdf") return;

  fileName.value = file.name;
  const arrayBuffer = await file.arrayBuffer();
  await loadPdf(new Uint8Array(arrayBuffer));
};

const loadPdf = async (data) => {
  isLoading.value = true;
  try {
    const loadingTask = pdfjsLib.getDocument({ data });
    pdfDocument.value = await loadingTask.promise;
    totalPages.value = pdfDocument.value.numPages;
    currentPageNum.value = 1;
  } catch (err) {
    console.error("PDF 로드 오류:", err);
    alert("PDF 파일을 불러오는 데 실패했습니다.");
    pdfDocument.value = null;
  } finally {
    isLoading.value = false;
  }
};

// PDF 페이지 네비게이션 & 줌 기능
const prevPage = () => {
  if (currentPageNum.value > 1) {
    currentPageNum.value--;
  }
};

const nextPage = () => {
  if (currentPageNum.value < totalPages.value) {
    currentPageNum.value++;
  }
};

const zoomIn = () => {
  if (currentScale.value < 3.0) {
    currentScale.value += 0.25;
  }
};

const zoomOut = () => {
  if (currentScale.value > 0.5) {
    currentScale.value -= 0.25;
  }
};

const goToPage = (e) => {
  let val = parseInt(e.target.value, 10);
  if (val >= 1 && val <= totalPages.value) {
    currentPageNum.value = val;
  } else {
    e.target.value = currentPageNum.value;
  }
};

const handleMouseUp = () => {
  const text = window.getSelection().toString();
  if (text.trim()) {
    selectedText.value = text;
  }
};

const showMarkdown = async () => {
  if (!pdfDocument.value) return;
  isCopying.value = true;
  markdownContent.value = "텍스트를 추출하는 중...";
  showMarkdownModal.value = true;
  try {
    const texts = [];
    for (let i = 1; i <= totalPages.value; i++) {
      const page = await pdfDocument.value.getPage(i);
      const textContent = await page.getTextContent();

      const items = textContent.items.slice().sort((a, b) => {
        const yA = a.transform[5];
        const yB = b.transform[5];
        if (yA !== yB) return yB - yA;
        return a.transform[4] - b.transform[4];
      });

      let pageText = "";
      let lastY = -1;
      let lastHeight = 0;

      for (const item of items) {
        if (!item.str || !item.str.trim()) continue;
        const str = item.str.trim();
        const currentY = item.transform[5];
        const currentHeight = item.height > 0 ? item.height : 12;

        if (lastY !== -1) {
          const yDiff = Math.abs(currentY - lastY);
          if (yDiff > lastHeight * 1.2) {
            pageText += "\n\n" + str;
          } else {
            pageText += " " + str;
          }
        } else {
          pageText += str;
        }
        lastY = currentY;
        lastHeight = currentHeight;
      }
      texts.push(pageText);
    }
    markdownContent.value = texts.join("\n\n").trim();
  } catch (err) {
    console.error("PDF 마크다운 변환 오류:", err);
    markdownContent.value =
      "오류: PDF를 마크다운으로 변환하는 데 실패했습니다.";
  } finally {
    isCopying.value = false;
  }
};

const copyMarkdownFromModal = () => {
  if (!markdownContent.value) return;
  navigator.clipboard.writeText(markdownContent.value);
  alert("마크다운이 클립보드에 복사되었습니다.");
};

const openGoogleDrivePicker = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey || apiKey === "YOUR_GOOGLE_API_KEY") {
    alert("Google Picker API 키가 필요합니다.");
    return;
  }
  if (!authStore.accessToken) {
    alert("Google Drive 연동을 위해 로그인이 필요합니다.");
    return;
  }

  const initPicker = () => {
    isLoading.value = true;
    window.gapi.load("picker", () => {
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .setOAuthToken(authStore.accessToken)
        .setDeveloperKey(apiKey)
        .setCallback(pickerCallback)
        .build();
      picker.setVisible(true);
      isLoading.value = false;
    });
  };

  if (window.gapi && window.gapi.load) {
    initPicker();
  } else {
    isLoading.value = true;
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    script.onload = initPicker;
    script.onerror = () => {
      alert("Google Picker API 스크립트 로드에 실패했습니다.");
      isLoading.value = false;
    };
    document.head.appendChild(script);
  }
};

async function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    const doc = data.docs[0];
    const fileId = doc.id;

    if (doc.mimeType !== "application/pdf") {
      alert("PDF 파일만 선택할 수 있습니다.");
      return;
    }

    fileName.value = doc.name;
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`파일 다운로드 실패: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      await loadPdf(new Uint8Array(arrayBuffer));
    } catch (error) {
      console.error("Google Drive 파일 처리 중 오류 발생:", error);
      alert("Google Drive 파일 처리 중 오류가 발생했습니다.");
    }
  }
}
</script>

<style scoped>
.pdf-extract-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  color: var(--text-color-primary);
}

.page-subtitle {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: var(--text-color-secondary);
}

/* --- Layout --- */
.pdf-extract-layout {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 1rem;
  flex-grow: 1;
  min-height: 0;
}

.pdf-viewer-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
}

/* Dynamic PDFJS elements */
:deep(.pdf-page-container) {
  position: relative;
  background-color: white;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.15),
    0 4px 10px rgba(0, 0, 0, 0.05);
  margin: 0 auto;
  user-select: text !important;
  -webkit-user-select: text !important;
}

:deep(.textLayer) {
  position: absolute;
  inset: 0;
  overflow: hidden;
  line-height: 1;
  opacity: 1;
  z-index: 5;
}

:deep(.textLayer span) {
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
  color: transparent; /* 글자는 안보이지만 드래그는 가능함 */
  user-select: text !important;
  -webkit-user-select: text !important;
}

:deep(.textLayer ::selection) {
  background: rgba(59, 130, 246, 0.3); /* 드래그 했을 때 나오는 색상 */
}

/* --- Responsiveness --- */
@media (max-width: 1200px) {
  .pdf-extract-layout {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 992px) {
  .pdf-extract-page {
    height: auto;
  }
  .pdf-extract-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .pdf-viewer-area {
    height: 60vh; /* PDF 영역을 조금 더 줄임 */
    min-height: 400px;
  }
}
</style>
