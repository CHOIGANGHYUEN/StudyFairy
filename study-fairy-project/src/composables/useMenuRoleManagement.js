import { ref, onMounted } from "vue";
import api from "@/services";
import { useAuthStore } from "@/stores/useAuthStore";

export function useMenuRoleManagement() {
  const authStore = useAuthStore();

  const isSubmitting = ref(false);
  const isEditMode = ref(false);
  const editTargetId = ref(null);

  const mappings = ref([]);
  const roles = ref([]);
  const menus = ref([]);

  const form = ref({
    roleId: "",
    menuId: "",
    useYn: 1,
  });

  const searchParams = ref({
    roleId: "",
    menuId: "",
  });

  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalCount = ref(0);
  const pageSize = 10;

  const fetchRoles = async () => {
    try {
      const res = await api.get("/roles", { params: { limit: 1000 } }); // Assuming we need all roles for the dropdown
      roles.value = res.data.data;
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMenus = async () => {
    try {
      const res = await api.get("/menus");
      const tree = res.data;
      const flatList = [];
      const traverse = (nodes, depth = 0) => {
        for (const node of nodes) {
          const prefix = depth > 0 ? "　".repeat(depth) + "└ " : "";
          flatList.push({ menuId: node.menuId, menuNm: prefix + node.menuNm });
          if (node.children && node.children.length)
            traverse(node.children, depth + 1);
        }
      };
      traverse(tree);
      menus.value = flatList;
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMappings = async (page = 1) => {
    try {
      const res = await api.get("/role-menus", {
        params: {
          page: page,
          limit: pageSize,
          ...searchParams.value,
        },
      });
      mappings.value = res.data.data || [];
      totalPages.value = res.data.totalPages || 1;
      totalCount.value = res.data.totalCount || 0;
      currentPage.value = page;
    } catch (error) {
      console.error(error);
      mappings.value = [];
    }
  };

  const handleSubmit = async () => {
    isSubmitting.value = true;
    try {
      const url = isEditMode.value
        ? `/role-menus/${editTargetId.value}`
        : "/role-menus";
      const method = isEditMode.value ? "put" : "post";
      const payload = {
        ...form.value,
        createdBy: authStore.user?.userId || "SYSTEM",
        changedBy: authStore.user?.userId || "SYSTEM",
      };

      await api[method](url, payload);

      alert(`매핑이 ${isEditMode.value ? "수정" : "등록"}되었습니다.`);

      const currentRoleId = form.value.roleId;
      const wasEditMode = isEditMode.value;

      resetForm();
      if (!wasEditMode) {
        form.value.roleId = currentRoleId;
      }
      await fetchMappings(currentPage.value);
    } catch (error) {
      const message = error.response?.data?.message || "작업 실패";
      alert(`오류: ${message}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  const copyMapping = (item) => {
    isEditMode.value = false;
    editTargetId.value = null;
    form.value = {
      roleId: item.roleId,
      menuId: item.menuId,
      useYn: item.useYn,
    };
    window.scrollTo(0, 0);
  };

  const editMapping = (item) => {
    isEditMode.value = true;
    editTargetId.value = item.id;
    form.value = {
      roleId: item.roleId,
      menuId: item.menuId,
      useYn: item.useYn,
    };
    window.scrollTo(0, 0);
  };

  const deleteMapping = async (id) => {
    if (!confirm("정말 이 매핑을 삭제하시겠습니까?")) return;
    isSubmitting.value = true;
    try {
      await api.delete(`/role-menus/${id}`);
      alert("삭제되었습니다.");
      if (isEditMode.value && editTargetId.value === id) resetForm();
      await fetchMappings(currentPage.value);
    } catch (error) {
      const message = error.response?.data?.message || "삭제 실패";
      alert(`오류: ${message}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  const resetForm = () => {
    isEditMode.value = false;
    editTargetId.value = null;
    form.value = { roleId: "", menuId: "", useYn: 1 };
  };

  const handleSearch = () => {
    fetchMappings(1);
  };

  const handlePageChange = (page) => {
    fetchMappings(page);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")} ${String(
      d.getHours()
    ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  onMounted(() => {
    fetchRoles();
    fetchMenus();
    fetchMappings();
  });

  return {
    isSubmitting,
    isEditMode,
    mappings,
    roles,
    menus,
    form,
    searchParams,
    currentPage,
    totalPages,
    totalCount,
    handleSubmit,
    copyMapping,
    editMapping,
    deleteMapping,
    resetForm,
    handleSearch,
    handlePageChange,
    formatDate,
  };
}
