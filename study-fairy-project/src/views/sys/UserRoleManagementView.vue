<template>
  <div class="admin-container">
    <UserRoleForm
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      :roles="roles"
      v-model:formData="form"
      @submit="handleSubmit"
      @reset="resetForm"
    />

    <UserRoleList
      :mappings="mappings"
      :is-submitting="isSubmitting"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-count="totalCount"
      @edit="editMapping"
      @delete="deleteMapping"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { getRoles } from "@/service/roleService";
import {
  getUserRoles,
  createUserRole,
  updateUserRole,
  deleteUserRole,
} from "@/service/userRoleService";
import UserRoleForm from "@/components/sys/userRole/UserRoleForm.vue";
import UserRoleList from "@/components/sys/userRole/UserRoleList.vue";

const authStore = useAuthStore();

// Pagination State
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const pageSize = 10;

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
    const res = await getRoles();
    roles.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchMappings = async (page = 1) => {
  try {
    const res = await getUserRoles({ page, limit: pageSize });

    if (res.data && res.data.data) {
      mappings.value = res.data.data;
      totalPages.value = res.data.totalPages || 1;
      totalCount.value = res.data.totalCount || res.data.data.length;
    } else if (Array.isArray(res.data)) {
      const allData = res.data;
      totalCount.value = allData.length;
      totalPages.value = Math.ceil(allData.length / pageSize) || 1;
      mappings.value = allData.slice((page - 1) * pageSize, page * pageSize);
    } else {
      mappings.value = [];
      totalPages.value = 1;
      totalCount.value = 0;
    }
    currentPage.value = page;
  } catch (error) {
    console.error(error);
    mappings.value = [];
    totalPages.value = 1;
    totalCount.value = 0;
  }
};

const handlePageChange = (page) => {
  fetchMappings(page);
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      ...form.value,
      createdBy: authStore.user?.userid || "SYSTEM",
      changedBy: authStore.user?.userid || "SYSTEM",
    };

    if (isEditMode.value) {
      await updateUserRole(editTargetId.value, payload);
    } else {
      await createUserRole(payload);
    }

    alert(
      `사용자-권한 매핑이 ${isEditMode.value ? "수정" : "등록"}되었습니다.`,
    );
    resetForm();
    await fetchMappings(currentPage.value);
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
    await deleteUserRole(id);
    alert("삭제되었습니다.");
    if (isEditMode.value && editTargetId.value === id) resetForm();
    await fetchMappings(currentPage.value);
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
</script>

<style scoped>
/* Page-specific layout styles can remain here */
</style>
