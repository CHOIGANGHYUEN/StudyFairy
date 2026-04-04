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

    <LanguageForm :is-submitting="isSubmitting" @register="handleRegister" />

    <!-- 목록 및 페이지네이션 영역 (스크롤 처리) -->
    <div class="card flex-1 flex flex-col min-h-0 mb-0">
      <div class="overflow-y-auto flex-1 p-0">
        <LanguageList
          :languages="paginatedLanguages"
          :is-submitting="isSubmitting"
          @delete="handleDelete"
        />
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
import PageTitle from "@/components/PageTitle.vue";
import LanguageForm from "@/components/sys/language/LanguageForm.vue";
import LanguageList from "@/components/sys/language/LanguageList.vue";
import Pagination from "@/components/Pagination.vue"; // 만들어진 컴포넌트 경로 (가정)
import { useLanguageManagement } from "@/composables/sys/language/useLanguageManagement";

const {
  isSubmitting,
  currentPage,
  totalPages,
  paginatedLanguages,
  handleRegister,
  handleDelete,
} = useLanguageManagement();
</script>
