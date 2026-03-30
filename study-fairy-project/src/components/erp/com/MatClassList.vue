<template>
  <section class="card-section">
    <div class="card-header">
      <h2 class="section-title">자재 분류 목록</h2>
    </div>
    <div v-if="isLoading" class="loading-state">데이터를 불러오는 중...</div>
    <div v-else-if="!matClasses.length" class="empty-state">
      등록된 자재 분류가 없습니다.
    </div>
    <div class="table-container" v-else>
      <table class="data-table">
        <thead>
          <tr>
            <th>회사 ID</th>
            <th>분류 코드</th>
            <th>분류명</th>
            <th>상위 분류</th>
            <th class="text-center">레벨</th>
            <th class="text-center">상태</th>
            <th class="text-center">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sortedMatClasses" :key="item.id">
            <td>{{ item.companyId }}</td>
            <td class="font-bold">{{ item.matClass }}</td>
            <td :style="{ paddingLeft: `${(item.classLevel - 1) * 20 + 8}px` }">
              <span v-if="item.classLevel > 1" class="text-gray-400 mr-1"
                >└
              </span>
              {{ getMatClassName(item) }}
            </td>
            <td>{{ item.parentClass || "-" }}</td>
            <td class="text-center">{{ item.classLevel }}</td>
            <td class="text-center">
              <span
                :class="['status-badge', item.useYn ? 'active' : 'inactive']"
              >
                {{ item.useYn ? "사용" : "미사용" }}
              </span>
            </td>
            <td class="action-buttons text-center">
              <button
                @click="$emit('edit-item', item)"
                class="btn-icon"
                title="수정"
              >
                ✏️
              </button>
              <button
                @click="$emit('delete-item', item.id)"
                class="btn-icon"
                title="삭제"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  matClasses: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
});

defineEmits(["edit-item", "delete-item"]);

const sortedMatClasses = computed(() => {
  // 레벨 순 정렬 (백엔드에서 계층 정렬이 안되어 있을 경우를 대비한 단순 레벨 정렬)
  return [...props.matClasses].sort((a, b) => {
    if (a.classLevel !== b.classLevel) return a.classLevel - b.classLevel;
    return a.matClass.localeCompare(b.matClass);
  });
});

function getMatClassName(item) {
  if (!item.names || item.names.length === 0) return "-";
  const nameObj = item.names.find((n) => n.langu === "ko") || item.names[0];
  return nameObj ? nameObj.matClassNm : "-";
}
</script>

<style scoped>
.card-section {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.card-header {
  margin-bottom: 1rem;
}
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
}
.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}
.table-container {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th,
.data-table td {
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  text-align: left;
}
.data-table th {
  background-color: #f8fafc;
}
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}
.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}
.status-badge.inactive {
  background-color: #f1f5f9;
  color: #475569;
}
.text-center {
  text-align: center;
}
.text-gray-400 {
  color: #9ca3af;
}
.mr-1 {
  margin-right: 0.25rem;
}
</style>
