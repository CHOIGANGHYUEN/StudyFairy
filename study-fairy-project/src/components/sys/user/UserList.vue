<template>
  <section class="card-section list-section">
    <div class="card-header list-header">
      <h2 class="section-title">등록된 사용자 목록</h2>
      <span class="badge badge-blue">{{ users.length }}명</span>
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
  </section>
</template>

<script setup>
defineProps({ users: Array });
const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.data-table tr:hover td {
  background-color: #f8fafc;
}
</style>
