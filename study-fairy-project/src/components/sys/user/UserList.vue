<template>
  <section class="card-section list-section">
    <div class="card-header list-header">
      <h2 class="section-title">등록된 사용자 목록</h2>
      <span class="badge">{{ totalCount }}명</span>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID (PK)</th>
            <th>사용자 ID</th>
            <th>생성자</th>
            <th>생성일시</th>
            <th>수정일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td class="font-bold">{{ user.userId }}</td>
            <td>{{ user.createdBy || "-" }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>{{ formatDate(user.changedAt) }}</td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="5" class="empty-state">등록된 사용자가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination-wrapper" v-if="totalPages > 1">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="emit('pageChange', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import Pagination from "@/components/common/Pagination.vue";

defineProps({
  users: Array,
  totalCount: Number,
  currentPage: Number,
  totalPages: Number,
  formatDate: Function,
});

const emit = defineEmits(["pageChange"]);
</script>

<style scoped>
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.badge {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.table-container {
  overflow-x: auto;
}
.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: #94a3b8;
}
.data-table tr:hover td {
  background-color: #f8fafc;
}
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
}
</style>
