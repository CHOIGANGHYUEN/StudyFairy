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

    <!-- Form Section: 권한 등록/수정 폼 -->
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
              v-model="form.roleId"
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
              v-model="form.description"
              placeholder="예: 운영 관리자"
              :disabled="isSubmitting"
            />
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
          :disabled="isSubmitting || !form.roleId"
        >
          {{
            isSubmitting ? "처리 중..." : isEditMode ? "수정하기" : "등록하기"
          }}
        </button>
      </form>
    </section>

    <!-- Table Section: 권한 목록 -->
    <section class="card-section list-section">
      <div class="card-header list-header">
        <h2 class="section-title">등록된 권한 목록</h2>
        <span class="badge">{{ roles.length }}개</span>
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
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/service/api";
import PageTitle from "@/components/PageTitle.vue";

const isSubmitting = ref(false);
const isEditMode = ref(false);
const editTargetId = ref(null);
const roles = ref([]);

const authStore = useAuthStore();

const form = ref({
  roleId: "",
  description: "",
  useYn: 1,
});

onMounted(() => {
  fetchRoles();
});

const fetchRoles = async () => {
  try {
    const response = await api.get("/roles");
    roles.value = response.data;
  } catch (error) {
    console.error("권한 목록 조회 에러:", error);
  }
};

const handleSubmit = async () => {
  if (!form.value.roleId) return;
  isSubmitting.value = true;
  try {
    const url = isEditMode.value ? `/roles/${editTargetId.value}` : "/roles";
    const method = isEditMode.value ? "put" : "post";
    const payload = {
      roleId: form.value.roleId,
      description: form.value.description,
      useYn: form.value.useYn,
      createdBy: authStore.user?.id || "SYSTEM",
      changedBy: authStore.user?.id || "SYSTEM",
    };

    await api[method](url, payload);

    alert(`권한이 성공적으로 ${isEditMode.value ? "수정" : "등록"}되었습니다.`);
    resetForm();
    await fetchRoles(); // 목록 새로고침
  } catch (error) {
    const message = error.response?.data?.message || "작업에 실패했습니다.";
    alert(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const editRole = (role) => {
  isEditMode.value = true;
  editTargetId.value = role.id;
  form.value = {
    roleId: role.roleId,
    description: role.description,
    useYn: role.useYn,
  };
  window.scrollTo(0, 0);
};

const deleteRole = async (id) => {
  if (!confirm("정말로 이 권한을 삭제하시겠습니까?")) return;
  isSubmitting.value = true;
  try {
    await api.delete(`/roles/${id}`);
    alert("성공적으로 삭제되었습니다.");
    if (isEditMode.value && editTargetId.value === id) {
      resetForm();
    }
    await fetchRoles(); // 데이터 최신화
  } catch (error) {
    const message = error.response?.data?.message || "삭제에 실패했습니다.";
    alert(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  isEditMode.value = false;
  editTargetId.value = null;
  form.value = {
    roleId: "",
    description: "",
    useYn: 1,
  };
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.icon {
  color: #8b5cf6;
  width: 1.5rem;
  height: 1.5rem;
}
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.badge {
  background-color: #f3e8ff;
  color: #7e22ce;
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
.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: #94a3b8;
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
</style>
