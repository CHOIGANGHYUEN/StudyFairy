import { ref, computed, onMounted, watch } from "vue";
import api from "@/service/api";
import * as companyService from "@/service/companyService";
import { getLanguages } from "@/service/languageService";
import { useToast } from "@/composables/useToast";

export function usePlantManagement() {
  const plants = ref([]);
  const companies = ref([]);
  const languages = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalPages = ref(1);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const isFormVisible = ref(false);
  const isCopyMode = ref(false);
  const selectedPlant = ref(null);
  const toast = useToast();

  const formTitle = computed(() =>
    isCopyMode.value
      ? "플랜트 복사 생성"
      : selectedPlant.value?.id
        ? "플랜트 수정"
        : "새 플랜트 생성",
  );

  const fetchPlants = async () => {
    isLoading.value = true;
    try {
      const res = await api.get(
        `/plants?page=${currentPage.value}&limit=${itemsPerPage.value}`,
      );
      plants.value = res.data.plants || [];
      totalPages.value = res.data.totalPages || 1;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchCompanies = async () => {
    const res = await companyService.getCompanies({ limit: 100 });
    companies.value = res.data?.companies || [];
  };

  const fetchLanguages = async () => {
    try {
      const res = await getLanguages();
      languages.value = res.data;
    } catch (error) {
      console.error("Failed to fetch languages:", error);
    }
  };

  watch(currentPage, fetchPlants);
  onMounted(() => {
    fetchPlants();
    fetchCompanies();
    fetchLanguages();
  });

  const openFormModal = (plant = null) => {
    selectedPlant.value = plant ? { ...plant } : {};
    isFormVisible.value = true;
    isCopyMode.value = false;
  };
  const openCopyModal = (plant) => {
    selectedPlant.value = { ...plant, id: null, plant: plant.plant + "_COPY" };
    isCopyMode.value = true;
    isFormVisible.value = true;
  };
  const closeFormModal = () => {
    isFormVisible.value = false;
    selectedPlant.value = null;
  };

  const handleSave = async (formData) => {
    isSubmitting.value = true;
    try {
      if (formData.id && !isCopyMode.value)
        await api.put(`/plants/${formData.id}`, formData);
      else await api.post("/plants", formData);
      toast.success("저장되었습니다.");
      closeFormModal();
      fetchPlants();
    } catch (e) {
      toast.error("저장 실패");
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await api.delete(`/plants/${id}`);
      toast.success("삭제되었습니다.");
      fetchPlants();
    } catch (e) {
      toast.error("삭제 실패");
    }
  };
  return {
    plants,
    companies,
    languages,
    currentPage,
    totalPages,
    isLoading,
    isSubmitting,
    isFormVisible,
    isCopyMode,
    selectedPlant,
    formTitle,
    openFormModal,
    openCopyModal,
    closeFormModal,
    handleSave,
    handleDelete,
  };
}
