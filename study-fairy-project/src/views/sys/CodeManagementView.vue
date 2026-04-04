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
      <!-- 카테고리 선택 (기존 CodeCategorySelector) -->
      <section class="card-section category-selector-section">
        <div class="form-group">
          <label for="category-select">코드 카테고리 선택</label>
          <select
            id="category-select"
            v-model="selectedCategory"
            @change="onCategoryChange"
          >
            <option
              v-for="cat in categories"
              :key="cat.subCode"
              :value="cat.subCode"
            >
              {{ cat.description }} ({{ cat.subCode }})
            </option>
          </select>
        </div>
      </section>

      <div class="master-detail-layout">
        <!-- Left Panel: Master List (with Pagination) -->
        <div class="master-panel card mb-0">
          <div class="overflow-y-auto flex-1 p-0">
            <!-- 코드 그룹 목록 (기존 CodeGroupList) -->
            <section class="card-section group-panel">
              <div class="card-header flex justify-between items-center">
                <h2 class="section-title">코드 그룹</h2>
              </div>
              <ul class="group-list">
                <li
                  v-for="head in paginatedCodeHeads"
                  :key="head.id"
                  class="group-item"
                  :class="{ active: selectedGroupCode === head.groupCode }"
                  @click="selectGroup(head)"
                >
                  <span>{{ head.groupCode }}</span>
                  <span class="desc">{{ head.description }}</span>
                </li>
                <li v-if="paginatedCodeHeads.length === 0" class="empty-state">
                  데이터가 없습니다.
                </li>
              </ul>
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

        <!-- Right Panel: Detail Editor & Items -->
        <div class="detail-panel">
          <!-- 코드 그룹 에디터 (기존 CodeGroupEditor) -->
          <section class="card-section head-editor-section">
            <div class="card-header flex justify-between items-center">
              <h2 class="section-title">
                {{ headFormMode === "create" ? "신규 그룹 생성" : "그룹 정보" }}
              </h2>
              <div class="form-actions">
                <button class="btn btn-secondary" @click="newHead">신규</button>
                <button
                  class="btn btn-primary"
                  @click="saveHead"
                  :disabled="isSubmitting || !headForm.categoryCode"
                >
                  {{ isSubmitting ? "저장중..." : "저장" }}
                </button>
                <button
                  v-if="headFormMode === 'edit'"
                  class="btn btn-danger"
                  @click="deleteHead(headForm.groupCode)"
                  :disabled="isSubmitting"
                >
                  삭제
                </button>
              </div>
            </div>
            <div class="form-container">
              <div class="form-grid head-form-grid">
                <div class="form-group">
                  <label>Group Code *</label>
                  <input
                    type="text"
                    v-model="headForm.groupCode"
                    :disabled="headFormMode === 'edit'"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Use</label>
                  <select v-model.number="headForm.useYn">
                    <option :value="1">Yes</option>
                    <option :value="0">No</option>
                  </select>
                </div>
                <div class="form-group head-form-grid-col-span-2">
                  <label>Description</label>
                  <input type="text" v-model="headForm.description" />
                </div>
              </div>
              <h3 class="subsection-title">상세 필드명 설정 (Field 1 ~ 10)</h3>
              <div class="form-grid field-names-grid">
                <div
                  class="form-group"
                  v-for="i in 10"
                  :key="`head-fieldNm${i}`"
                >
                  <label>Field {{ i }} 명칭</label>
                  <input
                    type="text"
                    v-model="headForm[`fieldNm${i}`]"
                    :placeholder="`미지정 시 Field ${i}`"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- 코드 아이템 목록 (기존 CodeItemsManager) -->
          <section class="card-section item-panel">
            <div class="card-header flex justify-between items-center">
              <h2 class="section-title">상세 코드 목록</h2>
              <button
                v-if="selectedGroupCode"
                class="btn-icon"
                @click="addNewItemRow"
                title="Add new code"
              >
                ➕
              </button>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="min-width: 150px">Sub Code</th>
                    <th style="min-width: 200px">Description</th>
                    <th style="min-width: 80px">Use</th>
                    <th
                      v-for="i in 10"
                      :key="`th-field${i}`"
                      style="min-width: 120px"
                    >
                      {{ headForm[`fieldNm${i}`] || `Field ${i}` }}
                    </th>
                    <th style="min-width: 100px" class="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(newItem, index) in newItems"
                    :key="`new-${index}`"
                    class="new-item-row"
                  >
                    <td>
                      <input
                        type="text"
                        v-model="newItem.subCode"
                        placeholder="New Sub Code"
                      />
                    </td>
                    <td><input type="text" v-model="newItem.description" /></td>
                    <td>
                      <select v-model.number="newItem.useYn">
                        <option :value="1">Y</option>
                        <option :value="0">N</option>
                      </select>
                    </td>
                    <td v-for="i in 10" :key="`new-field${i}`">
                      <input type="text" v-model="newItem[`field${i}`]" />
                    </td>
                    <td class="text-center">
                      <div class="action-buttons">
                        <button
                          @click="saveItemRow(newItem, index)"
                          class="btn-icon"
                        >
                          💾
                        </button>
                        <button
                          @click="removeNewItemRow(index)"
                          class="btn-icon"
                        >
                          ❌
                        </button>
                      </div>
                    </td>
                  </tr>
                  <template v-for="item in itemPaginatedItems" :key="item.id">
                    <tr v-if="editingItemId === item.id" class="edit-item-row">
                      <td>
                        <input
                          type="text"
                          v-model="editedItem.subCode"
                          disabled
                        />
                      </td>
                      <td>
                        <input type="text" v-model="editedItem.description" />
                      </td>
                      <td>
                        <select v-model.number="editedItem.useYn">
                          <option :value="1">Y</option>
                          <option :value="0">N</option>
                        </select>
                      </td>
                      <td v-for="i in 10" :key="`edit-field${i}`">
                        <input type="text" v-model="editedItem[`field${i}`]" />
                      </td>
                      <td class="text-center">
                        <div class="action-buttons">
                          <button
                            @click="saveItemRow(editedItem)"
                            class="btn-icon"
                          >
                            💾
                          </button>
                          <button @click="cancelEditItem()" class="btn-icon">
                            ↩️
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-else>
                      <td class="font-bold">{{ item.subCode }}</td>
                      <td>{{ item.description }}</td>
                      <td>
                        <span
                          :class="[
                            'status-badge',
                            item.useYn === 1 ? 'active' : 'inactive',
                          ]"
                          >{{ item.useYn === 1 ? "Y" : "N" }}</span
                        >
                      </td>
                      <td v-for="i in 10" :key="`view-field${i}`">
                        {{ item[`field${i}`] }}
                      </td>
                      <td class="text-center">
                        <div class="action-buttons">
                          <button @click="editItem(item)" class="btn-icon">
                            ✏️
                          </button>
                          <button @click="deleteItem(item)" class="btn-icon">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <tr
                    v-if="
                      selectedGroupCode &&
                      codeItems.length === 0 &&
                      newItems.length === 0
                    "
                  >
                    <td :colspan="14" class="empty-state">
                      상세 코드가 없습니다.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              class="pagination-wrapper"
              v-if="itemTotalPages > 0 && codeItems.length > 0"
            >
              <Pagination
                :current-page="itemCurrentPage"
                :total-pages="itemTotalPages"
                @page-change="itemCurrentPage = $event"
              />
            </div>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import PageTitle from "@/components/PageTitle.vue";
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

const editingItemId = ref(null);
const editedItem = ref(null);
const newItems = ref([]);

const itemCurrentPage = ref(1);
const itemPageSize = 10;
const itemPaginatedItems = computed(() => {
  const start = (itemCurrentPage.value - 1) * itemPageSize;
  const end = start + itemPageSize;
  return codeItems.value.slice(start, end);
});

const itemTotalPages = computed(
  () => Math.ceil(codeItems.value.length / itemPageSize) || 1,
);

watch(selectedGroupCode, () => {
  itemCurrentPage.value = 1;
  cancelEditItem();
  newItems.value = [];
});

const addNewItemRow = () => {
  if (editingItemId.value) cancelEditItem();
  const newItem = { subCode: "", description: "", useYn: 1 };
  for (let i = 1; i <= 10; i++) newItem[`field${i}`] = "";
  newItems.value.push(newItem);
};

const removeNewItemRow = (index) => {
  newItems.value.splice(index, 1);
};

const editItem = (item) => {
  newItems.value = [];
  editingItemId.value = item.id;
  editedItem.value = { ...item };
};

const cancelEditItem = () => {
  editingItemId.value = null;
  editedItem.value = null;
};

const saveItemRow = (itemData, index = null) => {
  handleSaveItem({ itemData, isCreate: index !== null, index });
  if (index === null) cancelEditItem();
};
</script>

<style scoped>
.category-selector-section {
  padding: 0.5rem 1.5rem 1.5rem;
}
.category-selector-section label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}
.category-selector-section select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #cbd5e1;
}

.group-panel {
  min-height: 400px;
}
.group-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.group-item {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}
.group-item:hover {
  background-color: #f8fafc;
}
.group-item.active {
  background-color: #e0e7ff;
  color: #4338ca;
  font-weight: 600;
}
.group-item .desc {
  font-size: 0.8rem;
  color: #64748b;
  display: block;
  margin-top: 2px;
}
.group-item.active .desc {
  color: #4f46e5;
}

.form-container {
  padding: 1.5rem;
}
.head-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.head-form-grid-col-span-2 {
  grid-column: span 2;
}
.subsection-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}
.field-names-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
}
.field-names-grid label {
  font-size: 0.85rem;
  color: #475569;
}
.field-names-grid input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  font-size: 0.85rem;
}
.form-actions {
  display: flex;
  gap: 0.5rem;
}

.data-table {
  width: 100%;
  border-top: 1px solid #e2e8f0;
  border-collapse: collapse;
  min-width: max-content;
}
.data-table th {
  position: sticky;
  top: 0;
  background-color: #f8fafc;
  z-index: 10;
}
.data-table td,
.data-table th {
  padding: 0.75rem;
  vertical-align: middle;
  text-align: left;
}
.data-table td input,
.data-table td select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #94a3b8;
  border-radius: 0.375rem;
  background-color: #f8fafc;
}
.new-item-row,
.edit-item-row {
  background-color: #f0f9ff;
}
</style>
