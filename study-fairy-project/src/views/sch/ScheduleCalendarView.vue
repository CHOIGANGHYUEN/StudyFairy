<template>
  <div class="admin-container">
    <PageTitle title="사용자 월별 작업 등록" />

    <!-- Search Section -->
    <section class="card-section search-section">
      <div class="search-grid">
        <div class="form-group">
          <label for="schGroupCode">일정 그룹</label>
          <select id="schGroupCode" v-model="schGroupCode">
            <option value="" disabled>그룹 선택</option>
            <option v-if="scheduleGroupOptions.length === 0" value="SGR001">
              업무 (SGR001)
            </option>
            <option v-if="scheduleGroupOptions.length === 0" value="SGR002">
              학습 (SGR002)
            </option>
            <option
              v-for="item in scheduleGroupOptions"
              :key="item.subCode"
              :value="item.subCode"
            >
              {{ item.description || item.subCode }} ({{ item.subCode }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>뷰 모드</label>
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
      </div>
      <div class="search-actions">
        <p v-if="!scheduleId" class="warning-text">
          선택된 조건의 마스터 일정이 없습니다. [관리자 > 일정등록]에서 먼저
          생성해야 합니다.
        </p>
        <button class="btn btn-primary search-btn" @click="fetchScheduleData">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon-sm"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          조회
        </button>
      </div>
    </section>

    <!-- 캘린더 + 게시판 뷰 -->
    <div v-if="currentView === 'both'" class="view-container both-view">
      <div class="calendar-section">
        <FullCalendar :options="calendarOptions" />
      </div>
      <div class="board-section">
        <ScheduleBoardView
          :events="events"
          :current-page="boardCurrentPage"
          :total-pages="boardTotalPages"
          @event-click="handleEventClick"
          @new-post="handleNewPost"
          @page-change="handleBoardPageChange"
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
        :current-page="boardCurrentPage"
        :total-pages="boardTotalPages"
        @event-click="handleEventClick"
        @new-post="handleNewPost"
        @page-change="handleBoardPageChange"
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
import FullCalendar from "@fullcalendar/vue3";
import PageTitle from "@/components/common/PageTitle.vue";
import ScheduleDetailModal from "@/components/schedule/ScheduleDetailModal.vue";
import ScheduleBoardView from "@/components/schedule/ScheduleBoardView.vue";
import { useScheduleCalendar } from "@/composables/useScheduleCalendar";

const {
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
  fetchScheduleData,
  handleSaveSuccess,
  handleEventClick,
  handleNewPost,
  fetchScheduleDetails,
  handleBoardPageChange,
} = useScheduleCalendar();
</script>

<style scoped>
.search-section {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
}
.search-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.search-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  gap: 1rem;
}
.search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
}
.icon-sm {
  width: 1.2rem;
  height: 1.2rem;
}
.warning-text {
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
