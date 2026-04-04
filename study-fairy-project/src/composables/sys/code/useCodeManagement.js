import { ref, computed, onMounted } from "vue";
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
import { useToast } from "@/composables/useToast";

export function useCodeManagement() {
  const categories = ref([]);
  const selectedCategory = ref(null);
  const codeHeads = ref([]);
  const codeItems = ref([]);
  const selectedGroupCode = ref(null);
  const isSubmitting = ref(false);
  const headFormMode = ref("view");
  const needsInitialization = ref(false);
  const toast = useToast();

  const CATEGORY_CODE_FOR_CATEGORIES = "SYS";
  const GROUP_CODE_FOR_CATEGORIES = "CAT001";

  const getEmptyHeadForm = () => {
    const form = {
      categoryCode: selectedCategory.value,
      groupCode: "",
      description: "",
      useYn: 1,
    };
    for (let i = 1; i <= 10; i++) form[`fieldNm${i}`] = "";
    return form;
  };

  const headForm = ref(getEmptyHeadForm());
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalPages = computed(
    () => Math.ceil(codeHeads.value.length / itemsPerPage.value) || 1,
  );
  const paginatedCodeHeads = computed(() =>
    codeHeads.value.slice(
      (currentPage.value - 1) * itemsPerPage.value,
      currentPage.value * itemsPerPage.value,
    ),
  );

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
        if (!selectedCategory.value)
          selectedCategory.value = categories.value[0].subCode;
        await fetchHeads();
      } else {
        needsInitialization.value = true;
      }
    } catch (error) {
      needsInitialization.value = true;
    }
  };

  const handleInitialize = async () => {
    isSubmitting.value = true;
    try {
      await initializeCategories();
      toast.success("기본 카테고리가 성공적으로 설정되었습니다.");
      await fetchCategories();
    } catch (error) {
      toast.error(
        `초기화 실패: ${error.response?.data?.message || "Initialization failed"}`,
      );
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
      currentPage.value = 1;
      if (codeHeads.value.length > 0) selectGroup(codeHeads.value[0]);
      else newHead();
    } catch (error) {}
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
      codeItems.value = [];
    }
  };

  const selectGroup = (head) => {
    headForm.value = { ...getEmptyHeadForm(), ...head };
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
    if (!headForm.value.groupCode)
      return toast.warning("Group Code is required.");
    isSubmitting.value = true;
    const isCreate = headFormMode.value === "create";
    try {
      if (isCreate) await createCodeHead(headForm.value);
      else
        await updateCodeHead(
          selectedCategory.value,
          headForm.value.groupCode,
          headForm.value,
        );
      toast.success(`그룹이 ${isCreate ? "생성" : "저장"}되었습니다.`);
      await fetchHeads();
      const newGroup = codeHeads.value.find(
        (h) => h.groupCode === headForm.value.groupCode,
      );
      if (newGroup) selectGroup(newGroup);
    } catch (error) {
      toast.error(`저장 실패: ${error.response?.data?.message || "저장 실패"}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  const deleteHead = async (groupCode) => {
    if (!confirm(`[${groupCode}] 그룹을 삭제하시겠습니까?`)) return;
    try {
      await deleteCodeHead(selectedCategory.value, groupCode);
      toast.success("삭제되었습니다.");
      fetchHeads();
    } catch (error) {
      toast.error(`삭제 실패: ${error.response?.data?.message || "삭제 실패"}`);
    }
  };
  const handleSaveItem = async ({ itemData, isCreate }) => {
    if (!itemData.subCode) return toast.warning("Sub Code is required.");
    isSubmitting.value = true;
    const payload = {
      ...itemData,
      categoryCode: selectedCategory.value,
      groupCode: selectedGroupCode.value,
    };
    try {
      if (isCreate) await createCodeItem(payload);
      else
        await updateCodeItem(
          selectedCategory.value,
          selectedGroupCode.value,
          itemData.subCode,
          payload,
        );
      toast.success(`코드가 ${isCreate ? "생성" : "수정"}되었습니다.`);
      await fetchItems(selectedGroupCode.value);
    } catch (error) {
      toast.error(`저장 실패: ${error.response?.data?.message || "저장 실패"}`);
    } finally {
      isSubmitting.value = false;
    }
  };
  const deleteItem = async (item) => {
    if (!confirm(`[${item.subCode}] 코드를 삭제하시겠습니까?`)) return;
    try {
      await deleteCodeItem(item.categoryCode, item.groupCode, item.subCode);
      toast.success("삭제되었습니다.");
      fetchItems(item.groupCode);
    } catch (error) {
      toast.error(`삭제 실패: ${error.response?.data?.message || "삭제 실패"}`);
    }
  };

  onMounted(fetchCategories);
  return {
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
  };
}
