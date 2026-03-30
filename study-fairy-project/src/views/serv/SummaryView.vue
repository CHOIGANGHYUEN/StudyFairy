<template>
  <div class="admin-container">
    <h1>문서 요약 서비스</h1>
    <p v-if="error" style="color: red">오류: {{ error }}</p>

    <!-- 1. 파일 선택 영역 -->
    <FileSection
      v-model:selectedFiles="selectedFiles"
      :isLoading="isLoading"
      @open-drive="openGoogleDrivePicker"
    />

    <!-- 2. 목차 직접 입력 및 선택 영역 -->
    <TocSection
      v-model:toc="toc"
      v-model:selectedTocItems="selectedTocItems"
      :isLoading="isLoading"
    />

    <!-- 3. 프롬프트 입력 영역 -->
    <PromptSection v-model="summaryPrompt" :isLoading="isLoading" />
    <!-- 0. AI 모델 선택 영역 (추가됨) -->
    <ModelSection v-model="selectedModel" :isLoading="isLoading" />

    <!-- 4, 5. 실행 및 결과 영역 -->
    <ResultSection
      :results="summaryResult"
      :isLoading="isLoading"
      :summaryLoading="summaryLoading"
      :disabled="selectedTocItems.length === 0"
      @run="runSummary"
      @export="exportToGoogleDocs"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "vue-router";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import ModelSection from "@/components/serv/ModelSection.vue";
import PromptSection from "@/components/serv/PromptSection.vue";
import ResultSection from "@/components/serv/ResultSection.vue";
import TocSection from "@/components/serv/TocSection.vue";
import FileSection from "@/components/serv/FileSection.vue";
import api from "@/service/api";

// 분리한 하위 컴포넌트 임포트

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// 전역 상태 관리
const selectedModel = ref("gemini-1.5-flash-latest"); // 선택된 모델 상태 추가
const selectedFiles = ref([]);
const toc = ref([]);
const selectedTocItems = ref([]);
const summaryPrompt = ref("다음 내용을 요약해줘:");
const summaryResult = ref([]);
const allContent = ref("");

// 로딩 및 에러 상태
const isLoading = ref(false);
const summaryLoading = ref(false);
const error = ref(null);

const authStore = useAuthStore();
const router = useRouter();

// --- 구글 드라이브 파일 픽커 로직 ---
const openGoogleDrivePicker = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    alert(
      "Google Picker API 키가 필요합니다. .env 파일에 VITE_GOOGLE_API_KEY를 추가해주세요.",
    );
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
    script.onerror = () =>
      alert("Google Picker API 스크립트 로드에 실패했습니다.");
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

// --- 파일 파싱 로직 ---
const readFileContent = async () => {
  let combinedContent = "";
  for (const file of selectedFiles.value) {
    if (file.isGoogleDrive) {
      if (file.mimeType === "application/vnd.google-apps.document") {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`,
          { headers: { Authorization: `Bearer ${authStore.accessToken}` } },
        );
        if (!response.ok) {
          throw new Error(
            `Google Drive 파일 내용을 가져오는 데 실패했습니다. Status: ${response.status}`,
          );
        }
        combinedContent += (await response.text()) + "\n\n";
      } else if (file.mimeType === "application/pdf") {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          { headers: { Authorization: `Bearer ${authStore.accessToken}` } },
        );
        if (!response.ok)
          throw new Error(`Failed to fetch PDF file: ${response.statusText}`);

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
        throw new Error(
          `'${file.name}' 파일은 지원되지 않는 형식입니다. Google Docs와 PDF 파일만 지원됩니다.`,
        );
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

// --- 요약 실행 로직 ---
const runSummary = async () => {
  if (selectedFiles.value.length === 0) {
    alert("요약할 파일을 먼저 선택해주세요.");
    return;
  }
  if (selectedTocItems.value.length === 0) {
    alert("요약할 목차를 선택해주세요.");
    return;
  }

  isLoading.value = true;
  summaryLoading.value = true;
  error.value = null;
  summaryResult.value = [];

  try {
    // 요약을 시작할 때 파일 내용을 파싱합니다.
    await readFileContent();

    if (!allContent.value) {
      alert("파일 내용이 비어있습니다.");
      isLoading.value = false;
      summaryLoading.value = false;
      return;
    }

    for (const item of selectedTocItems.value) {
      const response = await api.post("/summary", {
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
    const message =
      err.response?.data?.message || err.message || "요약 요청에 실패했습니다.";
    error.value = "요약 실행 중 오류가 발생했습니다: " + message;
    console.error(err);
  } finally {
    isLoading.value = false;
    summaryLoading.value = false;
  }
};

// --- 구글 독스 내보내기 로직 ---
const exportToGoogleDocs = async (item) => {
  if (!item || !item.content) {
    alert("내보낼 요약 결과가 없습니다.");
    return;
  }

  const loadDocsApi = async () => {
    if (!window.gapi) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Google API 로드 실패"));
        document.head.appendChild(script);
      });
    }
    if (!window.gapi.client) {
      await new Promise((resolve) => window.gapi.load("client", resolve));
    }
    if (!window.gapi.client.docs) {
      await window.gapi.client.load(
        "https://docs.googleapis.com/$discovery/rest?version=v1",
      );
    }
  };

  try {
    await loadDocsApi();

    const createResponse = await gapi.client.docs.documents.create({
      title: item.title || "요약된 문서",
    });

    const documentId = createResponse.result.documentId;

    // Markdown 콘텐츠를 준비합니다.
    const markdownContent = `# ${item.title}\n\n${item.content}`;

    await gapi.client.docs.documents.batchUpdate({
      documentId,
      requests: [
        {
          insertText: {
            text: markdownContent,
            location: { index: 1 },
          },
        },
      ],
    });

    const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
    alert(`문서가 성공적으로 생성되었습니다! 링크: ${docUrl}`);
  } catch (err) {
    error.value =
      "Google Docs 내보내기 중 오류 발생: " +
      (err.result?.error?.message || err.message);
    console.error(err);
  }
};
</script>

<style scoped>
/* Container style is now handled by the global .admin-container class */
</style>
