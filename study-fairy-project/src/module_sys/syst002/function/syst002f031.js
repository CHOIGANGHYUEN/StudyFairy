import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/service/api";
import { useToast } from "@/composables/useToast";

export function useSyst002v031() {
  const router = useRouter();
  const toast = useToast();

  const searchKeyword = ref("");
  const items = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = 10;
  const selectedRows = ref([]);
  const selectedRow = ref(null);

  const fetchData = async () => {
    try {
      const res = await api.get("/role-menus");
      let data = res.data?.data || res.data || [];
      if (searchKeyword.value) {
        data = data.filter((r) => r.roleId.includes(searchKeyword.value));
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
    selectedRows.value = [];
    selectedRow.value = null;
  };
  const goToCreate = () => router.push("/sys/syst002/menu-roles/create");
  const goToDetail = (mode) => {
    if (selectedRow.value)
      router.push({
        path: `/sys/syst002/menu-roles/${selectedRow.value.id}`,
        query: { mode },
      });
  };

  const handleDelete = async () => {
    const targetIds =
      selectedRows.value.length > 0
        ? selectedRows.value
        : selectedRow.value
          ? [selectedRow.value.id]
          : [];
    if (
      targetIds.length === 0 ||
      !confirm(`${targetIds.length}건의 데이터를 삭제하시겠습니까?`)
    )
      return;
    try {
      await Promise.all(targetIds.map((id) => api.delete(`/role-menus/${id}`)));
      toast.success("정상적으로 삭제되었습니다.");
      fetchData();
    } catch (error) {
      toast.error("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  const selectRow = (row) => {
    selectedRow.value = row;
  };
  const isAllSelected = computed(
    () =>
      paginatedItems.value.length > 0 &&
      selectedRows.value.length === paginatedItems.value.length,
  );
  const handleToggleAll = (e) => {
    selectedRows.value = e.target.checked
      ? paginatedItems.value.map((item) => item.id)
      : [];
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
    selectedRows,
    selectedRow,
    selectRow,
    isAllSelected,
    handleToggleAll,
    formatDate,
  };
}
