import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { getUsers, createUser } from "@/service/userService";
import { useToast } from "@/composables/useToast";

export function useUserManagement() {
  const authStore = useAuthStore();
  const toast = useToast();
  const isSubmitting = ref(false);
  const users = ref([]);

  const currentPage = ref(1);
  const itemsPerPage = ref(10);

  const totalPages = computed(
    () => Math.ceil(users.value.length / itemsPerPage.value) || 1,
  );

  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return users.value.slice(start, start + itemsPerPage.value);
  });

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      users.value = response.data;
      currentPage.value = 1;
    } catch (error) {
      toast.error("사용자 목록 로드 오류가 발생했습니다.");
    }
  };

  const handleRegister = async (userId) => {
    if (!userId) return;
    isSubmitting.value = true;
    try {
      await createUser({
        userId,
        createdBy: authStore.user?.id || "SYSTEM",
        changedBy: authStore.user?.id || "SYSTEM",
      });
      toast.success("사용자가 성공적으로 등록되었습니다.");
      await fetchUsers();
    } catch (error) {
      toast.error(`오류: ${error.response?.data?.message || "등록 실패"}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(fetchUsers);
  return {
    isSubmitting,
    currentPage,
    totalPages,
    paginatedUsers,
    handleRegister,
  };
}
