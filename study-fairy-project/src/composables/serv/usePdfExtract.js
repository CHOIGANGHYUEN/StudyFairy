import { ref, shallowRef, watch } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/service/api";
import { useToast } from "@/composables/useToast";
import DOMPurify from "dompurify";
import { marked } from "marked";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export function usePdfExtract() {
  const pdfDocument = shallowRef(null);
  const currentPageNum = ref(1);
  const totalPages = ref(0);
  const currentScale = ref(1.25);
  const selectedText = ref("");
  const isLoading = ref(false);
  const authStore = useAuthStore();
  const fileName = ref("");
  const toast = useToast();

  const isCopying = ref(false);
  const showMarkdownModal = ref(false);
  const markdownContent = ref("");

  const selectedModel = ref("gemini-1.5-flash-preview");
  const availableModels = ref([
    {
      value: "gemini-1.5-flash-preview",
      label: "Gemini 1.5 Flash (빠름, 권장)",
    },
    {
      value: "gemini-1.5-pro-preview",
      label: "Gemini 1.5 Pro (고성능, 복잡한 추론)",
    },
    { value: "gemini-1.0-pro", label: "Gemini 1.0 Pro (일반)" },
  ]);
  const geminiQuestion = ref("");
  const geminiResponse = ref(
    "AI의 답변이 여기에 마크다운 형식으로 표시됩니다.",
  );
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
      geminiResponse.value = DOMPurify.sanitize(
        marked.parse(response.data.text),
      );
    } catch (err) {
      geminiError.value =
        "AI 질문 처리 중 오류: " +
        (err.response?.data?.message || "AI 요청에 실패했습니다.");
      geminiResponse.value = "오류가 발생했습니다. 다시 시도해주세요.";
    } finally {
      geminiIsLoading.value = false;
    }
  };

  const loadPdf = async (data) => {
    isLoading.value = true;
    try {
      pdfDocument.value = await pdfjsLib.getDocument({ data }).promise;
      totalPages.value = pdfDocument.value.numPages;
      currentPageNum.value = 1;
    } catch (err) {
      toast.error("PDF 파일을 불러오는 데 실패했습니다.");
      pdfDocument.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") return;
    fileName.value = file.name;
    await loadPdf(new Uint8Array(await file.arrayBuffer()));
  };

  const prevPage = () => {
    if (currentPageNum.value > 1) currentPageNum.value--;
  };
  const nextPage = () => {
    if (currentPageNum.value < totalPages.value) currentPageNum.value++;
  };
  const zoomIn = () => {
    if (currentScale.value < 3.0) currentScale.value += 0.25;
  };
  const zoomOut = () => {
    if (currentScale.value > 0.5) currentScale.value -= 0.25;
  };
  const goToPage = (e) => {
    let val = parseInt(e.target.value, 10);
    if (val >= 1 && val <= totalPages.value) currentPageNum.value = val;
    else e.target.value = currentPageNum.value;
  };
  const handleMouseUp = () => {
    const text = window.getSelection().toString();
    if (text.trim()) selectedText.value = text;
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
        texts.push(textContent.items.map((t) => t.str).join(" "));
      }
      markdownContent.value = texts.join("\n\n").trim();
    } catch (err) {
      markdownContent.value =
        "오류: PDF를 마크다운으로 변환하는 데 실패했습니다.";
    } finally {
      isCopying.value = false;
    }
  };

  const copyMarkdownFromModal = () => {
    if (!markdownContent.value) return;
    navigator.clipboard.writeText(markdownContent.value);
    toast.success("마크다운이 클립보드에 복사되었습니다.");
  };

  const pickerCallback = async (data) => {
    if (data.action === google.picker.Action.PICKED) {
      const doc = data.docs[0];
      if (doc.mimeType !== "application/pdf")
        return toast.warning("PDF 파일만 선택할 수 있습니다.");
      fileName.value = doc.name;
      try {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
          { headers: { Authorization: `Bearer ${authStore.accessToken}` } },
        );
        await loadPdf(new Uint8Array(await response.arrayBuffer()));
      } catch (error) {
        toast.error("Google Drive 파일 처리 중 오류가 발생했습니다.");
      }
    }
  };

  const openGoogleDrivePicker = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) return toast.warning("Google Picker API 키가 필요합니다.");
    if (!authStore.accessToken)
      return toast.warning("Google Drive 연동을 위해 로그인이 필요합니다.");
    window.gapi.load("picker", () => {
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .setOAuthToken(authStore.accessToken)
        .setDeveloperKey(apiKey)
        .setCallback(pickerCallback)
        .build();
      picker.setVisible(true);
    });
  };

  return {
    pdfDocument,
    currentPageNum,
    totalPages,
    currentScale,
    selectedText,
    isLoading,
    fileName,
    isCopying,
    showMarkdownModal,
    markdownContent,
    selectedModel,
    availableModels,
    geminiQuestion,
    geminiResponse,
    geminiIsLoading,
    geminiError,
    askGemini,
    onFileChange,
    prevPage,
    nextPage,
    zoomIn,
    zoomOut,
    goToPage,
    handleMouseUp,
    showMarkdown,
    copyMarkdownFromModal,
    openGoogleDrivePicker,
  };
}
