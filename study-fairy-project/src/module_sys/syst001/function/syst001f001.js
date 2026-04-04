import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/service/api";
import { useToast } from "@/composables/useToast";

export function useSyst001v001() {
  const router = useRouter();
  const toast = useToast();

  const searchKeyword = ref("");
  const users = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = 10;
  const selectedRows = ref([]); // 다중 선택 (체크박스)
  const selectedRow = ref(null); // 단일 선택 (로우 클릭)

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      let data = res.data?.data || res.data || [];

      if (searchKeyword.value) {
        data = data.filter((u) => u.userId.includes(searchKeyword.value));
      }

      users.value = data;
      currentPage.value = 1;
    } catch (error) {
      toast.error("사용자 목록 조회에 실패했습니다.");
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return users.value.slice(start, start + itemsPerPage);
  });

  const totalPages = computed(
    () => Math.ceil(users.value.length / itemsPerPage) || 1,
  );

  const handlePageChange = (page) => {
    currentPage.value = page;
    selectedRows.value = []; // 페이지 이동 시 체크박스 초기화
    selectedRow.value = null; // 페이지 이동 시 단일 선택 초기화
  };

  const goToCreate = () => {
    router.push("/sys/syst001/create");
  };

  const goToDetail = (id, mode) => {
    router.push({ path: `/sys/syst001/${id}`, query: { mode } });
  };

  const handleDelete = async (id) => {
    if (!confirm("해당 사용자를 정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("정상적으로 삭제되었습니다.");
      fetchUsers();
    } catch (error) {
      toast.error("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // 단일 로우 클릭 선택
  const selectRow = (row) => {
    selectedRow.value = row;
  };

  // 전체 선택/해제 토글
  const isAllSelected = computed(() => {
    return (
      paginatedUsers.value.length > 0 &&
      selectedRows.value.length === paginatedUsers.value.length
    );
  });

  const handleToggleAll = (e) => {
    if (e.target.checked) {
      selectedRows.value = paginatedUsers.value.map((u) => u.id);
    } else {
      selectedRows.value = [];
    }
  };

  // 검색영역 '추가' 버튼 동작 로직
  const handleAdd = () => {
    toast.info("추가 버튼이 클릭되었습니다.");
    // goToCreate() 등 원하는 로직 연동 가능
  };

  onMounted(() => {
    fetchUsers();
  });

  return {
    searchKeyword,
    users,
    paginatedUsers,
    currentPage,
    totalPages,
    handleSearch,
    handlePageChange,
    goToDetail,
    goToCreate,
    handleAdd,
    handleDelete,
    formatDate,
    selectedRows,
    selectedRow,
    selectRow,
    isAllSelected,
    handleToggleAll,
  };
}
