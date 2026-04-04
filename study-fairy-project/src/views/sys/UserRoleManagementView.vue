<template>
  <div class="admin-container list-layout">
    <!-- 사용자 권한 매핑 폼 (기존 UserRoleForm) -->
    <section class="card-section">
      <div class="card-header flex justify-between items-center">
        <h2 class="section-title">
          {{ isEditMode ? "사용자 권한 정보 수정" : "새 사용자 권한 등록" }}
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
            <label for="userId">사용자 ID (User ID) *</label>
            <input
              type="text"
              id="userId"
              :value="form.userId"
              @input="form.userId = $event.target.value"
              placeholder="예: admin, user_01"
              required
              :disabled="isEditMode || isSubmitting"
            />
          </div>
          <div class="form-group">
            <label for="roleId">부여할 권한 (Role) *</label>
            <select
              id="roleId"
              :value="form.roleId"
              @input="form.roleId = $event.target.value"
              required
              :disabled="isEditMode || isSubmitting"
            >
              <option value="" disabled>권한을 선택하세요</option>
              <option
                v-for="role in roles"
                :key="role.roleId"
                :value="role.roleId"
              >
                {{ role.roleId }} ({{ role.description || "설명 없음" }})
              </option>
            </select>
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
            :disabled="isSubmitting || !form.userId || !form.roleId"
          >
            {{
              isSubmitting ? "처리 중..." : isEditMode ? "수정하기" : "등록하기"
            }}
          </button>
        </div>
      </form>
    </section>

    <div class="card flex-1 flex flex-col min-h-0 mb-0">
      <div class="overflow-y-auto flex-1 p-0">
        <!-- 사용자-권한 매핑 목록 (기존 UserRoleList) -->
        <section class="card-section list-section">
          <div class="card-header list-header">
            <h2 class="section-title">등록된 사용자-권한 목록</h2>
            <span class="badge badge-blue">{{ totalCount }}건</span>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="w-16">ID</th>
                  <th>사용자 ID (User)</th>
                  <th>권한 ID (Role)</th>
                  <th class="w-24 text-center">상태</th>
                  <th>생성일시</th>
                  <th class="w-24 text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in mappings" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td class="font-bold text-blue-700">{{ item.userId }}</td>
                  <td class="font-bold text-purple-700">{{ item.roleId }}</td>
                  <td class="text-center">
                    <span
                      :class="[
                        'status-badge',
                        item.useYn === 1 ? 'active' : 'inactive',
                      ]"
                    >
                      {{ item.useYn === 1 ? "사용" : "미사용" }}
                    </span>
                  </td>
                  <td>{{ formatDate(item.createdAt) }}</td>
                  <td class="text-center">
                    <div class="action-buttons">
                      <button
                        @click="editMapping(item)"
                        class="btn-icon"
                        :disabled="isSubmitting"
                        title="수정"
                      >
                        ✏️
                      </button>
                      <button
                        @click="deleteMapping(item.id)"
                        class="btn-icon"
                        :disabled="isSubmitting"
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="mappings.length === 0">
                  <td colspan="6" class="empty-state">
                    등록된 사용자-권한 매핑이 없습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <div class="border-t p-4 flex justify-center bg-white rounded-b-sm">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @update:current-page="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Pagination from "@/components/Pagination.vue";
import { useUserRoleManagement } from "@/composables/sys/role/useUserRoleManagement";

const {
  currentPage,
  totalPages,
  totalCount,
  isSubmitting,
  isEditMode,
  mappings,
  roles,
  form,
  handlePageChange,
  handleSubmit,
  editMapping,
  deleteMapping,
  resetForm,
} = useUserRoleManagement();

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.border-t {
  border-top-width: 1px;
}
.border-slate-200 {
  border-color: #e2e8f0;
}
.p-4 {
  padding: 1rem;
}
.data-table tr:hover td {
  background-color: #f8fafc;
}
.text-purple-700 {
  color: #7e22ce;
}
.text-blue-700 {
  color: #1d4ed8;
}
</style>
