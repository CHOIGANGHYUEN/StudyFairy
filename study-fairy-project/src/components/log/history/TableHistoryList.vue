<template>
  <div class="card-section">
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>작업 일시</th>
            <th>테이블명</th>
            <th>유형</th>
            <th>대상명</th>
            <th>작업</th>
            <th>속성 변경</th>
            <th>반영 여부</th>
            <th>작업자</th>
            <th>데이터 상세</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="histories.length === 0">
            <td colspan="9" class="text-center py-4 text-gray-500">
              조회된 변경 이력이 없습니다.
            </td>
          </tr>
          <tr v-for="item in histories" :key="item.id">
            <td class="text-sm">{{ formatDate(item.createdAt) }}</td>
            <td class="font-semibold text-blue-600">{{ item.tablen }}</td>
            <td>
              <span class="badge" :class="getTypeBadgeClass(item.targetType)">
                {{ item.targetType }}
              </span>
            </td>
            <td>{{ item.targetName || "-" }}</td>
            <td>
              <span class="badge" :class="getActionBadgeClass(item.actionType)">
                {{ item.actionType }}
              </span>
            </td>
            <td class="text-xs text-gray-600">
              {{ item.targetColumn || "-" }}
            </td>
            <td>
              <span v-if="item.isApplied" class="badge bg-green-100 text-green-800">
                반영됨
              </span>
              <span v-else class="badge bg-gray-100 text-gray-600">
                미반영
              </span>
            </td>
            <td>{{ item.createdBy || "SYSTEM" }}</td>
            <td>
              <button
                @click="$emit('open-detail', item)"
                class="text-xs btn btn-secondary px-2 py-1"
                :disabled="!item.beforeValue && !item.afterValue"
              >
                상세보기
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination from global component -->
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="(page) => $emit('page-change', page)"
    />
  </div>
</template>

<script setup>
import Pagination from "@/components/Pagination.vue";

const props = defineProps({
  histories: {
    type: Array,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['open-detail', 'page-change']);

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getTypeBadgeClass(type) {
  switch (type) {
    case "TABLE":
      return "bg-purple-100 text-purple-800";
    case "FIELD":
      return "bg-blue-100 text-blue-800";
    case "INDEX":
      return "bg-orange-100 text-orange-800";
    case "INDEX_FIELD":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getActionBadgeClass(action) {
  switch (action) {
    case "INSERT":
      return "bg-green-100 text-green-800 border border-green-200";
    case "UPDATE":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "DELETE":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
</script>

<style scoped>
.badge {
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}
</style>