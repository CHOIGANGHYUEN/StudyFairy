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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </template>
    </PageTitle>

    <!-- Form Section -->
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
              v-model="form.userId"
              placeholder="예: admin, user_01"
              required
              :disabled="isEditMode || isSubmitting"
            />
          </div>
          <div class="form-group">
            <label for="roleId">부여할 권한 (Role) *</label>
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
          :disabled="isSubmitting || !form.userId || !form.roleId"
        >
          {{
            isSubmitting ? "처리 중..." : isEditMode ? "수정하기" : "등록하기"
          }}
        </button>
      </form>
    </section>

    <!-- Table Section -->
    <section class="card-section list-section">
      <div class="card-header list-header">
        <h2 class="section-title">등록된 사용자-권한 목록</h2>
        <span class="badge">{{ mappings.length }}건</span>
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
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/service/api";
import PageTitle from "@/components/PageTitle.vue";

const authStore = useAuthStore();

const isSubmitting = ref(false);
const isEditMode = ref(false);
const editTargetId = ref(null);

const mappings = ref([]);
const roles = ref([]);

const form = ref({
  userId: "",
  roleId: "",
  useYn: 1,
});

onMounted(async () => {
  await fetchRoles();
  await fetchMappings();
});

const fetchRoles = async () => {
  try {
    const res = await api.get("/roles");
    roles.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchMappings = async () => {
  try {
    const res = await api.get("/user-roles");
    mappings.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const url = isEditMode.value
      ? `/user-roles/${editTargetId.value}`
      : "/user-roles";
    const method = isEditMode.value ? "put" : "post";
    const payload = {
      ...form.value,
      createdBy: authStore.user?.id || "SYSTEM",
      changedBy: authStore.user?.id || "SYSTEM",
    };

    await api[method](url, payload);

    alert(
      `사용자-권한 매핑이 ${isEditMode.value ? "수정" : "등록"}되었습니다.`,
    );
    resetForm();
    await fetchMappings();
  } catch (error) {
    const message = error.response?.data?.message || "작업 실패";
    alert(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const editMapping = (item) => {
  isEditMode.value = true;
  editTargetId.value = item.id;
  form.value = {
    userId: item.userId,
    roleId: item.roleId,
    useYn: item.useYn,
  };
  window.scrollTo(0, 0);
};

const deleteMapping = async (id) => {
  if (!confirm("정말 이 권한 매핑을 삭제하시겠습니까?")) return;
  isSubmitting.value = true;
  try {
    await api.delete(`/user-roles/${id}`);
    alert("삭제되었습니다.");
    if (isEditMode.value && editTargetId.value === id) resetForm();
    await fetchMappings();
  } catch (error) {
    const message = error.response?.data?.message || "삭제 실패";
    alert(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  isEditMode.value = false;
  editTargetId.value = null;
  form.value = { userId: "", roleId: "", useYn: 1 };
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.icon {
  color: #10b981;
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
.text-purple-700 {
  color: #7e22ce;
}
.text-blue-700 {
  color: #1d4ed8;
}
</style>
