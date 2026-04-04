import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/service/api";
import { useToast } from "@/composables/useToast";

export function useSyst002v021() {
  const router = useRouter();
  const toast = useToast();

  const searchKeyword = ref("");
  const items = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = 10;
  const selectedRow = ref(null);

  const fetchData = async () => {
    try {
      const res = await api.get("/user-roles");
      let data = res.data?.data || res.data || [];
      if (searchKeyword.value) {
        data = data.filter((r) => r.userId.includes(searchKeyword.value));
      }
      items.value = data;
      currentPage.value = 1;
    } catch (error) {
      toast.error("데이터 목록 조회에 실패했습니다.");
    }
  };

  const handleSearch = () => fetchData();
  const paginatedItems = computed(() =>
    items.value.slice(
      (currentPage.value - 1) * itemsPerPage,
      currentPage.value * itemsPerPage,
    ),
  );
  const totalPages = computed(
    () => Math.ceil(items.value.length / itemsPerPage) || 1,
  );

  const handlePageChange = (page) => {
    currentPage.value = page;
    selectedRow.value = null;
  };
  const goToCreate = () => router.push("/sys/syst002/user-roles/create");
  const goToDetail = (mode) => {
    if (selectedRow.value)
      router.push({
        path: `/sys/syst002/user-roles/${selectedRow.value.id}`,
        query: { mode },
      });
  };

  const handleDelete = async () => {
    if (!selectedRow.value || !confirm(`선택한 데이터를 삭제하시겠습니까?`))
      return;
    try {
      await api.delete(`/user-roles/${selectedRow.value.id}`);
      toast.success("정상적으로 삭제되었습니다.");
      fetchData();
    } catch (error) {
      toast.error("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  const selectRow = (row) => {
    selectedRow.value = row;
  };
  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toISOString().split("T")[0] : "-";

  onMounted(fetchData);

  return {
    searchKeyword,
    items,
    paginatedItems,
    currentPage,
    totalPages,
    handleSearch,
    handlePageChange,
    goToDetail,
    goToCreate,
    handleDelete,
    selectedRow,
    selectRow,
    formatDate,
  };
}
