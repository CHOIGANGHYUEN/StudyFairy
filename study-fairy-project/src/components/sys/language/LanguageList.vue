<template>
  <section class="card-section list-section">
    <div class="card-header list-header">
      <h2 class="section-title">지원 언어 목록</h2>
      <span class="badge">{{ languages.length }}개 언어</span>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>언어 코드</th>
            <th>언어 이름</th>
            <th>생성자</th>
            <th>생성일시</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lang in languages" :key="lang.id">
            <td>{{ lang.id }}</td>
            <td>
              <span class="lang-code-badge">{{ lang.langu }}</span>
            </td>
            <td class="font-bold">{{ lang.languNm }}</td>
            <td>{{ lang.createdBy || "SYSTEM" }}</td>
            <td>{{ formatDate(lang.createdAt) }}</td>
            <td class="text-center">
              <div class="action-buttons">
                <button
                  @click="emit('delete', lang.id)"
                  class="btn-icon"
                  :disabled="isSubmitting"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="languages.length === 0">
            <td colspan="6" class="empty-state">
              등록된 언어 정보가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({
  languages: Array,
  isSubmitting: Boolean,
});

const emit = defineEmits(["delete"]);

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.badge {
  background-color: #ecfeff;
  color: #0891b2;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.table-container {
  overflow-x: auto;
}
.data-table tr:hover td {
  background-color: #f8fafc;
}
.lang-code-badge {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 700;
  font-family: monospace;
  border: 1px solid #e2e8f0;
}
.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: #94a3b8;
}
</style>
