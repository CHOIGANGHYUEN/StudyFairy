<template>
  <div class="board-view">
    <div class="board-header">
      <h2>일정 게시판</h2>
      <button @click="onNewPostClick" class="new-post-btn">글쓰기</button>
    </div>
    <div v-if="events.length === 0" class="no-events">
      등록된 일정이 없습니다.
    </div>
    <div v-else class="event-list">
      <div
        v-for="event in events"
        :key="event.id"
        class="event-item"
        @click="onEventClick(event)"
      >
        <div class="event-date">
          {{ formatDate(event.start) }}
        </div>
        <div class="event-details">
          <div class="event-title">
            <span :class="['status-indicator', getStatusClass(event)]"></span>
            {{ event.title }}
          </div>
          <div v-if="!event.allDay" class="event-time">
            {{ formatTime(event.start) }} - {{ formatTime(event.end) }}
          </div>
        </div>
        <span :class="['event-status', getStatusClass(event)]">{{
          getStatus(event)
        }}</span>
      </div>
    </div>
    <div class="pagination-wrapper" v-if="totalPages > 1">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="emit('page-change', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import Pagination from "@/components/common/Pagination.vue";

defineProps({
  events: {
    type: Array,
    required: true,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(["event-click", "new-post", "page-change"]);

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = date.toLocaleDateString("ko-KR", { weekday: "short" });
  return `${date.getMonth() + 1}.${date.getDate()} (${day})`;
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const getStatusInfo = (event) => {
  const now = new Date();
  const startDate = new Date(event.start);
  const endDate = event.end ? new Date(event.end) : null;

  if (endDate) {
    if (now > endDate) return { text: "완료", class: "completed" };
    if (now >= startDate && now <= endDate)
      return { text: "진행중", class: "in-progress" };
  }

  if (now < startDate) {
    return { text: "예정", class: "upcoming" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDay = new Date(startDate);
  startDay.setHours(0, 0, 0, 0);

  if (startDay < today) {
    return { text: "완료", class: "completed" };
  } else if (startDay.getTime() === today.getTime()) {
    return { text: "진행중", class: "in-progress" };
  }

  return { text: "예정", class: "upcoming" };
};

const getStatus = (event) => getStatusInfo(event).text;
const getStatusClass = (event) => getStatusInfo(event).class;

function onEventClick(event) {
  emit("event-click", { event: event });
}

function onNewPostClick() {
  emit("new-post");
}
</script>

<style scoped>
.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.board-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
}
.new-post-btn {
  padding: 0.5rem 1rem;
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.new-post-btn:hover {
  background-color: #0b5ed7;
}

.board-view {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}
.no-events {
  text-align: center;
  color: #6c757d;
  padding: 3rem 0;
}
.event-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.event-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.event-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.event-date {
  font-weight: 600;
  font-size: 0.95em;
  text-align: center;
  color: #495057;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

.event-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.75rem;
  flex-shrink: 0;
}
.status-indicator.completed {
  background-color: #6c757d;
}
.status-indicator.in-progress {
  background-color: #28a745;
}
.status-indicator.upcoming {
  background-color: #ffc107;
}

.event-time {
  font-size: 0.85em;
  color: #6c757d;
}
.event-status {
  font-size: 0.8em;
  font-weight: 500;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  justify-self: center;
  color: #fff;
}
.event-status.completed {
  background-color: #6c757d;
  color: white;
}
.event-status.in-progress {
  background-color: #28a745;
  color: white;
}
.event-status.upcoming {
  background-color: #ffc107;
  color: #212529;
}
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
}
</style>
