import { ref, reactive, onMounted } from "vue";
import api from "@/services";
import { useAuthStore } from "@/stores/useAuthStore";

export function useScheduleCalendar() {
  const authStore = useAuthStore();

  // --- View State ---
  const currentView = ref("calendar"); // 'calendar', 'board', 'both'

  function setView(view) {
    currentView.value = view;
  }

  // --- Reactive State ---
  const schGroupCode = ref("");
  const scheduleGroupOptions = ref([]);
  const currentYear = ref(new Date().getFullYear());
  const currentMonth = ref(new Date().getMonth() + 1);
  const scheduleId = ref(null);
  const events = ref([]);

  // Board Pagination
  const boardCurrentPage = ref(1);
  const boardTotalPages = ref(1);
  const boardPageSize = 10;
  const boardTotalCount = ref(0);

  // Modal control state
  const isModalVisible = ref(false);
  const selectedDate = ref("");
  const selectedDetail = ref(null);

  async function fetchScheduleGroups() {
    const response = await api.get("/codes/items/SYS/SYS001").catch(() => {
      console.error("Failed to fetch schedule groups. Using fallback.");
      return { data: [] };
    });

    scheduleGroupOptions.value = response.data;

    if (response.data && response.data.length > 0) {
      schGroupCode.value = response.data[0].subCode;
    } else {
      schGroupCode.value = "SGR001";
    }
    await fetchScheduleData();
  }

  // --- Calendar Options ---
  const calendarOptions = reactive({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth",
    },
    displayEventTime: true,
    displayEventEnd: true,
    eventTimeFormat: {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
    events: computed(() => events.value), // Use a computed to ensure reactivity
    dateClick: handleDateClick,
    datesSet: handleDatesSet,
    eventClick: handleEventClick,
  });

  function handleSaveSuccess() {
    isModalVisible.value = false;
    fetchScheduleDetails(boardCurrentPage.value);
  }

  async function handleDatesSet(dateInfo) {
    const newDate = dateInfo.view.currentStart;
    currentYear.value = newDate.getFullYear();
    currentMonth.value = newDate.getMonth() + 1;
    await fetchScheduleData();
  }

  async function fetchScheduleData() {
    if (!schGroupCode.value) return;
    if (!authStore.user?.userId) return;

    try {
      const response = await api.get("/schedules", {
        params: {
          schGroupCode: schGroupCode.value,
          userId: authStore.user.userId,
          schYear: currentYear.value,
          schMonth: String(currentMonth.value).padStart(2, "0"),
          limit: 1,
        },
      });

      if (response.data?.data?.length > 0) {
        scheduleId.value = response.data.data[0].id;
        await fetchScheduleDetails();
      } else {
        scheduleId.value = null;
        events.value = [];
        boardTotalCount.value = 0;
        boardTotalPages.value = 1;
      }
    } catch (error) {
      console.error("Error fetching master schedule:", error);
      scheduleId.value = null;
      events.value = [];
    }
  }

  async function fetchScheduleDetails(page = 1) {
    if (!scheduleId.value) return;
    try {
      const response = await api.get("/schedule-details", {
        params: {
          scheduleId: scheduleId.value,
          page: page,
          limit: boardPageSize,
          sort: 'desc'
        },
      });
      
      const details = response.data.data || [];
      boardCurrentPage.value = page;
      boardTotalPages.value = response.data.totalPages || 1;
      boardTotalCount.value = response.data.totalCount || 0;

      events.value = details.map((detail) => ({
        id: detail.id,
        title: detail.title,
        start: detail.startTime
          ? detail.startTime.replace(" ", "T")
          : detail.schDate,
        end: detail.endTime ? detail.endTime.replace(" ", "T") : null,
        allDay: !detail.startTime,
        extendedProps: detail,
      }));
    } catch (error) {
      console.error("Error fetching schedule details:", error);
      events.value = [];
    }
  }

  function handleBoardPageChange(page) {
    fetchScheduleDetails(page);
  }

  function handleDateClick(arg) {
    if (!scheduleId.value) {
      alert("이 월에 대한 마스터 일정이 없어 작업을 추가할 수 없습니다.");
      return;
    }
    selectedDate.value = arg.dateStr;
    selectedDetail.value = null;
    isModalVisible.value = true;
  }

  function handleEventClick(arg) {
    const detail = arg.event.extendedProps || arg.event;
    selectedDate.value = detail.schDate;
    selectedDetail.value = detail;
    isModalVisible.value = true;
  }

  function handleNewPost() {
    if (!scheduleId.value) {
      alert("이 월에 대한 마스터 일정이 없어 작업을 추가할 수 없습니다.");
      return;
    }
    selectedDate.value = new Date().toISOString().split("T")[0];
    selectedDetail.value = null;
    isModalVisible.value = true;
  }

  onMounted(fetchScheduleGroups);

  return {
    currentView,
    setView,
    schGroupCode,
    scheduleGroupOptions,
    currentYear,
    currentMonth,
    scheduleId,
    events,
    isModalVisible,
    selectedDate,
    selectedDetail,
    calendarOptions,
    boardCurrentPage,
    boardTotalPages,
    boardTotalCount,
    fetchScheduleData,
    handleSaveSuccess,
    handleEventClick,
    handleNewPost,
    fetchScheduleDetails,
    handleBoardPageChange,
  };
}
