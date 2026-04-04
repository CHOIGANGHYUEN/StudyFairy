import { ref, computed, onMounted } from "vue";
import * as matClassService from "@/service/matClassService";
import { getLanguages } from "@/service/languageService";
import { useToast } from "@/composables/useToast";

export function useMatClassManagement() {
  const matClasses = ref([]);
  const languages = ref([]);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const isFormVisible = ref(false);
  const selectedMatClass = ref(null);
  const toast = useToast();

  const formTitle = computed(() =>
    selectedMatClass.value?.id ? "자재 분류 수정" : "자재 분류 생성",
  );

  const fetchMatClasses = async () => {
    isLoading.value = true;
    try {
      const response = await matClassService.getMatClasses();
      matClasses.value = response.data;
    } catch (error) {
      console.error("자재 분류 목록 조회 실패:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchLanguages = async () => {
    try {
      const res = await getLanguages();
      languages.value = res.data;
    } catch (error) {
      console.error("Failed to fetch languages:", error);
    }
  };

  const openFormModal = (matClass = null) => {
    selectedMatClass.value = matClass ? { ...matClass } : {};
    isFormVisible.value = true;
  };
  const closeFormModal = () => {
    isFormVisible.value = false;
    selectedMatClass.value = null;
  };

  const handleSave = async (formData) => {
    isSubmitting.value = true;
    try {
      if (formData.id) {
        await matClassService.updateMatClass(formData.id, formData);
        toast.success("자재 분류가 수정되었습니다.");
      } else {
        await matClassService.createMatClass(formData);
        toast.success("자재 분류가 생성되었습니다.");
      }
      closeFormModal();
      await fetchMatClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "정말로 이 자재 분류를 삭제하시겠습니까? (하위 분류가 있다면 문제가 발생할 수 있습니다.)",
      )
    )
      return;
    try {
      await matClassService.deleteMatClass(id);
      toast.success("삭제되었습니다.");
      await fetchMatClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  onMounted(() => {
    fetchMatClasses();
    fetchLanguages();
  });

  return {
    matClasses,
    languages,
    isLoading,
    isSubmitting,
    isFormVisible,
    selectedMatClass,
    formTitle,
    openFormModal,
    closeFormModal,
    handleSave,
    handleDelete,
  };
}
