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

      <div class="view-switcher">
        <button
          @click="setView('calendar')"
          :class="{ active: currentView === 'calendar' }"
        >
          캘린더
        </button>
        <button
          @click="setView('board')"
          :class="{ active: currentView === 'board' }"
        >
          게시판
        </button>
        <button
          @click="setView('both')"
          :class="{ active: currentView === 'both' }"
        >
          캘린더+게시판
        </button>
      </div>
    </div>

    <!-- 캘린더 + 게시판 뷰 -->
    <div v-if="currentView === 'both'" class="view-container both-view">
      <div class="calendar-section">
        <FullCalendar :options="calendarOptions" />
      </div>
      <div class="board-section">
        <ScheduleBoardView
          :events="events"
          @event-click="handleEventClick"
          @new-post="handleNewPost"
        />
      </div>
    </div>

    <!-- 캘린더 단독 뷰 -->
    <div v-else-if="currentView === 'calendar'" class="view-container">
      <FullCalendar :options="calendarOptions" />
    </div>

    <!-- 게시판 단독 뷰 -->
    <div v-else-if="currentView === 'board'" class="view-container">
      <ScheduleBoardView
        :events="events"
        @event-click="handleEventClick"
        @new-post="handleNewPost"
      />
    </div>

    <ScheduleDetailModal
      :visible="isModalVisible"
      :date="selectedDate"
      :scheduleId="scheduleId"
      :schGroupCode="schGroupCode"
      :schYear="currentYear"
      :schMonth="currentMonth"
      :detailData="selectedDetail"
      @close="isModalVisible = false"
      @save-keep-open="fetchScheduleDetails"
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
import ScheduleBoardView from "@/components/ScheduleBoardView.vue";
import api from "@/service/api";
import { useAuthStore } from "@/stores/useAuthStore";

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

// Modal control state
const isModalVisible = ref(false);
const selectedDate = ref("");
const selectedDetail = ref(null);

// --- Lifecycle Hooks ---
onMounted(async () => {
  await fetchScheduleGroups();
});

// --- Methods ---

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
  events: events,
  dateClick: handleDateClick,
  datesSet: handleDatesSet,
  eventClick: handleEventClick,
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
    const response = await api.get("/schedules", {
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
    const response = await api.get("/schedule-details", {
      params: { scheduleId: scheduleId.value },
    });
    // Map backend data to FullCalendar event format
    events.value = response.data.map((detail) => ({
      id: detail.id,
      title: detail.title,
      start: detail.startTime
        ? detail.startTime.replace(" ", "T")
        : detail.schDate,
      end: detail.endTime ? detail.endTime.replace(" ", "T") : null,
      allDay: !detail.startTime, // 시간이 등록되지 않았다면 종일 일정으로 표시
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
  selectedDetail.value = null; // 신규 등록 모드
  isModalVisible.value = true;
}

// 캘린더에 등록된 기존 일정 클릭 시 (상세 보기/수정)
function handleEventClick(arg) {
  const detail = arg.event.extendedProps || arg.event; // 보드 뷰에서 오는 이벤트는 extendedProps가 없음
  selectedDate.value = detail.schDate;
  selectedDetail.value = detail; // 수정/상세 모드
  isModalVisible.value = true;
}

// 게시판 뷰에서 '글쓰기' 버튼 클릭 시
function handleNewPost() {
  if (!scheduleId.value) {
    alert(
      "이 월에 대한 마스터 일정이 없어 작업을 추가할 수 없습니다. 관리자에게 문의하세요.",
    );
    return;
  }
  selectedDate.value = new Date().toISOString().split("T")[0]; // 오늘 날짜를 기본값으로
  selectedDetail.value = null; // 신규 등록 모드
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

.view-switcher {
  display: flex;
  gap: 0;
  margin-left: auto;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #dee2e6;
}

.view-switcher button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #495057;
  border-left: 1px solid #dee2e6;
}

.view-switcher button:first-child {
  border-left: none;
}

.view-switcher button.active {
  background-color: #0d6efd;
  color: white;
}

.view-switcher button:not(.active):hover {
  background-color: #f8f9fa;
}

.view-container {
  margin-top: 1rem;
}

.both-view {
  display: flex;
  gap: 1rem;
}

.calendar-section {
  flex: 1;
}

.board-section {
  flex: 1;
  border-left: 1px solid #ddd;
  padding-left: 1rem;
}
</style>
