import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { getCodeItems } from "@/service/codeService";
import {
  getSchedules,
  getScheduleMinMax,
  createScheduleBulk,
  updateSchedule,
  deleteSchedule as apiDeleteSchedule,
} from "@/service/scheduleService";
import { useToast } from "@/composables/useToast";

export function useScheduleManagement() {
  const authStore = useAuthStore();
  const toast = useToast();

  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalCount = ref(0);
  const pageSize = 10;
  const isSubmitting = ref(false);
  const isEditMode = ref(false);
  const editTargetId = ref(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = ref([currentYear - 1, currentYear, currentYear + 1]);

  const schedules = ref([]);
  const sys001Items = ref([]);
  const sys002Items = ref([]);

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

  const formatDateOnly = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const fetchCodes = async () => {
    try {
      const [res1, res2] = await Promise.all([
        getCodeItems("SYS", "SYS001").catch(() => ({ data: [] })),
        getCodeItems("SYS", "SYS002").catch(() => ({ data: [] })),
      ]);
      sys001Items.value = res1.data;
      sys002Items.value = res2.data;
    } catch (error) {}
  };

  const fetchSchedules = async (page = 1) => {
    try {
      const payload = { page, limit: pageSize };
      if (searchParams.value.schGroupCode)
        payload.schGroupCode = searchParams.value.schGroupCode;
      if (searchParams.value.userId) payload.userId = searchParams.value.userId;
      if (searchParams.value.schYear)
        payload.schYear = searchParams.value.schYear;
      if (searchParams.value.schMonth)
        payload.schMonth = searchParams.value.schMonth;
      if (searchParams.value.schDate)
        payload.schDate = searchParams.value.schDate;
      const res = await getSchedules(payload);

      if (res.data?.data) {
        schedules.value = res.data.data;
        totalPages.value = res.data.totalPages || 1;
        totalCount.value = res.data.totalCount || res.data.data.length;
      } else if (Array.isArray(res.data)) {
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
      schedules.value = [];
      totalPages.value = 1;
      totalCount.value = 0;
    }
  };

  const fetchMinMaxDates = async () => {
    try {
      const params = {};
      if (searchParams.value.schGroupCode)
        params.schGroupCode = searchParams.value.schGroupCode;
      if (searchParams.value.userId) params.userId = searchParams.value.userId;
      const res = await getScheduleMinMax(params);
      minSchDate.value = res.data.minSchDate
        ? formatDateOnly(res.data.minSchDate)
        : "-";
      maxSchDate.value = res.data.maxSchDate
        ? formatDateOnly(res.data.maxSchDate)
        : "-";
    } catch (error) {
      minSchDate.value = "-";
      maxSchDate.value = "-";
    }
  };

  const handlePageChange = (page) => fetchSchedules(page);
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
        await updateSchedule(editTargetId.value, payload);
        toast.success("일정이 수정되었습니다.");
      } else {
        const year = parseInt(form.value.schYear);
        const month = parseInt(form.value.schMonth);
        const daysInMonth = new Date(year, month, 0).getDate();
        const bulkPayload = [];
        for (let day = 1; day <= daysInMonth; day++) {
          bulkPayload.push({
            ...form.value,
            schDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
            schYear: String(year),
            schMonth: String(month).padStart(2, "0"),
            schCode: form.value.schCode || null,
            createdBy: authStore.user?.userId || "SYSTEM",
            changedBy: authStore.user?.userId || "SYSTEM",
          });
        }
        await createScheduleBulk(bulkPayload);
        toast.success(`${year}년 ${month}월의 일정이 일괄 등록되었습니다.`);
      }
      resetForm();
      await fetchSchedules();
      await fetchMinMaxDates();
    } catch (error) {
      toast.error(`오류: ${error.response?.data?.message || "작업 실패"}`);
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
      schDate: formatDateOnly(item.schDate),
      schCode: item.schCode || "",
      useYn: item.useYn,
    };
    window.scrollTo(0, 0);
  };
  const deleteSchedule = async (id) => {
    if (!confirm("정말 이 일정을 삭제하시겠습니까?")) return;
    isSubmitting.value = true;
    try {
      await apiDeleteSchedule(id);
      toast.success("삭제되었습니다.");
      await fetchSchedules();
      await fetchMinMaxDates();
    } catch (error) {
      toast.error(`오류: ${error.response?.data?.message || "삭제 실패"}`);
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

  onMounted(async () => {
    await fetchCodes();
    await fetchSchedules();
    await fetchMinMaxDates();
  });
  return {
    currentPage,
    totalPages,
    isSubmitting,
    isEditMode,
    yearOptions,
    schedules,
    sys001Items,
    sys002Items,
    searchParams,
    minSchDate,
    maxSchDate,
    form,
    handlePageChange,
    handleSearch,
    handleSubmit,
    editSchedule,
    deleteSchedule,
    resetForm,
  };
}
