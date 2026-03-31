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
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      </template>
    </PageTitle>

    <div v-if="needsInitialization" class="initialization-prompt card-section">
      <h2 class="section-title">초기 설정 필요</h2>
      <p>
        코드 카테고리 데이터가 없습니다. 시스템의 기본 코드 카테고리를
        설정하려면 아래 버튼을 클릭하세요.
      </p>
      <button
        class="btn btn-primary"
        @click="handleInitialize"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "설정 중..." : "기본 카테고리 설정" }}
      </button>
    </div>

    <template v-else>
      <CodeCategorySelector
        :categories="categories"
        v-model="selectedCategory"
        @change="onCategoryChange"
      />
      <!-- Search Section -->
      <section class="card-section search-section">
        <div class="search-grid">
          <div class="form-group">
            <label for="searchGroupCode">그룹 코드</label>
            <input
              type="text"
              id="searchGroupCode"
              v-model="searchParams.groupCode"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="form-group">
            <label for="searchDescription">설명</label>
            <input
              type="text"
              id="searchDescription"
              v-model="searchParams.description"
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
              viewBox="0 0 24 24"
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

      <div class="code-management-layout">
        <div class="left-panel card-section">
          <CodeGroupList
            :code-heads="codeHeads"
            :selected-group-code="selectedGroupCode"
            @select-group="selectGroup"
          />
          <Pagination
            :current-page="pagination.heads.currentPage"
            :total-pages="pagination.heads.totalPages"
            @page-change="handleHeadPageChange"
          />
        </div>

        <div class="right-panel">
          <CodeGroupEditor
            v-model:formData="headForm"
            :head-form-mode="headFormMode"
            :is-submitting="isSubmitting"
            @new="newHead"
            @save="saveHead"
            @delete="deleteHead"
          />
          <CodeItemsManager
            :items="codeItems"
            :head-form="headForm"
            :selected-group-code="selectedGroupCode"
            :pagination="pagination.items"
            @save-item="handleSaveItem"
            @delete-item="deleteItem"
            @page-change="handleItemPageChange"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import Pagination from "@/components/common/Pagination.vue";
import CodeCategorySelector from "@/components/sys/code/CodeCategorySelector.vue";
import CodeGroupList from "@/components/sys/code/CodeGroupList.vue";
import CodeGroupEditor from "@/components/sys/code/CodeGroupEditor.vue";
import CodeItemsManager from "@/components/sys/code/CodeItemsManager.vue";
import { useCodeManagement } from "@/composables/useCodeManagement";

const {
  categories,
  selectedCategory,
  codeHeads,
  codeItems,
  selectedGroupCode,
  isSubmitting,
  headFormMode,
  needsInitialization,
  headForm,
  searchParams,
  pagination,
  handleInitialize,
  onCategoryChange,
  selectGroup,
  newHead,
  saveHead,
  deleteHead,
  handleSaveItem,
  deleteItem,
  handleHeadPageChange,
  handleItemPageChange,
  handleSearch,
} = useCodeManagement();
</script>

<style scoped>
.initialization-prompt {
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
}
.initialization-prompt p {
  margin: 1rem 0;
}
.code-management-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
  align-items: start;
}
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 0;
}
.search-section {
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
