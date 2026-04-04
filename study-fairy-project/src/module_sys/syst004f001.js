import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getTables, deleteTable } from "../../systService";
import { useToast } from "@/composables/useToast";

export function useSyst004v001() {
  const router = useRouter();
  const toast = useToast();
  const searchLangu = ref("KO");
  const selectedDbms = ref("MySQL");
  const items = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = 10;
  const selectedRow = ref(null);

  const fetchData = async () => {
    try {
      const res = await getTables(selectedDbms.value, searchLangu.value);
      items.value = res.data?.data || res.data || [];
      currentPage.value = 1;
    } catch (error) {
      toast.error("조회에 실패했습니다.");
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
  const goToCreate = () =>
    router.push({
      path: "/sys/syst004/create",
      query: { dbms: selectedDbms.value, langu: searchLangu.value },
    });
  const goToDetail = (mode) => {
    if (selectedRow.value)
      router.push({
        path: `/sys/syst004/${selectedRow.value.tablen}`,
        query: { mode, dbms: selectedDbms.value, langu: searchLangu.value },
      });
  };
  const handleDelete = async () => {
    if (!selectedRow.value) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteTable(selectedRow.value.tablen);
      toast.success("삭제되었습니다.");
      fetchData();
    } catch (error) {
      toast.error("삭제 실패");
    }
  };
  const selectRow = (row) => {
    selectedRow.value = row;
  };
  onMounted(fetchData);
  return {
    searchLangu,
    selectedDbms,
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
  };
}
