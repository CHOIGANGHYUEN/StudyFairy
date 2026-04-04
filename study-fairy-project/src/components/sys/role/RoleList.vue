<template>
  <section class="card-section list-section">
    <div class="card-header list-header">
      <h2 class="section-title">등록된 권한 목록</h2>
      <span class="badge badge-purple">{{ roles.length }}개</span>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-16">ID</th>
            <th>권한 ID</th>
            <th>설명</th>
            <th class="w-24 text-center">상태</th>
            <th>생성자</th>
            <th>생성일시</th>
            <th class="w-24 text-center">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in roles" :key="role.id">
            <td>{{ role.id }}</td>
            <td class="font-bold text-blue-700">{{ role.roleId }}</td>
            <td>{{ role.description }}</td>
            <td class="text-center">
              <span
                :class="[
                  'status-badge',
                  role.useYn === 1 ? 'active' : 'inactive',
                ]"
              >
                {{ role.useYn === 1 ? "사용" : "미사용" }}
              </span>
            </td>
            <td>{{ role.createdBy || "-" }}</td>
            <td>{{ formatDate(role.createdAt) }}</td>
            <td class="text-center">
              <div class="action-buttons">
                <button
                  @click="emit('edit', role)"
                  class="btn-icon"
                  :disabled="isSubmitting"
                  title="수정"
                >
                  ✏️
                </button>
                <button
                  @click="emit('delete', role.id)"
                  class="btn-icon"
                  :disabled="isSubmitting"
                  title="삭제"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="roles.length === 0">
            <td colspan="7" class="empty-state">등록된 권한이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({
  roles: Array,
  isSubmitting: Boolean,
});

const emit = defineEmits(["edit", "delete"]);

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.data-table tr:hover td {
  background-color: #f8fafc;
}
</style>
