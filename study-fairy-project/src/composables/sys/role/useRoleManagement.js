import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole as apiDeleteRole,
} from "@/service/roleService";
import { useToast } from "@/composables/useToast";

export function useRoleManagement() {
  const isSubmitting = ref(false);
  const isEditMode = ref(false);
  const editTargetId = ref(null);
  const roles = ref([]);
  const authStore = useAuthStore();
  const toast = useToast();

  const form = ref({ roleId: "", description: "", useYn: 1 });

  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      roles.value = response.data;
    } catch (error) {
      toast.error("권한 목록 조회 에러가 발생했습니다.");
    }
  };

  const handleSubmit = async () => {
    if (!form.value.roleId) return;
    isSubmitting.value = true;
    try {
      const payload = {
        ...form.value,
        createdBy: authStore.user?.userid || "SYSTEM",
        changedBy: authStore.user?.userid || "SYSTEM",
      };
      if (isEditMode.value) await updateRole(editTargetId.value, payload);
      else await createRole(payload);
      toast.success(
        `권한이 성공적으로 ${isEditMode.value ? "수정" : "등록"}되었습니다.`,
      );
      resetForm();
      await fetchRoles();
    } catch (error) {
      toast.error(
        `오류: ${error.response?.data?.message || "작업에 실패했습니다."}`,
      );
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
    /* 삭제 기능 추가 필요 시 사용 */
  };

  const resetForm = () => {
    isEditMode.value = false;
    editTargetId.value = null;
    form.value = { roleId: "", description: "", useYn: 1 };
  };

  onMounted(fetchRoles);

  return {
    isSubmitting,
    isEditMode,
    roles,
    form,
    handleSubmit,
    editRole,
    deleteRole,
    resetForm,
  };
}
