import { ref, reactive, onMounted } from "vue";
import { getCodeItems } from "@/service/codeService";
import { getSchedules, getScheduleDetails } from "@/service/scheduleService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/composables/useToast";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export function useScheduleCalendar() {
  const authStore = useAuthStore();
  const toast = useToast();

  const currentView = ref("calendar");
  const schGroupCode = ref("");
  const scheduleGroupOptions = ref([]);
  const currentYear = ref(new Date().getFullYear());
  const currentMonth = ref(new Date().getMonth() + 1);
  const scheduleId = ref(null);
  const events = ref([]);

  const isModalVisible = ref(false);
  const selectedDate = ref("");
  const selectedDetail = ref(null);

  const setView = (view) => {
    currentView.value = view;
  };

  const fetchScheduleGroups = async () => {
    const response = await getCodeItems("SYS", "SYS001").catch(() => ({
      data: [],
    }));
    scheduleGroupOptions.value = response.data;
    schGroupCode.value =
      response.data?.length > 0 ? response.data[0].subCode : "SGR001";
    await fetchScheduleData();
  };

  const fetchScheduleData = async () => {
    if (!schGroupCode.value || !authStore.user?.userId) return;
    try {
      const response = await getSchedules({
        schGroupCode: schGroupCode.value,
        userId: authStore.user.userId,
        schYear: currentYear.value,
        schMonth: String(currentMonth.value).padStart(2, "0"),
      });
      if (response.data && response.data.length > 0) {
        scheduleId.value = response.data[0].id;
        await fetchScheduleDetails();
      } else {
        scheduleId.value = null;
        events.value = [];
      }
    } catch (error) {
      scheduleId.value = null;
      events.value = [];
    }
  };

  const fetchScheduleDetails = async () => {
    if (!scheduleId.value) return;
    try {
      const response = await getScheduleDetails({
        scheduleId: scheduleId.value,
      });
      events.value = response.data.map((detail) => ({
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
      events.value = [];
    }
  };

  const handleDateClick = (arg) => {
    if (!scheduleId.value)
      return toast.warning(
        "이 월에 대한 마스터 일정이 없어 작업을 추가할 수 없습니다. 관리자에게 문의하세요.",
      );
    selectedDate.value = arg.dateStr;
    selectedDetail.value = null;
    isModalVisible.value = true;
  };

  const handleEventClick = (arg) => {
    const detail = arg.event?.extendedProps || arg.event || arg;
    selectedDate.value = detail.schDate;
    selectedDetail.value = detail;
    isModalVisible.value = true;
  };

  const handleDatesSet = async (dateInfo) => {
    const newDate = dateInfo.view.currentStart;
    currentYear.value = newDate.getFullYear();
    currentMonth.value = newDate.getMonth() + 1;
    await fetchScheduleData();
  };

  const handleSaveSuccess = () => {
    isModalVisible.value = false;
    fetchScheduleDetails();
  };

  const handleNewPost = () => {
    if (!scheduleId.value)
      return toast.warning(
        "이 월에 대한 마스터 일정이 없어 작업을 추가할 수 없습니다. 관리자에게 문의하세요.",
      );
    selectedDate.value = new Date().toISOString().split("T")[0];
    selectedDetail.value = null;
    isModalVisible.value = true;
  };

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
    eventTimeFormat: { hour: "2-digit", minute: "2-digit", hour12: false },
    events: events,
    dateClick: handleDateClick,
    datesSet: handleDatesSet,
    eventClick: handleEventClick,
  });

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
    fetchScheduleData,
    fetchScheduleDetails,
    handleSaveSuccess,
    handleNewPost,
    handleEventClick,
  };
}
