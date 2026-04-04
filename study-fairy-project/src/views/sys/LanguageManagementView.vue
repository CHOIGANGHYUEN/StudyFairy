<template>
  <div class="admin-container list-layout">
    <PageTitle>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon text-cyan-600"
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

    <!-- 언어 등록 폼 (기존 LanguageForm) -->
    <section class="card-section">
      <div class="card-header">
        <h2 class="section-title">새 언어 추가</h2>
      </div>
      <form @submit.prevent="handleRegisterSubmit">
        <div class="form-grid">
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
        <div class="p-4 border-t border-slate-200">
          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="isSubmitting || !isValid"
          >
            {{ isSubmitting ? "처리 중..." : "언어 등록" }}
          </button>
        </div>
      </form>
    </section>

    <!-- 목록 및 페이지네이션 영역 (스크롤 처리) -->
    <div class="card flex-1 flex flex-col min-h-0 mb-0">
      <div class="overflow-y-auto flex-1 p-0">
        <!-- 언어 목록 (기존 LanguageList) -->
        <section class="card-section list-section">
          <div class="card-header list-header">
            <h2 class="section-title">지원 언어 목록</h2>
            <span class="badge badge-cyan"
              >{{ paginatedLanguages.length }}개 언어</span
            >
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
                <tr v-for="lang in paginatedLanguages" :key="lang.id">
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
                <tr v-if="paginatedLanguages.length === 0">
                  <td colspan="6" class="empty-state">
                    등록된 언어 정보가 없습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <div class="border-t p-4 flex justify-center bg-white rounded-b-sm">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @update:current-page="currentPage = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import PageTitle from "@/components/PageTitle.vue";
import Pagination from "@/components/Pagination.vue";
import { useLanguageManagement } from "@/composables/sys/language/useLanguageManagement";

const {
  isSubmitting,
  currentPage,
  totalPages,
  paginatedLanguages,
  handleRegister,
  handleDelete,
} = useLanguageManagement();

const newLang = ref({
  langu: "",
  languNm: "",
});

const isValid = computed(() => {
  return (
    newLang.value.langu.trim() !== "" && newLang.value.languNm.trim() !== ""
  );
});

const handleRegisterSubmit = () => {
  if (isValid.value) {
    handleRegister({ ...newLang.value });
    newLang.value = { langu: "", languNm: "" };
  }
};

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.border-t {
  border-top-width: 1px;
}
.border-slate-200 {
  border-color: #e2e8f0;
}
.p-4 {
  padding: 1rem;
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
</style>
