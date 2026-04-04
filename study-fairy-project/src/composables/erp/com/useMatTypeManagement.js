import { ref, computed, onMounted } from "vue";
import * as matTypeService from "@/service/matTypeService";
import { useToast } from "@/composables/useToast";

export function useMatTypeManagement() {
  const matTypes = ref([]);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const isFormVisible = ref(false);
  const selectedMatType = ref(null);
  const toast = useToast();

  const formTitle = computed(() =>
    selectedMatType.value?.id ? "자재 유형 수정" : "자재 유형 생성",
  );

  const fetchMatTypes = async () => {
    isLoading.value = true;
    try {
      const response = await matTypeService.getMatTypes();
      matTypes.value = response.data;
    } catch (error) {
      toast.error("데이터를 불러오는 데 실패했습니다.");
    } finally {
      isLoading.value = false;
    }
  };

  const openFormModal = (matType = null) => {
    selectedMatType.value = matType ? { ...matType } : {};
    isFormVisible.value = true;
  };
  const closeFormModal = () => {
    isFormVisible.value = false;
    selectedMatType.value = null;
  };

  const handleSave = async (formData) => {
    isSubmitting.value = true;
    try {
      if (formData.id) {
        await matTypeService.updateMatType(formData.id, formData);
        toast.success("자재 유형이 수정되었습니다.");
      } else {
        await matTypeService.createMatType(formData);
        toast.success("자재 유형이 생성되었습니다.");
      }
      closeFormModal();
      await fetchMatTypes();
    } catch (error) {
      toast.error(error.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("정말로 이 자재 유형을 삭제하시겠습니까?")) return;
    try {
      await matTypeService.deleteMatType(id);
      toast.success("삭제되었습니다.");
      await fetchMatTypes();
    } catch (error) {
      toast.error(error.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  onMounted(fetchMatTypes);
  return {
    matTypes,
    isLoading,
    isSubmitting,
    isFormVisible,
    selectedMatType,
    formTitle,
    openFormModal,
    closeFormModal,
    handleSave,
    handleDelete,
  };
}
