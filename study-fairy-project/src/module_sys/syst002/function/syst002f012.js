import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/service/api";
import { useToast } from "@/composables/useToast";

export function useSyst002v012() {
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  const isSubmitting = ref(false);
  const form = ref({ id: null, roleId: "", description: "", useYn: 1 });

  const isCreateMode = computed(() => route.params.id === "create");
  const isViewMode = computed(() => route.query.mode === "view");
  const isEditMode = computed(
    () =>
      route.query.mode === "edit" || (!isCreateMode.value && !isViewMode.value),
  );

  const fetchData = async () => {
    if (isCreateMode.value) return;
    try {
      const res = await api.get(`/roles/${route.params.id}`);
      form.value = { ...(res.data?.data || res.data) };
    } catch (error) {
      toast.error("상세 정보를 불러오는데 실패했습니다.");
      handleClose();
    }
  };

  const handleSave = async () => {
    if (isViewMode.value || !form.value.roleId) return;
    isSubmitting.value = true;
    try {
      if (isCreateMode.value) await api.post("/roles", form.value);
      else await api.put(`/roles/${form.value.id}`, form.value);
      toast.success(isCreateMode.value ? "등록되었습니다." : "수정되었습니다.");
      handleClose();
    } catch (error) {
      toast.error("저장 처리 중 오류가 발생했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleClose = () => router.back();
  onMounted(fetchData);
  return {
    isCreateMode,
    isEditMode,
    isViewMode,
    isSubmitting,
    form,
    handleSave,
    handleClose,
  };
}
