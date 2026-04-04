import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/service/api";
import { useToast } from "@/composables/useToast";

/**
 * [표준 템플릿] 목록 조회 (List View) 로직
 */
export function useEmptyLogic() {
  const router = useRouter();
  const toast = useToast();

  const searchKeyword = ref("");
  const items = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = 10;

  // 선택 로직 (단일 및 다중)
  const selectedRows = ref([]);
  const selectedRow = ref(null);

  // 데이터 페칭 함수
  const fetchData = async () => {
    try {
      // const res = await api.get("/your-endpoint");
      // items.value = res.data;

      // [샘플 데이터] 템플릿 확인용
      items.value = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `데이터 ${i + 1}`,
        value: `속성 값 ${i + 1}`,
        isActive: i % 2 === 0,
      }));

      currentPage.value = 1;
    } catch (error) {
      toast.error("데이터 조회에 실패했습니다.");
    }
  };

  const handleSearch = () => fetchData();

  // 페이지네이션 처리
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return items.value.slice(start, start + itemsPerPage);
  });
  const totalPages = computed(
    () => Math.ceil(items.value.length / itemsPerPage) || 1,
  );

  const handlePageChange = (page) => {
    currentPage.value = page;
    selectedRows.value = [];
    selectedRow.value = null;
  };

  // 네비게이션
  const goToCreate = () => router.push("/empty/create");
  const goToDetail = (mode) => {
    if (selectedRow.value) {
      router.push({ path: `/empty/${selectedRow.value.id}`, query: { mode } });
    }
  };

  // 삭제 로직 (단일 및 일괄 삭제)
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
      // await api.delete("/your-endpoint", { data: { ids: targetIds } });
      toast.success("정상적으로 삭제되었습니다.");
      fetchData();
    } catch (error) {
      toast.error("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  // 선택 토글
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

/**
 * [표준 템플릿] 상세/등록 (Detail View) 로직
 */
export function useEmptyLogicDetail() {
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  const isSubmitting = ref(false);
  const form = ref({ id: null, name: "" });

  const isCreateMode = computed(
    () => route.params.id === "create" || !route.params.id,
  );
  const isViewMode = computed(() => route.query.mode === "view");
  const isEditMode = computed(
    () =>
      route.query.mode === "edit" || (!isCreateMode.value && !isViewMode.value),
  );

  const handleSave = async () => {
    if (isViewMode.value) return;

    isSubmitting.value = true;
    try {
      // API 호출 로직 작성
      // await api.post("/your-endpoint", form.value);
      toast.success(isCreateMode.value ? "등록되었습니다." : "수정되었습니다.");
      handleClose();
    } catch (error) {
      toast.error("저장 처리 중 오류가 발생했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleClose = () => router.back();

  return {
    isCreateMode,
    isEditMode,
    isViewMode,
    isSubmitting,
    form,
    handleSave,
    handleClose,
  };
}
