<template>
  <div class="admin-container">
    <PageTitle>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 012 2v.65M20 12a8 8 0 11-16 0 8 8 0 0116 0z"
          />
        </svg>
      </template>
    </PageTitle>

    <!-- 언어 등록 폼 섹션 -->
    <section class="card-section">
      <div class="card-header">
        <h2 class="section-title">새 언어 추가</h2>
      </div>
      <form @submit.prevent="handleRegister">
        <div class="form-grid">
          <!-- 언어 코드 -->
          <div class="form-group">
            <label for="langu">언어 코드 (Code) *</label>
            <input
              type="text"
              id="langu"
              v-model="newLang.langu"
              placeholder="예: ko, en"
              required
              :disabled="isSubmitting"
            />
            <p class="input-hint">ISO 639-1 형식 권장 (예: ko, en)</p>
          </div>

          <!-- 언어 이름 -->
          <div class="form-group">
            <label for="languNm">언어 이름 (Name) *</label>
            <input
              type="text"
              id="languNm"
              v-model="newLang.languNm"
              placeholder="예: 한국어, English"
              required
              :disabled="isSubmitting"
            />
          </div>
        </div>
        <button
          type="submit"
          class="btn-primary"
          :disabled="isSubmitting || !isValid"
        >
          {{ isSubmitting ? "처리 중..." : "언어 등록" }}
        </button>
      </form>
    </section>

    <!-- 언어 목록 테이블 섹션 -->
    <section class="card-section list-section">
      <div class="card-header list-header">
        <h2 class="section-title">지원 언어 목록</h2>
        <span class="badge">{{ languages.length }}개 언어</span>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>언어 코드</th>
              <th>언어 이름</th>
              <th>생성자</th>
              <th>생성일시</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lang in languages" :key="lang.id">
              <td>{{ lang.id }}</td>
              <td>
                <span class="lang-code-badge">{{ lang.langu }}</span>
              </td>
              <td class="font-bold">{{ lang.languNm }}</td>
              <td>{{ lang.createdBy || "SYSTEM" }}</td>
              <td>{{ formatDate(lang.createdAt) }}</td>
              <td class="text-center">
                <div class="action-buttons">
                  <button
                    @click="handleDelete(lang.id)"
                    class="btn-icon"
                    :disabled="isSubmitting"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="languages.length === 0">
              <td colspan="6" class="empty-state">
                등록된 언어 정보가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/service/api"; // Axios 인스턴스 임포트
import { useAuthStore } from "@/stores/useAuthStore";
import PageTitle from "@/components/PageTitle.vue";

const isSubmitting = ref(false);
const languages = ref([]);
const authStore = useAuthStore();

const newLang = ref({
  langu: "",
  languNm: "",
});

const isValid = computed(() => {
  return (
    newLang.value.langu.trim() !== "" && newLang.value.languNm.trim() !== ""
  );
});

onMounted(() => {
  fetchLanguages();
});

// 1. 언어 목록 조회 (Axios 사용)
const fetchLanguages = async () => {
  try {
    const response = await api.get("/languages");
    languages.value = response.data;
  } catch (error) {
    console.error("언어 목록 조회 에러:", error);
    alert("언어 목록을 불러오는 중 오류가 발생했습니다.");
  }
};

// 2. 언어 등록 (Axios 사용)
const handleRegister = async () => {
  if (!isValid.value) return;

  isSubmitting.value = true;

  try {
    const registrationData = {
      langu: newLang.value.langu,
      languNm: newLang.value.languNm,
      createdBy: authStore.user?.userId || "ADMIN", // 스토어에서 사용자 ID 가져오기
    };

    await api.post("/languages", registrationData);

    // 성공 시 입력창 초기화
    newLang.value = { langu: "", languNm: "" };
    alert("새로운 언어가 성공적으로 등록되었습니다.");

    // DB에서 최신 목록을 다시 불러오기
    await fetchLanguages();
  } catch (error) {
    console.error("언어 등록 에러:", error);
    if (error.response && error.response.status === 409) {
      alert("이미 존재하는 언어 코드입니다. 다른 코드를 입력해주세요.");
    } else {
      alert("언어 등록 중 오류가 발생했습니다.");
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 3. 언어 삭제 (Axios 사용)
const handleDelete = async (id) => {
  if (!confirm("정말로 이 언어를 삭제하시겠습니까?")) return;

  isSubmitting.value = true;
  try {
    await api.delete(`/languages/${id}`);
    alert("성공적으로 삭제되었습니다.");
    // 삭제 후 최신 목록 갱신
    await fetchLanguages();
  } catch (error) {
    console.error("언어 삭제 에러:", error);
    alert("언어 삭제 중 오류가 발생했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(
    2,
    "0",
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
/* LanguageManagementView에만 적용되는 고유 스타일 */
.icon {
  color: #0891b2; /* Cyan color for this page's icon */
}
.input-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.4rem;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.badge {
  background-color: #ecfeff;
  color: #0891b2;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.table-container {
  overflow-x: auto;
}
.data-table tr:hover td {
  background-color: #f8fafc;
}
.lang-code-badge {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 700;
  font-family: monospace;
  border: 1px solid #e2e8f0;
}
.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: #94a3b8;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
