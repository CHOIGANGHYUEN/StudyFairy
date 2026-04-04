<template>
  <div class="admin-container">
    <PageTitle>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </template>
    </PageTitle>

    <!-- 권한 폼 (기존 RoleForm) -->
    <section class="card-section">
      <div class="card-header flex justify-between items-center">
        <h2 class="section-title">
          {{ isEditMode ? "권한 정보 수정" : "새 권한 등록" }}
        </h2>
        <button
          v-if="isEditMode"
          @click="resetForm"
          class="text-sm font-medium text-blue-600 hover:underline"
        >
          취소 및 신규 전환
        </button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label for="roleId">권한 ID (Role ID) *</label>
            <input
              type="text"
              id="roleId"
              :value="form.roleId"
              @input="form.roleId = $event.target.value"
              placeholder="예: ROLE_ADMIN"
              required
              :disabled="isEditMode || isSubmitting"
            />
          </div>
          <div class="form-group">
            <label for="description">설명 (Description)</label>
            <input
              type="text"
              id="description"
              :value="form.description"
              @input="form.description = $event.target.value"
              placeholder="예: 운영 관리자"
              :disabled="isSubmitting"
            />
          </div>
          <div class="form-group">
            <label for="useYn">사용 여부</label>
            <select
              id="useYn"
              :value="form.useYn"
              @input="form.useYn = Number($event.target.value)"
              :disabled="isSubmitting"
            >
              <option :value="1">사용</option>
              <option :value="0">미사용</option>
            </select>
          </div>
        </div>
        <div class="p-4 border-t border-slate-200">
          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="isSubmitting || !form.roleId"
          >
            {{
              isSubmitting ? "처리 중..." : isEditMode ? "수정하기" : "등록하기"
            }}
          </button>
        </div>
      </form>
    </section>

    <!-- 권한 목록 (기존 RoleList) -->
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
                    @click="editRole(role)"
                    class="btn-icon"
                    :disabled="isSubmitting"
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button
                    @click="deleteRole(role.id)"
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
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { useRoleManagement } from "@/composables/sys/role/useRoleManagement";

const {
  isSubmitting,
  isEditMode,
  roles,
  form,
  handleSubmit,
  editRole,
  deleteRole,
  resetForm,
} = useRoleManagement();

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.icon {
  color: #8b5cf6;
}
.p-4 {
  padding: 1rem;
}
.border-t {
  border-top-width: 1px;
}
.border-slate-200 {
  border-color: #e2e8f0;
}
.data-table tr:hover td {
  background-color: #f8fafc;
}
</style>
