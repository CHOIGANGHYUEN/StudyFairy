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
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
      </template>
    </PageTitle>
    <section class="card-section search-section">
      <div class="search-grid">
        <div class="form-group">
          <label for="searchMenuNm">메뉴명</label>
          <input
            type="text"
            id="searchMenuNm"
            v-model="searchParams.menuNm"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="form-group">
          <label for="searchLangu">언어</label>
          <select id="searchLangu" v-model="searchParams.langu">
            <option value="">전체</option>
            <option
              v-for="lang in availableLanguages"
              :key="lang.langu"
              :value="lang.langu"
            >
              {{ lang.languNm }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="searchUseYn">사용 여부</label>
          <select id="searchUseYn" v-model="searchParams.useYn">
            <option value="">전체</option>
            <option value="1">사용</option>
            <option value="0">미사용</option>
          </select>
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
    <MenuForm
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      v-model:formData="menuForm"
      :available-languages="availableLanguages"
      :flat-menus="flatMenus"
      @submit="handleRegisterOrUpdate"
      @reset="resetForm"
    />

    <MenuList
      :menus="menuTree"
      :expanded-menus="expandedMenus"
      :current-page="currentPage"
      :total-pages="totalPages"
      @toggle="toggleMenu"
      @edit="editMenu"
      @delete="deleteMenu"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";
import MenuForm from "@/components/sys/menu/MenuForm.vue";
import MenuList from "@/components/sys/menu/MenuList.vue";
import { useMenuManagement } from "@/composables/useMenuManagement";

// composable 함수를 호출하여 필요한 모든 것을 구조 분해 할당으로 가져옵니다.
const {
  isSubmitting,
  isEditMode,
  menuForm,
  menuTree,
  availableLanguages,
  flatMenus,
  expandedMenus,
  currentPage,
  totalPages,
  searchParams,
  handleRegisterOrUpdate,
  resetForm,
  toggleMenu,
  editMenu,
  deleteMenu,
  handlePageChange,
  handleSearch,
} = useMenuManagement();
</script>

<style scoped>
.search-section {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
}
.search-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
