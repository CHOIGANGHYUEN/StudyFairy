import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "vue-router";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import api from "@/services";
import DOMPurify from "dompurify";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export function useSummary() {
  const authStore = useAuthStore();
  const router = useRouter();

  // 상태 관리
  const selectedModel = ref("gemini-1.5-flash-latest");
  const selectedFiles = ref([]);
  const toc = ref([]);
  const selectedTocItems = ref([]);
  const summaryPrompt = ref("다음 내용을 요약해줘:");
  const summaryResult = ref([]);
  const allContent = ref("");
  
  const isLoading = ref(false);
  const summaryLoading = ref(false);
  const error = ref(null);
  const newTocTitle = ref("");

  // --- 1. 파일 및 구글 드라이브 로직 ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    selectedFiles.value = [...selectedFiles.value, ...files];
  };

  const openGoogleDrivePicker = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      alert("Google Picker API 키가 필요합니다. .env 파일에 VITE_GOOGLE_API_KEY를 추가해주세요.");
      return;
    }
    if (!authStore.accessToken) {
      alert("구글 계정 로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    const initPicker = () => {
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

    if (window.gapi) {
      initPicker();
    } else {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.defer = true;
      script.onload = initPicker;
      script.onerror = () => alert("Google Picker API 스크립트 로드에 실패했습니다.");
      document.head.appendChild(script);
    }
  };

  const pickerCallback = (data) => {
    if (data.action === google.picker.Action.PICKED) {
      const newFiles = data.docs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        mimeType: doc.mimeType,
        isGoogleDrive: true,
      }));
      selectedFiles.value = [...selectedFiles.value, ...newFiles];
    }
  };

  const readFileContent = async () => {
    let combinedContent = "";
    for (const file of selectedFiles.value) {
      if (file.isGoogleDrive) {
        if (file.mimeType === "application/vnd.google-apps.document") {
          const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`,
            { headers: { Authorization: `Bearer ${authStore.accessToken}` } }
          );
          if (!response.ok) throw new Error(`Google Drive 파일 내용을 가져오는 데 실패했습니다. Status: ${response.status}`);
          combinedContent += (await response.text()) + "\n\n";
        } else if (file.mimeType === "application/pdf") {
          const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
            { headers: { Authorization: `Bearer ${authStore.accessToken}` } }
          );
          if (!response.ok) throw new Error(`Failed to fetch PDF file: ${response.statusText}`);

          const pdfData = await response.arrayBuffer();
          const pdf = await pdfjsLib.getDocument(pdfData).promise;
          let pdfText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            pdfText += textContent.items.map((s) => s.str).join(" ");
          }
          combinedContent += pdfText + "\n\n";
        } else {
          throw new Error(`'${file.name}' 파일은 지원되지 않는 형식입니다. Google Docs와 PDF 파일만 지원됩니다.`);
        }
      } else {
        const content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });
        combinedContent += content + "\n\n";
      }
    }
    allContent.value = combinedContent;
  };

  // --- 2. 목차 로직 ---
  const addToc = () => {
    if (!newTocTitle.value.trim()) return;
    const newItem = { title: newTocTitle.value.trim() };
    toc.value.push(newItem);
    selectedTocItems.value.push(newItem);
    newTocTitle.value = "";
  };

  // --- 3. 요약 실행 로직 ---
  const runSummary = async () => {
    if (selectedFiles.value.length === 0) return alert("요약할 파일을 먼저 선택해주세요.");
    if (selectedTocItems.value.length === 0) return alert("요약할 목차를 선택해주세요.");

    isLoading.value = true;
    summaryLoading.value = true;
    error.value = null;
    summaryResult.value = [];
    currentPage.value = 1;
    previewIndex.value = -1;

    try {
      await readFileContent();
      if (!allContent.value) {
        alert("파일 내용이 비어있습니다.");
        return;
      }

      for (const item of selectedTocItems.value) {
        const response = await api.post("/summary", {
          model: selectedModel.value,
          prompt: summaryPrompt.value,
          content: allContent.value,
          tocTitle: item.title,
        });
        summaryResult.value.push({ title: item.title, content: response.data.text });
      }
    } catch (err) {
      error.value = "요약 실행 중 오류가 발생했습니다: " + (err.response?.data?.message || err.message);
      console.error(err);
    } finally {
      isLoading.value = false;
      summaryLoading.value = false;
    }
  };

  // --- 4. 외부 서비스 연동 로직 (구글 독스, 다운로드, 스니타이즈) ---
  const exportToGoogleDocs = async (item) => { ... }; // 기존 로직
  // NOTE: 스크립트 길이를 줄이기 위해 exportToGoogleDocs 로직 전체를 통합했습니다.
  const exportToDocsImpl = async (item) => {
    if (!item || !item.content) return alert("내보낼 요약 결과가 없습니다.");
    const loadDocsApi = async () => {
      if (!window.gapi) await new Promise((resolve, reject) => { const s = document.createElement("script"); s.src = "https://apis.google.com/js/api.js"; s.onload = resolve; s.onerror = reject; document.head.appendChild(s); });
      if (!window.gapi.client) await new Promise((r) => window.gapi.load("client", r));
      if (!window.gapi.client.docs) await window.gapi.client.load("https://docs.googleapis.com/$discovery/rest?version=v1");
    };
    try {
      await loadDocsApi();
      const createResponse = await window.gapi.client.docs.documents.create({ title: item.title || "요약된 문서" });
      const documentId = createResponse.result.documentId;
      await window.gapi.client.docs.documents.batchUpdate({ documentId, requests: [{ insertText: { text: `# ${item.title}\n\n${item.content}`, location: { index: 1 } } }] });
      alert(`문서가 성공적으로 생성되었습니다! 링크: https://docs.google.com/document/d/${documentId}/edit`);
    } catch (err) {
      error.value = "Google Docs 내보내기 중 오류 발생: " + (err.result?.error?.message || err.message);
    }
  };

  // --- 5. 결과 목록 상태 (페이징, 토글) ---
  const currentPage = ref(1);
  const itemsPerPage = 5;
  const previewIndex = ref(-1);

  const totalPages = computed(() => Math.ceil(summaryResult.value.length / itemsPerPage));
  const paginatedResults = computed(() => summaryResult.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage));

  const prevPage = () => { if (currentPage.value > 1) { currentPage.value--; previewIndex.value = -1; } };
  const nextPage = () => { if (currentPage.value < totalPages.value) { currentPage.value++; previewIndex.value = -1; } };
  const togglePreview = (index) => { previewIndex.value = previewIndex.value === index ? -1 : index; };
  const sanitizedHTML = (html) => DOMPurify.sanitize(html);

  const downloadResult = (item) => {
    const blob = new Blob([`# ${item.title}\n\n${item.content}`], { type: "text/markdown;charset=utf-8;" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${item.title.replace(/[^a-zA-Z0-9가-힣\s]/g, "").trim() || "요약"}.md`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return { selectedModel, selectedFiles, toc, selectedTocItems, summaryPrompt, summaryResult, isLoading, summaryLoading, error, newTocTitle, handleFileChange, openGoogleDrivePicker, addToc, runSummary, exportToGoogleDocs: exportToDocsImpl, currentPage, totalPages, paginatedResults, previewIndex, prevPage, nextPage, togglePreview, sanitizedHTML, downloadResult };
}