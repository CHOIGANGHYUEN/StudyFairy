<template>
  <div class="admin-container">
    <header class="page-header">
      <h1 class="page-title">
        <div class="icon-wrapper">
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
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2 2 2 0 012 2v.65M20 12a8 8 0 11-16 0 8 8 0 0116 0z"
            />
          </svg>
        </div>
        시스템 언어 관리
      </h1>
      <p class="page-subtitle">
        시스템에서 지원하는 다국어 코드와 명칭을 설정합니다.
      </p>
    </header>

    <!-- 언어 등록 폼 섹션 -->
    <section class="card-section">
      <div class="card-header">
        <h2 class="section-title">새 언어 추가</h2>
      </div>
      <form @submit.prevent="handleRegister" class="registration-form">
        <div class="form-grid">
          <!-- 언어 코드 -->
          <div class="form-group">
            <label for="langu">언어 코드 (Code)</label>
            <div class="input-wrapper">
              <input
                type="text"
                id="langu"
                v-model="newLang.langu"
                placeholder="예: ko, en, ja"
                required
                :disabled="isSubmitting"
              />
            </div>
            <p class="input-hint">ISO 639-1 형식 권장 (예: ko, en)</p>
          </div>

          <!-- 언어 이름 -->
          <div class="form-group">
            <label for="languNm">언어 이름 (Name)</label>
            <div class="input-wrapper">
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
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn-primary"
            :disabled="isSubmitting || !isValid"
          >
            {{ isSubmitting ? "처리 중..." : "언어 등록" }}
          </button>
        </div>
      </form>
    </section>

    <!-- 언어 목록 테이블 섹션 -->
    <section class="card-section list-section">
      <div class="card-header list-header">
        <h2 class="section-title">지원 언어 목록</h2>
        <span class="badge">{{ languages.length }}개 언어</span>
      </div>

      <div class="table-container">
        <table class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>언어 코드</th>
              <th>언어 이름</th>
              <th>생성자</th>
              <th>생성일시</th>
              <th>수정자</th>
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
              <td>{{ lang.changedBy || "-" }}</td>
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

const isSubmitting = ref(false);
const languages = ref([]);

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

const fetchLanguages = async () => {
  // 초기 Mock 데이터 (테이블 인덱스 3 기준 시뮬레이션)
  languages.value = [
    {
      id: 1,
      langu: "ko",
      languNm: "한국어",
      createdBy: "SYSTEM",
      createdAt: new Date("2024-01-01").toISOString(),
      changedBy: "ADMIN",
      changedAt: new Date().toISOString(),
    },
    {
      id: 2,
      langu: "en",
      languNm: "English",
      createdBy: "SYSTEM",
      createdAt: new Date("2024-01-01").toISOString(),
      changedBy: "ADMIN",
      changedAt: new Date().toISOString(),
    },
  ];
};

const handleRegister = async () => {
  if (!isValid.value) return;

  isSubmitting.value = true;

  try {
    const registrationData = {
      langu: newLang.value.langu,
      languNm: newLang.value.languNm,
      createdBy: "ADMIN", // 실제 환경에서는 로그인된 사용자 정보
      createdAt: new Date().toISOString(),
      changedBy: "ADMIN",
      changedAt: new Date().toISOString(),
    };

    // API 통신 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 600));

    languages.value.unshift({
      id:
        languages.value.length > 0
          ? Math.max(...languages.value.map((l) => l.id)) + 1
          : 1,
      ...registrationData,
    });

    // 입력창 초기화
    newLang.value = { langu: "", languNm: "" };
    alert("새로운 언어가 성공적으로 등록되었습니다.");
  } catch (error) {
    alert("언어 등록 중 오류가 발생했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
</script>

<style scoped>
.admin-container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  text-align: left;
}

.page-header {
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.icon-wrapper {
  padding: 0.5rem;
  background-color: #f1f5f9;
  border-radius: 0.75rem;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #0891b2; /* 지구본 아이콘에 어울리는 Cyan 색상 */
}

.page-subtitle {
  color: #64748b;
  margin-top: 0.5rem;
  margin-left: 3.25rem;
}

.card-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.registration-form {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 2fr; /* 코드와 이름의 길이를 고려한 비율 */
  gap: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #0891b2;
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
}

.input-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.4rem;
}

.form-actions {
  margin-top: 1.5rem;
}

.btn-primary {
  width: 100%;
  background-color: #0891b2;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0e7490;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.user-table th {
  background-color: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}

.user-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
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

.font-bold {
  font-weight: 600;
  color: #0f172a;
}

.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: #94a3b8;
}

.user-table tr:hover td {
  background-color: #f8fafc;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
