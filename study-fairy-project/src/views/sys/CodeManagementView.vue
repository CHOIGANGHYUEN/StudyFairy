<template>
  <div class="admin-container list-layout">
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

    <div v-if="needsInitialization" class="card-section text-center py-8 mb-8">
      <h2 class="section-title">초기 설정 필요</h2>
      <p class="my-4">
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

      <div class="master-detail-layout">
        <!-- Left Panel: Master List (with Pagination) -->
        <div class="master-panel card mb-0">
          <div class="overflow-y-auto flex-1 p-0">
            <CodeGroupList
              :code-heads="paginatedCodeHeads"
              :selected-group-code="selectedGroupCode"
              @select-group="selectGroup"
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

        <!-- Right Panel: Detail Editor & Items -->
        <div class="detail-panel">
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
            @save-item="handleSaveItem"
            @delete-item="deleteItem"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import CodeCategorySelector from "@/components/sys/code/CodeCategorySelector.vue";
import CodeGroupList from "@/components/sys/code/CodeGroupList.vue";
import CodeGroupEditor from "@/components/sys/code/CodeGroupEditor.vue";
import CodeItemsManager from "@/components/sys/code/CodeItemsManager.vue";
import Pagination from "@/components/Pagination.vue";
import { useCodeManagement } from "@/composables/sys/code/useCodeManagement";

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
  currentPage,
  totalPages,
  paginatedCodeHeads,
  handleInitialize,
  onCategoryChange,
  selectGroup,
  newHead,
  saveHead,
  deleteHead,
  handleSaveItem,
  deleteItem,
} = useCodeManagement();
</script>
