<template>
  <section class="card-section list-section">
    <div class="card-header list-header">
      <h2 class="section-title">등록된 회사 목록</h2>
      <span class="badge badge-purple">{{ companies.length }}개</span>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>회사 ID</th>
            <th>회사명</th>
            <th>대표자명</th>
            <th>사업자번호</th>
            <th>연락처</th>
            <th class="w-24 text-center">사용여부</th>
            <th class="w-24 text-center">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in companies" :key="company.id">
            <td class="font-bold text-blue-700">{{ company.company }}</td>
            <td>
              <div
                v-for="name in company.names"
                :key="name.langu"
                class="lang-name-pair"
              >
                <span class="lang-code-badge">{{ name.langu }}</span>
                <span>{{ name.companyNm }}</span>
              </div>
            </td>
            <td>{{ company.repNm }}</td>
            <td>{{ company.regNo }}</td>
            <td>{{ company.telNo }}</td>
            <td class="text-center">
              <span
                :class="[
                  'status-badge',
                  company.useYn === 1 ? 'active' : 'inactive',
                ]"
              >
                {{ company.useYn === 1 ? "사용" : "미사용" }}
              </span>
            </td>
            <td class="text-center">
              <div class="action-buttons">
                <button
                  @click="emit('edit', company)"
                  class="btn-icon"
                  :disabled="isSubmitting"
                  title="수정"
                >
                  ✏️
                </button>
                <button
                  @click="emit('delete', company.id)"
                  class="btn-icon"
                  :disabled="isSubmitting"
                  title="삭제"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="companies.length === 0">
            <td colspan="7" class="empty-state">등록된 회사가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({
  companies: Array,
  isSubmitting: Boolean,
});

const emit = defineEmits(["edit", "delete"]);
</script>

<style scoped>
.data-table tr:hover td {
  background-color: #f8fafc;
}
.lang-name-pair {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.lang-code-badge {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  font-weight: 700;
  font-size: 0.7rem;
  font-family: monospace;
  border: 1px solid #e2e8f0;
}
</style>
