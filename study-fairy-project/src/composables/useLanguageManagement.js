import { ref, onMounted } from "vue";
import api from "@/services";
import { useAuthStore } from "@/stores/useAuthStore";

export function useLanguageManagement() {
  const isSubmitting = ref(false);
  const languages = ref([]);
  const authStore = useAuthStore();

  const searchParams = ref({
    langu: "",
    languNm: "",
  });

  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalCount = ref(0);
  const pageSize = 10;

  const fetchLanguages = async (page = 1) => {
    try {
      const response = await api.get("/languages", {
        params: {
          page: page,
          limit: pageSize,
          ...searchParams.value,
        },
      });
      languages.value = response.data.data || [];
      totalPages.value = response.data.totalPages || 1;
      totalCount.value = response.data.totalCount || 0;
      currentPage.value = page;
    } catch (error) {
      console.error("언어 목록 조회 에러:", error);
      alert("언어 목록을 불러오는 중 오류가 발생했습니다.");
      languages.value = [];
    }
  };

  const handleRegister = async (newLang) => {
    isSubmitting.value = true;
    try {
      const registrationData = {
        ...newLang,
        createdBy: authStore.user?.userId || "ADMIN",
      };
      await api.post("/languages", registrationData);
      alert("새로운 언어가 성공적으로 등록되었습니다.");
      await fetchLanguages();
    } catch (error) {
      console.error("언어 등록 에러:", error);
      if (error.response && error.response.status === 409) {
        alert("이미 존재하는 언어 코드입니다. 다른 코드를 입력해주세요.");
      } else {
        alert("언어 등록 중 오류가 발생했습니다.");
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("정말로 이 언어를 삭제하시겠습니까?")) return;

    isSubmitting.value = true;
    try {
      await api.delete(`/languages/${id}`);
      alert("성공적으로 삭제되었습니다.");
      await fetchLanguages();
    } catch (error) {
      console.error("언어 삭제 에러:", error);
      alert("언어 삭제 중 오류가 발생했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleSearch = () => {
    fetchLanguages(1);
  };

  const handlePageChange = (page) => {
    fetchLanguages(page);
  };

  onMounted(() => {
    fetchLanguages();
  });

  return {
    isSubmitting,
    languages,
    searchParams,
    currentPage,
    totalPages,
    totalCount,
    fetchLanguages,
    handleRegister,
    handleDelete,
    handleSearch,
    handlePageChange,
  };
}
