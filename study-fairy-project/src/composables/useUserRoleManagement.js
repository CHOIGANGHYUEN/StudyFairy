import { ref, onMounted } from "vue";
import api from "@/services";
import { useAuthStore } from "@/stores/useAuthStore";

export function useUserRoleManagement() {
  const authStore = useAuthStore();

  const isSubmitting = ref(false);
  const isEditMode = ref(false);
  const editTargetId = ref(null);

  const mappings = ref([]);
  const roles = ref([]);

  const form = ref({
    userId: "",
    roleId: "",
    useYn: 1,
  });

  const searchParams = ref({
    userId: "",
    roleId: "",
  });

  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalCount = ref(0);
  const pageSize = 10;

  const fetchRoles = async () => {
    try {
      const res = await api.get("/roles", { params: { limit: 1000 } });
      roles.value = res.data.data;
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMappings = async (page = 1) => {
    try {
      const res = await api.get("/user-roles", {
        params: {
          page,
          limit: pageSize,
          ...searchParams.value,
        },
      });

      if (res.data && res.data.data) {
        mappings.value = res.data.data;
        totalPages.value = res.data.totalPages || 1;
        totalCount.value = res.data.totalCount || res.data.data.length;
      } else {
        mappings.value = [];
        totalPages.value = 1;
        totalCount.value = 0;
      }
      currentPage.value = page;
    } catch (error) {
      console.error(error);
      mappings.value = [];
    }
  };

  const handlePageChange = (page) => {
    fetchMappings(page);
  };

  const handleSubmit = async () => {
    isSubmitting.value = true;
    try {
      const url = isEditMode.value
        ? `/user-roles/${editTargetId.value}`
        : "/user-roles";
      const method = isEditMode.value ? "put" : "post";
      const payload = {
        ...form.value,
        createdBy: authStore.user?.userId || "SYSTEM",
        changedBy: authStore.user?.userId || "SYSTEM",
      };

      await api[method](url, payload);

      alert(
        `사용자-권한 매핑이 ${
          isEditMode.value ? "수정" : "등록"
        }되었습니다.`
      );
      resetForm();
      await fetchMappings(currentPage.value);
    } catch (error) {
      const message = error.response?.data?.message || "작업 실패";
      alert(`오류: ${message}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  const editMapping = (item) => {
    isEditMode.value = true;
    editTargetId.value = item.id;
    form.value = {
      userId: item.userId,
      roleId: item.roleId,
      useYn: item.useYn,
    };
    window.scrollTo(0, 0);
  };

  const deleteMapping = async (id) => {
    if (!confirm("정말 이 권한 매핑을 삭제하시겠습니까?")) return;
    isSubmitting.value = true;
    try {
      await api.delete(`/user-roles/${id}`);
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
    form.value = { userId: "", roleId: "", useYn: 1 };
  };

  const handleSearch = () => {
    fetchMappings(1);
  };

  onMounted(() => {
    fetchRoles();
    fetchMappings();
  });

  return {
    isSubmitting,
    isEditMode,
    mappings,
    roles,
    form,
    searchParams,
    currentPage,
    totalPages,
    totalCount,
    handleSubmit,
    editMapping,
    deleteMapping,
    resetForm,
    handleSearch,
    handlePageChange,
  };
}
