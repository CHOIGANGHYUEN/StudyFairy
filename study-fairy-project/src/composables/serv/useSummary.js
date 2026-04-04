import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/composables/useToast";
import { generateSummary } from "@/service/summaryService";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export function useSummary() {
  const authStore = useAuthStore();
  const router = useRouter();
  const toast = useToast();

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

  const openGoogleDrivePicker = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) return toast.warning("Google Picker API 키가 필요합니다.");
    if (!authStore.accessToken) {
      toast.warning("구글 계정 로그인이 필요합니다.");
      return router.push("/login");
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

    if (window.gapi) initPicker();
    else {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.defer = true;
      script.onload = initPicker;
      script.onerror = () =>
        toast.error("Google Picker API 스크립트 로드에 실패했습니다.");
      document.head.appendChild(script);
    }
  };

  const readFileContent = async () => {
    let combinedContent = "";
    for (const file of selectedFiles.value) {
      if (file.isGoogleDrive) {
        if (file.mimeType === "application/vnd.google-apps.document") {
          const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`,
            { headers: { Authorization: `Bearer ${authStore.accessToken}` } },
          );
          combinedContent += (await response.text()) + "\n\n";
        } else if (file.mimeType === "application/pdf") {
          const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
            { headers: { Authorization: `Bearer ${authStore.accessToken}` } },
          );
          const pdfData = await response.arrayBuffer();
          const pdf = await pdfjsLib.getDocument(pdfData).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            combinedContent +=
              textContent.items.map((s) => s.str).join(" ") + "\n\n";
          }
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

  const runSummary = async () => {
    if (selectedFiles.value.length === 0)
      return toast.warning("요약할 파일을 먼저 선택해주세요.");
    if (selectedTocItems.value.length === 0)
      return toast.warning("요약할 목차를 선택해주세요.");
    isLoading.value = true;
    summaryLoading.value = true;
    error.value = null;
    summaryResult.value = [];
    try {
      await readFileContent();
      if (!allContent.value) return toast.warning("파일 내용이 비어있습니다.");
      for (const item of selectedTocItems.value) {
        const response = await generateSummary({
          model: selectedModel.value,
          prompt: summaryPrompt.value,
          content: allContent.value,
          tocTitle: item.title,
        });
        summaryResult.value.push({
          title: item.title,
          content: response.data.text,
        });
      }
    } catch (err) {
      error.value = "요약 실행 중 오류가 발생했습니다.";
    } finally {
      isLoading.value = false;
      summaryLoading.value = false;
    }
  };

  const exportToGoogleDocs = async (item) => {
    if (!item || !item.content) return toast.warning("내보낼 결과가 없습니다.");
    try {
      if (!window.gapi.client)
        await new Promise((resolve) => window.gapi.load("client", resolve));
      if (!window.gapi.client.docs)
        await window.gapi.client.load(
          "https://docs.googleapis.com/$discovery/rest?version=v1",
        );
      const createResponse = await gapi.client.docs.documents.create({
        title: item.title || "요약된 문서",
      });
      const documentId = createResponse.result.documentId;
      await gapi.client.docs.documents.batchUpdate({
        documentId,
        requests: [
          {
            insertText: {
              text: `# ${item.title}\n\n${item.content}`,
              location: { index: 1 },
            },
          },
        ],
      });
      toast.success(
        `문서가 성공적으로 생성되었습니다! 링크: https://docs.google.com/document/d/${documentId}/edit`,
      );
    } catch (err) {
      error.value = "Google Docs 내보내기 중 오류 발생";
    }
  };

  return {
    selectedModel,
    selectedFiles,
    toc,
    selectedTocItems,
    summaryPrompt,
    summaryResult,
    isLoading,
    summaryLoading,
    error,
    openGoogleDrivePicker,
    runSummary,
    exportToGoogleDocs,
  };
}
