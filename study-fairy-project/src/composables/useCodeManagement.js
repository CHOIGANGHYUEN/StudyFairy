import { ref, onMounted, computed } from "vue";
import api from "@/services";

export function useCodeManagement() {
  // State
  const categories = ref([]);
  const selectedCategory = ref(null);
  const codeHeads = ref([]);
  const codeItems = ref([]);
  const selectedGroupCode = ref(null);
  const isSubmitting = ref(false);
  const headFormMode = ref("view"); // 'view', 'create', 'edit'
  const needsInitialization = ref(false);

  const searchParams = ref({
    groupCode: "",
    description: "",
  });

  const pagination = ref({
    heads: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      pageSize: 10,
    },
    items: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      pageSize: 10,
    },
  });

  const CATEGORY_CODE_FOR_CATEGORIES = "SYS";
  const GROUP_CODE_FOR_CATEGORIES = "CAT001";

  // Form State
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

  // Computed
  const isNewGroup = computed(() => headFormMode.value === "create");

  // Methods
  const fetchCategories = async () => {
    try {
      const res = await api.get(
        `/codes/items/${CATEGORY_CODE_FOR_CATEGORIES}/${GROUP_CODE_FOR_CATEGORIES}`,
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
      await api.post(`/codes/initialize-categories`);
      alert("기본 카테고리가 성공적으로 설정되었습니다.");
      await fetchCategories();
    } catch (error) {
      const message =
        error.response?.data?.message || "Initialization failed";
      alert(`초기화 실패: ${message}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  const onCategoryChange = () => {
    newHead();
    fetchHeads(1);
  };

  const fetchHeads = async (page = 1) => {
    if (!selectedCategory.value) return;
    try {
      const res = await api.get(`/codes/heads/${selectedCategory.value}`, {
        params: {
          page: page,
          limit: pagination.value.heads.pageSize,
          groupCode: searchParams.value.groupCode,
          description: searchParams.value.description,
        },
      });

      const responseData = res.data.data || res.data;
      codeHeads.value = Array.isArray(responseData) ? responseData : [];
      pagination.value.heads.currentPage = page;
      pagination.value.heads.totalPages = res.data.totalPages || 1;
      pagination.value.heads.totalCount =
        res.data.totalCount || responseData.length;

      if (codeHeads.value.length > 0) {
        selectGroup(codeHeads.value[0]);
      } else {
        newHead();
      }
    } catch (error) {
      console.error("Failed to fetch code heads:", error);
      codeHeads.value = [];
    }
  };

  const fetchItems = async (groupCode, page = 1) => {
    if (!selectedCategory.value || !groupCode) {
      codeItems.value = [];
      return;
    }
    try {
      const res = await api.get(
        `/codes/items/${selectedCategory.value}/${groupCode}`,
        {
          params: {
            page: page,
            limit: pagination.value.items.pageSize,
          },
        },
      );
      const responseData = res.data.data || res.data;
      codeItems.value = Array.isArray(responseData) ? responseData : [];
      pagination.value.items.currentPage = page;
      pagination.value.items.totalPages = res.data.totalPages || 1;
      pagination.value.items.totalCount =
        res.data.totalCount || responseData.length;
    } catch (error) {
      console.error("Failed to fetch code items:", error);
      codeItems.value = [];
    }
  };

  const selectGroup = (head) => {
    headForm.value = { ...getEmptyHeadForm(), ...head };
    selectedGroupCode.value = head.groupCode;
    headFormMode.value = "edit";
    fetchItems(head.groupCode, 1);
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
    const url = isCreate
      ? `/codes/heads`
      : `/codes/heads/${selectedCategory.value}/${headForm.value.groupCode}`;
    const method = isCreate ? "post" : "put";

    try {
      await api[method](url, headForm.value);
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
      await api.delete(`/codes/heads/${selectedCategory.value}/${groupCode}`);
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
    const url = isCreate
      ? `/codes/items`
      : `/codes/items/${selectedCategory.value}/${selectedGroupCode.value}/${itemData.subCode}`;
    const method = isCreate ? "post" : "put";
    const payload = {
      ...itemData,
      categoryCode: selectedCategory.value,
      groupCode: selectedGroupCode.value,
    };
    try {
      await api[method](url, payload);
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
      await api.delete(
        `/codes/items/${item.categoryCode}/${item.groupCode}/${item.subCode}`,
      );
      alert("삭제되었습니다.");
      fetchItems(item.groupCode);
    } catch (error) {
      const message = error.response?.data?.message || "삭제 실패";
      alert(`삭제 실패: ${message}`);
    }
  };

  const handleHeadPageChange = (page) => {
    fetchHeads(page);
  };

  const handleItemPageChange = (page) => {
    fetchItems(selectedGroupCode.value, page);
  };
  
  const handleSearch = () => {
    fetchHeads(1);
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
    isNewGroup,
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
    handleSearch
  };
}
