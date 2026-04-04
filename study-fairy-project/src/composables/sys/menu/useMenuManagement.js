import { ref, computed, onMounted } from "vue";
import { getLanguages } from "@/service/languageService";
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from "@/service/menuService";
import { useToast } from "@/composables/useToast";

export function useMenuManagement() {
  const isSubmitting = ref(false);
  const isEditMode = ref(false);
  const editTargetId = ref(null);
  const menuTree = ref([]);
  const expandedMenus = ref([]);
  const availableLanguages = ref([]);
  const toast = useToast();

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

  const currentPage = ref(1);
  const pageSize = 10;
  const paginatedMenus = computed(() =>
    menuTree.value.slice(
      (currentPage.value - 1) * pageSize,
      currentPage.value * pageSize,
    ),
  );
  const totalPages = computed(
    () => Math.ceil(menuTree.value.length / pageSize) || 1,
  );
  const handlePageChange = (page) => {
    currentPage.value = page;
  };

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
      const res = await getLanguages();
      availableLanguages.value = res.data;
      if (res.data.length > 0 && !menuForm.value.langu)
        menuForm.value.langu = res.data[0].langu;
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMenus = async () => {
    try {
      const res = await getMenus();
      menuTree.value = res.data;
    } catch (error) {
      menuTree.value = [];
    }
  };

  const handleRegisterOrUpdate = async () => {
    isSubmitting.value = true;
    try {
      const payload = {
        ...menuForm.value,
        parentMenuId: menuForm.value.parentMenuId || null,
      };
      if (isEditMode.value) await updateMenu(editTargetId.value, payload);
      else await createMenu(payload);
      toast.success("완료되었습니다.");
      resetForm();
      await fetchMenus();
    } catch (error) {
      toast.error(`오류: ${error.response?.data?.message || "작업 실패"}`);
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
      langu: availableLanguages.value[0]?.langu || "KO",
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

  onMounted(() => {
    fetchLanguages();
    fetchMenus();
  });

  return {
    isSubmitting,
    isEditMode,
    menuForm,
    availableLanguages,
    flatMenus,
    paginatedMenus,
    expandedMenus,
    currentPage,
    totalPages,
    handlePageChange,
    toggleMenu,
    handleRegisterOrUpdate,
    editMenu,
    resetForm,
  };
}
