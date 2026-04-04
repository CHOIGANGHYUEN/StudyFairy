import { ref, onMounted } from "vue";
import { getTableHistories } from "@/service/tableHistoryService";

export function useTableHistory() {
  const filters = ref({
    tablen: "",
    targetType: "",
    actionType: "",
    isApplied: "",
    page: 1,
    size: 20,
  });
  const histories = ref([]);
  const totalPages = ref(1);
  const selectedItem = ref(null);

  const fetchHistories = async () => {
    try {
      const res = await getTableHistories(filters.value);
      histories.value = res.data?.rows || res.rows || [];
      const total = res.data?.total || res.total || 0;
      totalPages.value = Math.ceil(total / filters.value.size) || 1;
    } catch (error) {
      console.error("이력 조회 중 오류 발생:", error);
    }
  };

  const onSearch = () => {
    filters.value.page = 1;
    fetchHistories();
  };
  const onPageChange = (page) => {
    filters.value.page = page;
    fetchHistories();
  };
  const openDetail = (item) => {
    selectedItem.value = item;
  };
  const closeDetail = () => {
    selectedItem.value = null;
  };

  onMounted(() => {
    fetchHistories();
  });

  return {
    filters,
    histories,
    totalPages,
    selectedItem,
    onSearch,
    onPageChange,
    openDetail,
    closeDetail,
  };
}
