<template>
  <div>
    <PageTitle title="사용자 월별 작업 등록" />
    <div class="controls">
      <label for="schGroupCode">일정 그룹:</label>
      <select
        id="schGroupCode"
        v-model="schGroupCode"
        @change="fetchScheduleData"
      >
        <option value="" disabled>그룹 선택</option>
        <!-- Fallback options for when API fails -->
        <option v-if="scheduleGroupOptions.length === 0" value="SGR001">
          업무 (SGR001)
        </option>
        <option v-if="scheduleGroupOptions.length === 0" value="SGR002">
          학습 (SGR002)
        </option>
        <!-- Options from API -->
        <option
          v-for="item in scheduleGroupOptions"
          :key="item.subCode"
          :value="item.subCode"
        >
          {{ item.description || item.subCode }} ({{ item.subCode }})
        </option>
      </select>
      <p v-if="!scheduleId" class="warning">
        선택된 조건의 마스터 일정이 없습니다. [관리자 > 일정등록]에서 먼저
        생성해야 합니다.
      </p>
    </div>
    <FullCalendar :options="calendarOptions" />

    <ScheduleDetailModal
      :visible="isModalVisible"
      :date="selectedDate"
      :scheduleId="scheduleId"
      :schGroupCode="schGroupCode"
      :schYear="currentYear"
      :schMonth="currentMonth"
      @close="isModalVisible = false"
      @save-success="handleSaveSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import PageTitle from "@/components/PageTitle.vue";
import ScheduleDetailModal from "@/components/ScheduleDetailModal.vue";
import api from "@/service/api";
import { useAuthStore } from "@/stores/useAuthStore";

const authStore = useAuthStore();

// --- Reactive State ---
const schGroupCode = ref("");
const scheduleGroupOptions = ref([]);
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);
const scheduleId = ref(null);
const events = ref([]);

// Modal control state
const isModalVisible = ref(false);
const selectedDate = ref("");

// --- Lifecycle Hooks ---
onMounted(async () => {
  await fetchScheduleGroups();
});

// --- Methods ---

async function fetchScheduleGroups() {
  const response = await api.get("/api/codes/items/SYS/SYS001").catch(() => {
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
  events: events,
  dateClick: handleDateClick,
  datesSet: handleDatesSet,
});

function handleSaveSuccess() {
  isModalVisible.value = false;
  fetchScheduleDetails();
}

// Called when the user clicks prev/next or changes the view
async function handleDatesSet(dateInfo) {
  const newDate = dateInfo.view.currentStart;
  currentYear.value = newDate.getFullYear();
  currentMonth.value = newDate.getMonth() + 1;
  await fetchScheduleData();
}

// Main data fetching logic
async function fetchScheduleData() {
  if (!schGroupCode.value) {
    console.warn("No schedule group selected. Aborting fetch.");
    return;
  }
  if (!authStore.user || !authStore.user.userId) {
    console.error("User not logged in or userId is missing.");
    return;
  }

  // 1. Find the parent schedule (sysSchedule)
  try {
    const response = await api.get("/api/schedules", {
      params: {
        schGroupCode: schGroupCode.value,
        userId: authStore.user.userId,
        schYear: currentYear.value,
        schMonth: String(currentMonth.value).padStart(2, "0"),
      },
    });

    if (response.data && response.data.length > 0) {
      const scheduleMaster = response.data[0];
      scheduleId.value = scheduleMaster.id;
      await fetchScheduleDetails();
    } else {
      console.warn("No master schedule found for the selected criteria.");
      scheduleId.value = null;
      events.value = [];
    }
  } catch (error) {
    console.error("Error fetching master schedule:", error);
    scheduleId.value = null;
    events.value = [];
  }
}

// Fetches details based on the current scheduleId
async function fetchScheduleDetails() {
  if (!scheduleId.value) return;

  try {
    const response = await api.get("/api/schedule-details", {
      params: { scheduleId: scheduleId.value },
    });
    // Map backend data to FullCalendar event format
    events.value = response.data.map((detail) => ({
      id: detail.id,
      title: detail.title,
      start: detail.schDate,
      allDay: true,
      extendedProps: detail,
    }));
  } catch (error) {
    console.error("Error fetching schedule details:", error);
    events.value = [];
  }
}

// Called when a date on the calendar is clicked
function handleDateClick(arg) {
  if (!scheduleId.value) {
    alert(
      "이 월에 대한 마스터 일정이 없어 작업을 추가할 수 없습니다. 관리자에게 문의하세요.",
    );
    return;
  }
  selectedDate.value = arg.dateStr;
  isModalVisible.value = true;
}
</script>

<style scoped>
.controls {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.warning {
  color: #e67e22;
  font-size: 0.9em;
  margin: 0;
}
</style>
