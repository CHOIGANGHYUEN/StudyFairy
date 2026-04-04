import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  getLanguages,
  createLanguage,
  deleteLanguage,
} from "@/service/languageService";
import { useToast } from "@/composables/useToast";

export function useLanguageManagement() {
  const isSubmitting = ref(false);
  const languages = ref([]);
  const authStore = useAuthStore();
  const toast = useToast();

  const currentPage = ref(1);
  const itemsPerPage = ref(10);

  const totalPages = computed(
    () => Math.ceil(languages.value.length / itemsPerPage.value) || 1,
  );

  const paginatedLanguages = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return languages.value.slice(start, start + itemsPerPage.value);
  });

  const fetchLanguages = async () => {
    try {
      const response = await getLanguages();
      languages.value = response.data;
      currentPage.value = 1;
    } catch (error) {
      toast.error("언어 목록을 불러오는 중 오류가 발생했습니다.");
    }
  };

  const handleRegister = async (newLang) => {
    isSubmitting.value = true;
    try {
      await createLanguage({
        ...newLang,
        createdBy: authStore.user?.userId || "ADMIN",
      });
      toast.success("새로운 언어가 성공적으로 등록되었습니다.");
      await fetchLanguages();
    } catch (error) {
      if (error.response?.status === 409)
        toast.warning("이미 존재하는 언어 코드입니다.");
      else toast.error("언어 등록 중 오류가 발생했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("정말로 이 언어를 삭제하시겠습니까?")) return;
    isSubmitting.value = true;
    try {
      await deleteLanguage(id);
      toast.success("성공적으로 삭제되었습니다.");
      await fetchLanguages();
    } catch (error) {
      toast.error("언어 삭제 중 오류가 발생했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(fetchLanguages);

  return {
    isSubmitting,
    languages,
    currentPage,
    totalPages,
    paginatedLanguages,
    handleRegister,
    handleDelete,
  };
}
