import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/service/api";
import { useToast } from "@/composables/useToast";

export function useSyst001v002() {
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  const isSubmitting = ref(false);
  const userForm = ref({
    id: null,
    userId: "",
  });

  const isCreateMode = computed(() => route.params.id === "create");
  const isViewMode = computed(() => route.query.mode === "view");
  const isEditMode = computed(
    () =>
      route.query.mode === "edit" || (!isCreateMode.value && !isViewMode.value),
  );

  const fetchUserDetail = async () => {
    if (isCreateMode.value) return;
    try {
      const res = await api.get(`/users/${route.params.id}`);
      const data = res.data?.data || res.data;
      userForm.value = { ...data };
    } catch (error) {
      toast.error("사용자 상세 정보를 불러오는데 실패했습니다.");
      handleClose();
    }
  };

  const handleSave = async () => {
    if (isViewMode.value) return;
    if (!userForm.value.userId) {
      toast.warning("사용자 ID를 입력해주세요.");
      return;
    }

    isSubmitting.value = true;
    try {
      if (isCreateMode.value) {
        await api.post("/users/register", { userId: userForm.value.userId });
        toast.success("사용자가 성공적으로 등록되었습니다.");
      } else {
        await api.put(`/users/${userForm.value.id}`, {
          userId: userForm.value.userId,
        });
        toast.success("사용자 정보가 성공적으로 수정되었습니다.");
      }
      handleClose();
    } catch (error) {
      toast.error("저장 처리 중 오류가 발생했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleClose = () => {
    router.push("/sys/syst001");
  };

  onMounted(() => {
    fetchUserDetail();
  });

  return {
    isCreateMode,
    isEditMode,
    isViewMode,
    isSubmitting,
    userForm,
    handleSave,
    handleClose,
  };
}
