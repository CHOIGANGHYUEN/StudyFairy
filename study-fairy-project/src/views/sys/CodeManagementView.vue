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

      <div class="code-management-layout">
        <CodeGroupList
          :code-heads="codeHeads"
          :selected-group-code="selectedGroupCode"
          @select-group="selectGroup"
        />

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
            @save-item="handleSaveItem"
            @delete-item="deleteItem"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  getCodeCategories,
  initializeCategories,
  getCodeHeads,
  getCodeItems,
  createCodeHead,
  updateCodeHead,
  deleteCodeHead,
  createCodeItem,
  updateCodeItem,
  deleteCodeItem,
} from "@/service/codeService";
import PageTitle from "@/components/PageTitle.vue";
import CodeCategorySelector from "@/components/sys/code/CodeCategorySelector.vue";
import CodeGroupList from "@/components/sys/code/CodeGroupList.vue";
import CodeGroupEditor from "@/components/sys/code/CodeGroupEditor.vue";
import CodeItemsManager from "@/components/sys/code/CodeItemsManager.vue";

const categories = ref([]);
const selectedCategory = ref(null);
const codeHeads = ref([]);
const codeItems = ref([]);
const selectedGroupCode = ref(null);
const isSubmitting = ref(false);
const headFormMode = ref("view");
const needsInitialization = ref(false);

const CATEGORY_CODE_FOR_CATEGORIES = "SYS";
const GROUP_CODE_FOR_CATEGORIES = "CAT001";

const getEmptyHeadForm = () => {
  const form = {
    categoryCode: selectedCategory.value,
    groupCode: "",
    description: "",
    useYn: 1,
  };
  for (let i = 1; i <= 10; i++) {
    form[`fieldNm${i}`] = "";
  }
  return form;
};

const headForm = ref(getEmptyHeadForm());

const fetchCategories = async () => {
  try {
    const res = await getCodeCategories(
      CATEGORY_CODE_FOR_CATEGORIES,
      GROUP_CODE_FOR_CATEGORIES,
    );
    const responseData = res.data.data || res.data;
    categories.value = Array.isArray(responseData) ? responseData : [];
    if (categories.value.length > 0) {
      needsInitialization.value = false;
      if (!selectedCategory.value) {
        selectedCategory.value = categories.value[0].subCode;
      }
      await fetchHeads();
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
    await initializeCategories();
    alert("기본 카테고리가 성공적으로 설정되었습니다.");
    await fetchCategories();
  } catch (error) {
    const message = error.response?.data?.message || "Initialization failed";
    alert(`초기화 실패: ${message}`);
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
    const res = await getCodeHeads(selectedCategory.value);
    const responseData = res.data.data || res.data;
    codeHeads.value = Array.isArray(responseData) ? responseData : [];
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
  if (!selectedCategory.value || !groupCode) {
    codeItems.value = [];
    return;
  }
  try {
    const res = await getCodeItems(selectedCategory.value, groupCode);
    const responseData = res.data.data || res.data;
    codeItems.value = Array.isArray(responseData) ? responseData : [];
  } catch (error) {
    console.error(error);
    codeItems.value = [];
  }
};

const selectGroup = (head) => {
  const baseForm = getEmptyHeadForm();
  headForm.value = { ...baseForm, ...head };
  selectedGroupCode.value = head.groupCode;
  headFormMode.value = "edit";
  fetchItems(head.groupCode);
};

const newHead = () => {
  headForm.value = getEmptyHeadForm();
  selectedGroupCode.value = null;
  codeItems.value = [];
  headFormMode.value = "create";
};

const saveHead = async () => {
  if (!headForm.value.groupCode) {
    alert("Group Code is required.");
    return;
  }
  isSubmitting.value = true;
  const isCreate = headFormMode.value === "create";

  try {
    if (isCreate) {
      await createCodeHead(headForm.value);
    } else {
      await updateCodeHead(
        selectedCategory.value,
        headForm.value.groupCode,
        headForm.value,
      );
    }
    alert(`그룹이 ${isCreate ? "생성" : "저장"}되었습니다.`);
    await fetchHeads();
    const newGroup = codeHeads.value.find(
      (h) => h.groupCode === headForm.value.groupCode,
    );
    if (newGroup) selectGroup(newGroup);
  } catch (error) {
    const message = error.response?.data?.message || "저장 실패";
    alert(`저장 실패: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const deleteHead = async (groupCode) => {
  if (!confirm(`[${groupCode}] 그룹을 삭제하시겠습니까?`)) return;
  try {
    await deleteCodeHead(selectedCategory.value, groupCode);
    alert("삭제되었습니다.");
    fetchHeads();
  } catch (error) {
    const message = error.response?.data?.message || "삭제 실패";
    alert(`삭제 실패: ${message}`);
  }
};

const handleSaveItem = async ({ itemData, isCreate }) => {
  if (!itemData.subCode) {
    alert("Sub Code is required.");
    return;
  }
  isSubmitting.value = true;
  const payload = {
    ...itemData,
    categoryCode: selectedCategory.value,
    groupCode: selectedGroupCode.value,
  };
  try {
    if (isCreate) {
      await createCodeItem(payload);
    } else {
      await updateCodeItem(
        selectedCategory.value,
        selectedGroupCode.value,
        itemData.subCode,
        payload,
      );
    }
    alert(`코드가 ${isCreate ? "생성" : "수정"}되었습니다.`);
    await fetchItems(selectedGroupCode.value);
  } catch (error) {
    const message = error.response?.data?.message || "저장 실패";
    alert(`저장 실패: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const deleteItem = async (item) => {
  if (!confirm(`[${item.subCode}] 코드를 삭제하시겠습니까?`)) return;
  try {
    await deleteCodeItem(item.categoryCode, item.groupCode, item.subCode);
    alert("삭제되었습니다.");
    fetchItems(item.groupCode);
  } catch (error) {
    const message = error.response?.data?.message || "삭제 실패";
    alert(`삭제 실패: ${message}`);
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
</style>
