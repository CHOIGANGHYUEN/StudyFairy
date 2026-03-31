import { ref, onMounted } from "vue";
import api from "@/services";
import { useAuthStore } from "@/stores/useAuthStore";

export function useRoleManagement() {
  const isSubmitting = ref(false);
  const isEditMode = ref(false);
  const editTargetId = ref(null);
  const roles = ref([]);
  const authStore = useAuthStore();

  const form = ref({
    roleId: "",
    description: "",
    useYn: 1,
  });

  const searchParams = ref({
    roleId: "",
    description: "",
  });

  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalCount = ref(0);
  const pageSize = 10;

  const fetchRoles = async (page = 1) => {
    try {
      const response = await api.get("/roles", {
        params: {
          page: page,
          limit: pageSize,
          ...searchParams.value,
        },
      });
      roles.value = response.data.data || [];
      totalPages.value = response.data.totalPages || 1;
      totalCount.value = response.data.totalCount || 0;
      currentPage.value = page;
    } catch (error) {
      console.error("권한 목록 조회 에러:", error);
      roles.value = [];
    }
  };

  const handleSubmit = async () => {
    if (!form.value.roleId) return;
    isSubmitting.value = true;
    try {
      const url = isEditMode.value ? `/roles/${editTargetId.value}` : "/roles";
      const method = isEditMode.value ? "put" : "post";
      const payload = {
        roleId: form.value.roleId,
        description: form.value.description,
        useYn: form.value.useYn,
        createdBy: authStore.user?.userId || "SYSTEM",
        changedBy: authStore.user?.userId || "SYSTEM",
      };

      await api[method](url, payload);

      alert(`권한이 성공적으로 ${isEditMode.value ? "수정" : "등록"}되었습니다.`);
      resetForm();
      await fetchRoles();
    } catch (error) {
      const message = error.response?.data?.message || "작업에 실패했습니다.";
      alert(`오류: ${message}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  const editRole = (role) => {
    isEditMode.value = true;
    editTargetId.value = role.id;
    form.value = {
      roleId: role.roleId,
      description: role.description,
      useYn: role.useYn,
    };
    window.scrollTo(0, 0);
  };

  const deleteRole = async (id) => {
    if (!confirm("정말로 이 권한을 삭제하시겠습니까?")) return;
    isSubmitting.value = true;
    try {
      await api.delete(`/roles/${id}`);
      alert("성공적으로 삭제되었습니다.");
      if (isEditMode.value && editTargetId.value === id) {
        resetForm();
      }
      await fetchRoles();
    } catch (error) {
      const message = error.response?.data?.message || "삭제에 실패했습니다.";
      alert(`오류: ${message}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  const resetForm = () => {
    isEditMode.value = false;
    editTargetId.value = null;
    form.value = {
      roleId: "",
      description: "",
      useYn: 1,
    };
  };

  const handleSearch = () => {
    fetchRoles(1);
  };

  const handlePageChange = (page) => {
    fetchRoles(page);
  };

  onMounted(() => {
    fetchRoles();
  });

  return {
    isSubmitting,
    isEditMode,
    roles,
    form,
    searchParams,
    currentPage,
    totalPages,
    totalCount,
    handleSubmit,
    editRole,
    deleteRole,
    resetForm,
    handleSearch,
    handlePageChange,
  };
}
