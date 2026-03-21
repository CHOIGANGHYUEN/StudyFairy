<template>
  <div class="summary-container">
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
      :summaryResult="summaryResult"
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
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

// 분리한 하위 컴포넌트 임포트
import ModelSection from "@/components/ModelSection.vue";
import FileSection from "@/components/FileSection.vue";
import TocSection from "@/components/TocSection.vue";
import PromptSection from "@/components/PromptSection.vue";
import ResultSection from "@/components/ResultSection.vue";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// 전역 상태 관리
const selectedModel = ref("gemini-3-flash-preview"); // 선택된 모델 상태 추가
const selectedFiles = ref([]);
const toc = ref([]);
const selectedTocItems = ref([]);
const summaryPrompt = ref("다음 내용을 요약해줘:");
const summaryResult = ref("");
const allContent = ref("");

// 로딩 및 에러 상태
const isLoading = ref(false);
const summaryLoading = ref(false);
const error = ref(null);

const authStore = useAuthStore();
const router = useRouter();

// Gemini API 초기화 (model은 실행 시점에 동적으로 할당하도록 밖에서 제외)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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

  gapi.load("picker", () => {
    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.DOCS)
      .setOAuthToken(authStore.accessToken)
      .setDeveloperKey(apiKey)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  });
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
  summaryResult.value = "";

  try {
    // 사용자가 선택한 모델 기반으로 AI 객체 생성
    const model = genAI.getGenerativeModel({ model: selectedModel.value });

    // 요약을 시작할 때 파일 내용을 파싱합니다.
    await readFileContent();

    if (!allContent.value) {
      alert("파일 내용이 비어있습니다.");
      isLoading.value = false;
      summaryLoading.value = false;
      return;
    }

    for (const item of selectedTocItems.value) {
      const prompt = `${summaryPrompt.value}\n---\n[전체 내용]:\n${allContent.value}\n---\n[요약할 주요 항목]:\n${item.title}\n---\n위 내용을 바탕으로 선택된 주요 항목에 초점을 맞춰서 상세하고 구조화된 요약을 생성해줘. 결과는 HTML 형식으로 제공해줘.`;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      summaryResult.value += `<h2>${item.title}</h2>\n${text}`;
    }
  } catch (err) {
    error.value = "요약 실행 중 오류가 발생했습니다: " + err.message;
    console.error(err);
  } finally {
    isLoading.value = false;
    summaryLoading.value = false;
  }
};

// --- 구글 독스 내보내기 로직 ---
const exportToGoogleDocs = async () => {
  if (!summaryResult.value) {
    alert("내보낼 요약 결과가 없습니다.");
    return;
  }

  if (!gapi.client.docs) {
    await new Promise((resolve, reject) => {
      gapi.client
        .load("https://docs.googleapis.com/$discovery/rest?version=v1")
        .then(resolve)
        .catch(reject);
    });
  }

  try {
    const createResponse = await gapi.client.docs.documents.create({
      title: "요약된 문서",
    });

    const documentId = createResponse.result.documentId;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = summaryResult.value;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    await gapi.client.docs.documents.batchUpdate({
      documentId,
      requests: [
        {
          insertText: {
            text: textContent,
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
.summary-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
