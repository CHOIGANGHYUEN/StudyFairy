import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getMenus, deleteMenu } from "../../systService";
import { useToast } from "@/composables/useToast";

export function useSyst003v001() {
  const router = useRouter();
  const toast = useToast();
  const searchKeyword = ref("");
  const items = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = 15;
  const selectedRows = ref([]);
  const selectedRow = ref(null);

  const flattenMenus = (nodes, result = []) => {
    nodes.forEach((node) => {
      result.push(node);
      if (node.children) flattenMenus(node.children, result);
    });
    return result;
  };

  const fetchData = async () => {
    try {
      const res = await getMenus();
      let data = flattenMenus(res.data?.data || res.data || []);
      if (searchKeyword.value)
        data = data.filter((m) => m.menuNm.includes(searchKeyword.value));
      items.value = data;
      currentPage.value = 1;
    } catch (error) {
      toast.error("메뉴 목록 조회에 실패했습니다.");
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
  const goToCreate = () => router.push("/sys/syst003/create");
  const goToDetail = (mode) => {
    if (selectedRow.value)
      router.push({
        path: `/sys/syst003/${selectedRow.value.id}`,
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
      await Promise.all(targetIds.map((id) => deleteMenu(id)));
      toast.success("삭제되었습니다.");
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
  };
}
