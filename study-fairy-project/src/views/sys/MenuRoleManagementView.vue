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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      </template>
    </PageTitle>

    <!-- 메뉴-권한 매핑 등록 폼 (기존 MenuRoleForm) -->
    <section class="card-section">
      <div class="card-header flex justify-between items-center">
        <h2 class="section-title">
          {{ isEditMode ? "매핑 정보 수정" : "새 매핑 등록" }}
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
            <label for="roleId">권한 (Role) *</label>
            <select
              id="roleId"
              v-model="form.roleId"
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
            <label for="menuId">메뉴 (Menu) *</label>
            <select
              id="menuId"
              v-model="form.menuId"
              required
              :disabled="isEditMode || isSubmitting"
            >
              <option value="" disabled>메뉴를 선택하세요</option>
              <option
                v-for="menu in menus"
                :key="menu.menuId"
                :value="menu.menuId"
              >
                {{ menu.menuNm }} [{{ menu.menuId }}]
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="useYn">사용 여부</label>
            <select
              id="useYn"
              v-model.number="form.useYn"
              :disabled="isSubmitting"
            >
              <option :value="1">사용</option>
              <option :value="0">미사용</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          class="btn-primary"
          :disabled="isSubmitting || !form.roleId || !form.menuId"
        >
          {{
            isSubmitting ? "처리 중..." : isEditMode ? "수정하기" : "등록하기"
          }}
        </button>
      </form>
    </section>

    <!-- 메뉴-권한 매핑 목록 (기존 MenuRoleList) -->
    <section class="card-section list-section">
      <div class="card-header list-header">
        <h2 class="section-title">등록된 매핑 목록</h2>
        <span class="badge badge-purple">{{ mappings.length }}건</span>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="w-16">ID</th>
              <th>권한 ID (Role)</th>
              <th>메뉴 ID (Menu)</th>
              <th class="w-24 text-center">상태</th>
              <th>생성일시</th>
              <th class="w-24 text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in mappings" :key="item.id">
              <td>{{ item.id }}</td>
              <td class="font-bold text-purple-700">{{ item.roleId }}</td>
              <td class="font-bold text-blue-700">{{ item.menuId }}</td>
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
                    @click="copyMapping(item)"
                    class="btn-icon"
                    :disabled="isSubmitting"
                    title="참조생성"
                  >
                    📄
                  </button>
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
                등록된 매핑 정보가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { useMenuRoleManagement } from "@/composables/sys/role/useMenuRoleManagement";

const {
  isSubmitting,
  isEditMode,
  mappings,
  roles,
  menus,
  form,
  handleSubmit,
  copyMapping,
  editMapping,
  deleteMapping,
  resetForm,
} = useMenuRoleManagement();

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.icon {
  color: #3b82f6;
  width: 1.5rem;
  height: 1.5rem;
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
