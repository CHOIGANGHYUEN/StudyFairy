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

    <RoleForm
        :is-edit-mode="isEditMode"
        :is-submitting="isSubmitting"
        v-model:formData="form"
        @submit="handleSubmit"
        @reset="resetForm"
    />

    <RoleList
        :roles="roles"
        :is-submitting="isSubmitting"
        @edit="editRole"
        @delete="deleteRole"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/service/api";
import PageTitle from "@/components/PageTitle.vue";
import RoleForm from "@/components/sys/role/RoleForm.vue";
import RoleList from "@/components/sys/role/RoleList.vue";

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
      createdBy: authStore.user?.userid || "SYSTEM",
      changedBy: authStore.user?.userid || "SYSTEM",
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
</script>

<style scoped>
.icon {
  color: #8b5cf6;
}
</style>
