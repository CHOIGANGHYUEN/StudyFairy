// src/composables/useMenuManagement.js
import { ref, computed, onMounted } from "vue";
import api from "@/services"; // services/index.js 에서 export default 된 axios 인스턴스

export function useMenuManagement() {
  const isSubmitting = ref(false);
  const isEditMode = ref(false);
  const editTargetId = ref(null);
  const menuTree = ref([]);
  const expandedMenus = ref([]);
  const availableLanguages = ref([]);

  const menuForm = ref({
    langu: "KO",
    menuId: "",
    menuNm: "",
    description: "",
    parentMenuId: "",
    path: "",
    menuLevel: 1,
    ordNum: 1,
    useYn: 1,
  });

  const searchParams = ref({
    menuNm: "",
    langu: "",
    useYn: "",
  });

  // Pagination State
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalCount = ref(0);
  const pageSize = 10;

  const flatMenus = computed(() => {
    const result = [];
    const traverse = (nodes) => {
      if (!nodes || !nodes.length) return;
      for (const node of nodes) {
        const { children, ...rest } = node;
        result.push(rest);
        traverse(children);
      }
    };
    traverse(menuTree.value);
    return result;
  });

  const toggleMenu = (id) => {
    const idx = expandedMenus.value.indexOf(id);
    if (idx > -1) expandedMenus.value.splice(idx, 1);
    else expandedMenus.value.push(id);
  };

  const fetchLanguages = async () => {
    try {
      const res = await api.get("/languages/list");
      availableLanguages.value = res.data;
      if (availableLanguages.value.length > 0 && !menuForm.value.langu) {
        menuForm.value.langu = availableLanguages.value[0].langu;
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  const fetchMenus = async (page = 1) => {
    try {
      const res = await api.get("/menus", {
        params: {
          page: page,
          limit: pageSize,
          ...searchParams.value,
        },
      });
      menuTree.value = res.data.data || [];
      totalPages.value = res.data.totalPages || 1;
      totalCount.value = res.data.totalCount || 0;
      currentPage.value = page;
    } catch (error) {
      console.error("Error fetching menus:", error);
      menuTree.value = [];
    }
  };

  const handlePageChange = (page) => {
    fetchMenus(page);
  };

  const handleSearch = () => {
    fetchMenus(1);
  };

  const handleRegisterOrUpdate = async () => {
    isSubmitting.value = true;
    try {
      const url = isEditMode.value ? `/menus/${editTargetId.value}` : "/menus";
      const method = isEditMode.value ? "put" : "post";
      const payload = {
        ...menuForm.value,
        parentMenuId: menuForm.value.parentMenuId || null,
      };
      await api[method](url, payload);
      alert("완료되었습니다.");
      resetForm();
      await fetchMenus();
    } catch (error) {
      const message = error.response?.data?.message || "작업에 실패했습니다.";
      alert(`오류: ${message}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  const editMenu = (m) => {
    isEditMode.value = true;
    editTargetId.value = m.id;
    menuForm.value = { ...m, parentMenuId: m.parentMenuId || "" };
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    isEditMode.value = false;
    editTargetId.value = null;
    menuForm.value = {
      langu:
        availableLanguages.value.length > 0
          ? availableLanguages.value[0].langu
          : "KO",
      menuId: "",
      menuNm: "",
      description: "",
      parentMenuId: "",
      path: "",
      menuLevel: 1,
      ordNum: 1,
      useYn: 1,
    };
  };

  const deleteMenu = async (id) => {
    if (
      !confirm("하위 메뉴까지 모두 삭제될 수 있습니다. 정말 삭제하시겠습니까?")
    )
      return;
    try {
      await api.delete(`/menus/${id}`);
      alert("삭제되었습니다.");
      await fetchMenus();
    } catch (error) {
      const message = error.response?.data?.message || "삭제에 실패했습니다.";
      alert(`오류: ${message}`);
    }
  };

  onMounted(() => {
    fetchLanguages();
    fetchMenus();
  });

  // 뷰 컴포넌트에서 사용할 데이터와 함수들을 반환
  return {
    isSubmitting,
    isEditMode,
    menuForm,
    menuTree,
    availableLanguages,
    flatMenus,
    expandedMenus,
    currentPage,
    totalPages,
    totalCount,
    searchParams,
    handleRegisterOrUpdate,
    resetForm,
    toggleMenu,
    editMenu,
    deleteMenu,
    handlePageChange,
    handleSearch,
  };
}
