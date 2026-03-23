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
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        </div>
        공통 코드 관리
      </h1>
    </header>

    <!-- Initialization Prompt -->
    <div v-if="needsInitialization" class="initialization-prompt card-section">
      <h2 class="section-title">초기 설정 필요</h2>
      <p>
        코드 카테고리 데이터가 없습니다. 시스템의 기본 코드 카테고리를
        설정하려면 아래 버튼을 클릭하세요.
      </p>
      <button class="btn" @click="handleInitialize" :disabled="isSubmitting">
        {{ isSubmitting ? "설정 중..." : "기본 카테고리 설정" }}
      </button>
    </div>

    <template v-else>
      <!-- Category Selector -->
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

      <div class="code-management-layout">
        <!-- Left Panel: Code Groups List -->
        <section class="card-section group-panel">
          <div class="card-header flex justify-between items-center">
            <h2 class="section-title">코드 그룹</h2>
          </div>
          <ul class="group-list">
            <li
              v-for="head in codeHeads"
              :key="head.id"
              class="group-item"
              :class="{ active: selectedGroupCode === head.groupCode }"
              @click="selectGroup(head)"
            >
              <span>{{ head.groupCode }}</span>
              <span class="desc">{{ head.description }}</span>
            </li>
          </ul>
        </section>

        <!-- Right Panel: Head Editor and Code Items -->
        <div class="right-panel">
          <!-- Head Editor Form -->
          <section class="card-section head-editor-section">
            <div class="card-header flex justify-between items-center">
              <h2 class="section-title">
                {{ headFormMode === "create" ? "신규 그룹 생성" : "그룹 정보" }}
              </h2>
              <div class="form-actions">
                <button class="btn btn-secondary" @click="newHead">신규</button>
                <button
                  class="btn"
                  @click="saveHead"
                  :disabled="isSubmitting || !selectedCategory"
                >
                  {{ isSubmitting ? "저장중..." : "저장" }}
                </button>
                <button
                  v-if="headFormMode === 'edit'"
                  class="btn btn-delete"
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

              <!-- Field Names (fieldNm1 ~ fieldNm10) 설정 섹션 -->
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

          <!-- Code Items Table -->
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
                    <!-- Field 1 ~ 10 헤더: headForm에 입력된 명칭을 반영 -->
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
                  <!-- New Item Rows -->
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
                    <!-- Field 1 ~ 10 입력창 동적 생성 -->
                    <td v-for="i in 10" :key="`new-field${i}`">
                      <input type="text" v-model="newItem[`field${i}`]" />
                    </td>
                    <td class="text-center">
                      <div class="action-buttons">
                        <button
                          @click="saveItem(newItem, index)"
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

                  <!-- Existing Item List -->
                  <template v-for="item in codeItems" :key="item.id">
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
                      <!-- Field 1 ~ 10 수정창 동적 생성 -->
                      <td v-for="i in 10" :key="`edit-field${i}`">
                        <input type="text" v-model="editedItem[`field${i}`]" />
                      </td>
                      <td class="text-center">
                        <div class="action-buttons">
                          <button
                            @click="saveItem(editedItem)"
                            class="btn-icon"
                          >
                            💾
                          </button>
                          <button @click="cancelEdit()" class="btn-icon">
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
                      <!-- Field 1 ~ 10 데이터 출력 동적 생성 -->
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
                    <!-- 컬럼이 총 14개(subCode, description, useYn, field 10개, actions)이므로 colspan 14 적용 -->
                    <td colspan="14" class="empty-row">
                      상세 코드가 없습니다.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const categories = ref([]);
const selectedCategory = ref(null);
const codeHeads = ref([]);
const codeItems = ref([]);
const selectedGroupCode = ref(null);
const isSubmitting = ref(false);
const headFormMode = ref("view");

// 초기 headForm 객체를 생성하는 헬퍼 함수
const getEmptyHeadForm = () => {
  const form = {
    categoryCode: "",
    groupCode: "",
    description: "",
    useYn: 1,
  };
  // fieldNm1 ~ fieldNm10 빈 값 설정
  for (let i = 1; i <= 10; i++) {
    form[`fieldNm${i}`] = "";
  }
  return form;
};

const headForm = ref(getEmptyHeadForm());
const editingItemId = ref(null);
const editedItem = ref(null);
const newItems = ref([]);
const needsInitialization = ref(false);

const API_URL = "http://localhost:3000/api/codes";
const CATEGORY_CODE_FOR_CATEGORIES = "SYS";
const GROUP_CODE_FOR_CATEGORIES = "CAT001";

const fetchCategories = async () => {
  try {
    const res = await fetch(
      `${API_URL}/items/${CATEGORY_CODE_FOR_CATEGORIES}/${GROUP_CODE_FOR_CATEGORIES}`,
    );
    if (!res.ok) throw new Error("Failed to fetch categories");
    categories.value = await res.json();
    if (categories.value.length > 0) {
      needsInitialization.value = false;
      selectedCategory.value = categories.value[0].subCode;
      fetchHeads();
    } else {
      needsInitialization.value = true;
    }
  } catch (error) {
    console.error("Category fetch error:", error);
    needsInitialization.value = true;
  }
};

const handleInitialize = async () => {
  isSubmitting.value = true;
  try {
    const res = await fetch(`${API_URL}/initialize-categories`, {
      method: "POST",
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || "Initialization failed");
    alert("기본 카테고리가 성공적으로 설정되었습니다.");
    await fetchCategories();
  } catch (error) {
    alert(`초기화 실패: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const onCategoryChange = () => {
  newHead();
  fetchHeads();
};

const fetchHeads = async () => {
  if (!selectedCategory.value) return;
  try {
    const res = await fetch(`${API_URL}/heads/${selectedCategory.value}`);
    if (!res.ok) throw new Error("Failed to fetch code groups");
    codeHeads.value = await res.json();
    if (codeHeads.value.length > 0) {
      selectGroup(codeHeads.value[0]);
    } else {
      newHead();
    }
  } catch (error) {
    console.error(error);
  }
};

const fetchItems = async (groupCode) => {
  cancelEdit();
  if (!selectedCategory.value || !groupCode) {
    codeItems.value = [];
    return;
  }
  try {
    const res = await fetch(
      `${API_URL}/items/${selectedCategory.value}/${groupCode}`,
    );
    if (!res.ok) throw new Error("Failed to fetch code items");
    codeItems.value = await res.json();
  } catch (error) {
    console.error(error);
  }
};

const selectGroup = (head) => {
  if (editingItemId.value) cancelEdit();

  // API에서 넘어온 데이터에 누락된 필드가 있을 수 있으므로 기본 객체와 병합
  const baseForm = getEmptyHeadForm();
  headForm.value = { ...baseForm, ...head };

  selectedGroupCode.value = head.groupCode;
  headFormMode.value = "edit";
  fetchItems(head.groupCode);
};

const newHead = () => {
  const form = getEmptyHeadForm();
  form.categoryCode = selectedCategory.value;
  headForm.value = form;

  selectedGroupCode.value = null;
  codeItems.value = [];
  headFormMode.value = "create";
  cancelEdit();
};

const saveHead = async () => {
  if (!headForm.value.groupCode) {
    alert("Group Code is required.");
    return;
  }
  isSubmitting.value = true;
  headForm.value.categoryCode = selectedCategory.value;
  const isCreate = headFormMode.value === "create";
  const url = isCreate
    ? `${API_URL}/heads`
    : `${API_URL}/heads/${selectedCategory.value}/${headForm.value.groupCode}`;
  const method = isCreate ? "POST" : "PUT";
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(headForm.value),
    });
    if (!res.ok) {
      throw new Error((await res.json()).message);
    }
    alert(`그룹이 ${isCreate ? "생성" : "저장"}되었습니다.`);
    await fetchHeads();
    const newGroup = codeHeads.value.find(
      (h) => h.groupCode === headForm.value.groupCode,
    );
    if (newGroup) selectGroup(newGroup);
  } catch (error) {
    alert(`저장 실패: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const deleteHead = async (groupCode) => {
  if (!confirm(`[${groupCode}] 그룹을 삭제하시겠습니까?`)) return;
  try {
    const res = await fetch(
      `${API_URL}/heads/${selectedCategory.value}/${groupCode}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      throw new Error((await res.json()).message);
    }
    alert("삭제되었습니다.");
    fetchHeads();
  } catch (error) {
    alert(`삭제 실패: ${error.message}`);
  }
};

const addNewItemRow = () => {
  if (editingItemId.value) cancelEdit();

  // 새 항목 추가 시 field1 ~ field10 속성을 기본적으로 포함시킵니다.
  const newItem = {
    subCode: "",
    description: "",
    useYn: 1,
    tempId: Date.now(),
  };
  for (let i = 1; i <= 10; i++) {
    newItem[`field${i}`] = "";
  }

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
const cancelEdit = () => {
  editingItemId.value = null;
  editedItem.value = null;
};

const saveItem = async (itemData, index = null) => {
  if (!itemData.subCode) {
    alert("Sub Code is required.");
    return;
  }
  isSubmitting.value = true;
  const isCreate = index !== null;
  const url = isCreate
    ? `${API_URL}/items`
    : `${API_URL}/items/${selectedCategory.value}/${selectedGroupCode.value}/${itemData.subCode}`;
  const method = isCreate ? "POST" : "PUT";
  const payload = {
    ...itemData,
    categoryCode: selectedCategory.value,
    groupCode: selectedGroupCode.value,
  };
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error((await res.json()).message);
    }
    alert(`코드가 ${isCreate ? "생성" : "수정"}되었습니다.`);
    if (isCreate) removeNewItemRow(index);
    fetchItems(selectedGroupCode.value);
  } catch (error) {
    alert(`저장 실패: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const deleteItem = async (item) => {
  if (!confirm(`[${item.subCode}] 코드를 삭제하시겠습니까?`)) return;
  try {
    const res = await fetch(
      `${API_URL}/items/${item.categoryCode}/${item.groupCode}/${item.subCode}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      throw new Error((await res.json()).message);
    }
    alert("삭제되었습니다.");
    fetchItems(item.groupCode);
  } catch (error) {
    alert(`삭제 실패: ${error.message}`);
  }
};

onMounted(fetchCategories);
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
.code-management-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
  align-items: start;
}
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 0;
}
.card-header {
  padding: 1rem 1.5rem;
}
.group-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: calc(100vh - 420px);
  overflow-y: auto;
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

/* 필드명 설정 영역 스타일 */
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
  grid-template-columns: repeat(5, 1fr); /* 5칸씩 2줄 배치 */
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
.btn-delete {
  background-color: #ef4444;
  color: white;
}
.btn-delete:hover:not(:disabled) {
  background-color: #dc2626;
}

.table-container {
  max-height: calc(100vh - 500px);
  overflow-y: auto;
  overflow-x: auto;
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
.empty-row {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}
</style>
