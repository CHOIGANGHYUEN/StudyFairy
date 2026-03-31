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

    <LanguageForm :is-submitting="isSubmitting" @register="handleRegister" />

    <section class="card-section search-section">
      <div class="search-grid">
        <div class="form-group">
          <label for="searchLangu">언어 코드</label>
          <input
            type="text"
            id="searchLangu"
            v-model="searchParams.langu"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="form-group">
          <label for="searchLanguNm">언어 이름</label>
          <input
            type="text"
            id="searchLanguNm"
            v-model="searchParams.languNm"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>
      <div class="search-actions">
        <button class="btn-primary search-btn" @click="handleSearch">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon-sm"
            fill="none"
            viewBox="0 0 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          조회
        </button>
      </div>
    </section>

    <LanguageList
      :languages="languages"
      :is-submitting="isSubmitting"
      :total-count="totalCount"
      :current-page="currentPage"
      :total-pages="totalPages"
      @delete="handleDelete"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import LanguageForm from "@/components/sys/language/LanguageForm.vue";
import LanguageList from "@/components/sys/language/LanguageList.vue";
import { useLanguageManagement } from "@/composables/useLanguageManagement";

const {
  isSubmitting,
  languages,
  searchParams,
  currentPage,
  totalPages,
  totalCount,
  handleRegister,
  handleDelete,
  handleSearch,
  handlePageChange,
} = useLanguageManagement();
</script>

<style scoped>
.icon {
  color: #0891b2; /* Cyan color for this page's icon */
}
.search-section {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
}
.search-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.search-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
.search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
}
.icon-sm {
  width: 1.2rem;
  height: 1.2rem;
}
</style>
