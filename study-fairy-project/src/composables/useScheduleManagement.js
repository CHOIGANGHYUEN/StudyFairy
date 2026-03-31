import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/services";

export function useScheduleManagement() {
  const authStore = useAuthStore();

  // Pagination State
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalCount = ref(0);
  const pageSize = 10; // Number of items per page

  const isSubmitting = ref(false);
  const isEditMode = ref(false);
  const editTargetId = ref(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = ref([currentYear - 1, currentYear, currentYear + 1]);

  const schedules = ref([]);
  const sys001Items = ref([]); // SGR001, SGR002 등
  const sys002Items = ref([]); // schCode 항목들

  const searchParams = ref({
    schGroupCode: "",
    userId: "",
    schYear: "",
    schMonth: "",
    schDate: "",
  });

  const minSchDate = ref("-");
  const maxSchDate = ref("-");

  const form = ref({
    schGroupCode: "",
    userId: authStore.user?.userId || "",
    schYear: String(currentYear),
    schMonth: String(new Date().getMonth() + 1).padStart(2, "0"),
    schDate: "",
    schCode: "",
    useYn: 1,
  });

  onMounted(async () => {
    await fetchCodes();
    await fetchSchedules();
    await fetchMinMaxDates();
  });

  const fetchCodes = async () => {
    try {
      // Category SYS 아래에 Group SYS001, SYS002가 존재한다고 가정하여 API 호출
      const [res1, res2] = await Promise.all([
        api.get("/codes/items/SYS/SYS001").catch(() => ({ data: [] })),
        api.get("/codes/items/SYS/SYS002").catch(() => ({ data: [] })),
      ]);
      sys001Items.value = res1.data;
      sys002Items.value = res2.data;
    } catch (error) {
      console.error("공통 코드 조회 실패:", error);
    }
  };

  const fetchSchedules = async (page = 1) => {
    try {
      const res = await api.get("/schedules", {
        params: {
          page: page,
          limit: pageSize,
          ...(searchParams.value.schGroupCode && {
            schGroupCode: searchParams.value.schGroupCode,
          }),
          ...(searchParams.value.userId && {
            userId: searchParams.value.userId,
          }),
          ...(searchParams.value.schYear && {
            schYear: searchParams.value.schYear,
          }),
          ...(searchParams.value.schMonth && {
            schMonth: searchParams.value.schMonth,
          }),
          ...(searchParams.value.schDate && {
            schDate: searchParams.value.schDate,
          }),
        },
      });

      // 백엔드 응답이 페이징 객체인지 단순 배열인지 확인하여 분기 처리 (조회 안 되는 버그 수정)
      if (res.data && res.data.data) {
        schedules.value = res.data.data;
        totalPages.value = res.data.totalPages || 1;
        totalCount.value = res.data.totalCount || res.data.data.length;
      } else if (Array.isArray(res.data)) {
        // 배열 전체가 반환될 경우 프론트엔드에서 페이징(slice) 처리
        const allData = res.data;
        totalCount.value = allData.length;
        totalPages.value = Math.ceil(allData.length / pageSize) || 1;
        schedules.value = allData.slice((page - 1) * pageSize, page * pageSize);
      } else {
        schedules.value = [];
        totalPages.value = 1;
        totalCount.value = 0;
      }

      currentPage.value = page;
    } catch (error) {
      console.error("일정 목록 조회 실패:", error);
      schedules.value = [];
      totalPages.value = 1;
      totalCount.value = 0;
    }
  };

  const fetchMinMaxDates = async () => {
    try {
      // 년도, 월, 일 필터를 무시하고 오직 그룹코드와 사용자ID만으로 전체 일정의 최소/최대 값을 구함
      const params = {};
      if (searchParams.value.schGroupCode)
        params.schGroupCode = searchParams.value.schGroupCode;
      if (searchParams.value.userId) params.userId = searchParams.value.userId;

      // 백엔드 집계 API 호출
      const res = await api.get("/schedules/min-max", { params });
      const { minSchDate: minD, maxSchDate: maxD } = res.data;

      minSchDate.value = minD ? formatDateOnly(minD) : "-";
      maxSchDate.value = maxD ? formatDateOnly(maxD) : "-";
    } catch (error) {
      console.error("최초/최종 등록일 조회 실패:", error);
      minSchDate.value = "-";
      maxSchDate.value = "-";
    }
  };

  const handlePageChange = (page) => {
    fetchSchedules(page);
  };

  const handleSearch = () => {
    fetchSchedules(1);
    fetchMinMaxDates();
  };

  const handleSubmit = async () => {
    isSubmitting.value = true;
    try {
      if (isEditMode.value) {
        const [year, month] = form.value.schDate.split("-");
        const payload = {
          ...form.value,
          schYear: year,
          schMonth: month,
          schCode: form.value.schCode || null,
          changedBy: authStore.user?.userId || "SYSTEM",
        };
        await api.put(`/schedules/${editTargetId.value}`, payload);
        alert("일정이 수정되었습니다.");
      } else {
        const year = parseInt(form.value.schYear);
        const month = parseInt(form.value.schMonth);
        const daysInMonth = new Date(year, month, 0).getDate();

        const bulkPayload = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(month).padStart(
            2,
            "0",
          )}-${String(day).padStart(2, "0")}`;
          bulkPayload.push({
            ...form.value,
            schDate: dateStr,
            schYear: String(year),
            schMonth: String(month).padStart(2, "0"),
            schCode: form.value.schCode || null,
            createdBy: authStore.user?.userId || "SYSTEM",
            changedBy: authStore.user?.userId || "SYSTEM",
          });
        }
        await api.post("/schedules/bulk", bulkPayload);
        alert(`${year}년 ${month}월의 일정이 일괄 등록되었습니다.`);
      }

      resetForm();
      await fetchSchedules();
      await fetchMinMaxDates(); // 일괄 등록/수정 후 최소/최대 일자 갱신
    } catch (error) {
      const message = error.response?.data?.message || "작업 실패";
      alert(`오류: ${message}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  const editSchedule = (item) => {
    isEditMode.value = true;
    editTargetId.value = item.id;
    form.value = {
      schGroupCode: item.schGroupCode,
      userId: item.userId,
      schYear: item.schYear || String(currentYear),
      schMonth:
        item.schMonth || String(new Date().getMonth() + 1).padStart(2, "0"),
      schDate: formatDateOnly(item.schDate), // YYYY-MM-DD 형식으로 바인딩
      schCode: item.schCode || "",
      useYn: item.useYn,
    };
    window.scrollTo(0, 0);
  };

  const deleteSchedule = async (id) => {
    if (
      !confirm(
        "정말 이 일정을 삭제하시겠습니까? 연관된 세부 일정도 모두 삭제됩니다.",
      )
    )
      return;
    isSubmitting.value = true;
    try {
      await api.delete(`/schedules/${id}`);
      alert("삭제되었습니다.");
      if (isEditMode.value && editTargetId.value === id) resetForm();
      await fetchSchedules();
      await fetchMinMaxDates(); // 삭제 후 갱신
    } catch (error) {
      const message = error.response?.data?.message || "삭제 실패";
      alert(`오류: ${message}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  const resetForm = () => {
    isEditMode.value = false;
    editTargetId.value = null;
    form.value = {
      schGroupCode: "",
      userId: authStore.user?.userId || "",
      schYear: String(currentYear),
      schMonth: String(new Date().getMonth() + 1).padStart(2, "0"),
      schDate: "",
      schCode: "",
      useYn: 1,
    };
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  return {
    isSubmitting,
    isEditMode,
    editTargetId,
    yearOptions,
    schedules,
    sys001Items,
    sys002Items,
    searchParams,
    minSchDate,
    maxSchDate,
    form,
    currentPage,
    totalPages,
    handlePageChange,
    handleSearch,
    handleSubmit,
    editSchedule,
    deleteSchedule,
    resetForm,
    formatDateOnly,
  };
}
