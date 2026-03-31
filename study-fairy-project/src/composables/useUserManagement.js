import { ref, onMounted } from "vue";
import api from "@/services";
import { useAuthStore } from "@/stores/useAuthStore";

export function useUserManagement() {
  const authStore = useAuthStore();
  const isSubmitting = ref(false);
  const users = ref([]);
  const newUser = ref({
    userId: "",
  });

  const searchParams = ref({
    userId: "",
    createdBy: "",
  });

  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalCount = ref(0);
  const pageSize = 10;

  const fetchUsers = async (page = 1) => {
    try {
      const response = await api.get("/users", {
        params: {
          page: page,
          limit: pageSize,
          ...searchParams.value,
        },
      });
      users.value = response.data.data || [];
      totalPages.value = response.data.totalPages || 1;
      totalCount.value = response.data.totalCount || 0;
      currentPage.value = page;
    } catch (error) {
      console.error("사용자 목록 로드 오류:", error);
      users.value = [];
    }
  };

  const handleRegister = async () => {
    if (!newUser.value.userId) return;
    isSubmitting.value = true;
    try {
      await api.post("/users", {
        userId: newUser.value.userId,
        createdBy: authStore.user?.userId || "SYSTEM",
        changedBy: authStore.user?.userId || "SYSTEM",
      });
      newUser.value.userId = "";
      alert("사용자가 성공적으로 등록되었습니다.");
      await fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || "등록 실패";
      alert(`오류: ${message}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleSearch = () => {
    fetchUsers(1);
  };

  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getDate()).padStart(2, "0")} ${String(
      d.getHours(),
    ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  onMounted(() => {
    fetchUsers();
  });

  return {
    isSubmitting,
    users,
    newUser,
    searchParams,
    currentPage,
    totalPages,
    totalCount,
    fetchUsers,
    handleRegister,
    handleSearch,
    handlePageChange,
    formatDate,
  };
}
