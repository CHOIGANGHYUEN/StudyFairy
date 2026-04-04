import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { getRoles } from "@/service/roleService";
import { getMenus } from "@/service/menuService";
import {
  getRoleMenus,
  createRoleMenu,
  updateRoleMenu,
  deleteRoleMenu,
} from "@/service/roleMenuService";
import { useToast } from "@/composables/useToast";

export function useMenuRoleManagement() {
  const authStore = useAuthStore();
  const toast = useToast();

  const isSubmitting = ref(false);
  const isEditMode = ref(false);
  const editTargetId = ref(null);
  const mappings = ref([]);
  const roles = ref([]);
  const menus = ref([]);
  const form = ref({ roleId: "", menuId: "", useYn: 1 });

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      roles.value = res.data;
    } catch (e) {}
  };
  const fetchMappings = async () => {
    try {
      const res = await getRoleMenus();
      mappings.value = res.data;
    } catch (e) {}
  };
  const fetchMenus = async () => {
    try {
      const res = await getMenus();
      const flatList = [];
      const traverse = (nodes, depth = 0) => {
        for (const node of nodes) {
          flatList.push({
            menuId: node.menuId,
            menuNm: (depth > 0 ? "　".repeat(depth) + "└ " : "") + node.menuNm,
          });
          if (node.children) traverse(node.children, depth + 1);
        }
      };
      traverse(res.data);
      menus.value = flatList;
    } catch (e) {}
  };

  const handleSubmit = async () => {
    isSubmitting.value = true;
    try {
      const payload = {
        ...form.value,
        createdBy: authStore.user?.id || "SYSTEM",
        changedBy: authStore.user?.id || "SYSTEM",
      };
      if (isEditMode.value) await updateRoleMenu(editTargetId.value, payload);
      else await createRoleMenu(payload);
      toast.success(`매핑이 ${isEditMode.value ? "수정" : "등록"}되었습니다.`);
      const currentRoleId = form.value.roleId;
      const wasEditMode = isEditMode.value;
      resetForm();
      if (!wasEditMode) form.value.roleId = currentRoleId;
      await fetchMappings();
    } catch (error) {
      toast.error(`오류: ${error.response?.data?.message || "작업 실패"}`);
    } finally {
      isSubmitting.value = false;
    }
  };

  const copyMapping = (item) => {
    isEditMode.value = false;
    editTargetId.value = null;
    form.value = {
      roleId: item.roleId,
      menuId: item.menuId,
      useYn: item.useYn,
    };
    window.scrollTo(0, 0);
  };
  const editMapping = (item) => {
    isEditMode.value = true;
    editTargetId.value = item.id;
    form.value = {
      roleId: item.roleId,
      menuId: item.menuId,
      useYn: item.useYn,
    };
    window.scrollTo(0, 0);
  };
  const deleteMapping = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    isSubmitting.value = true;
    try {
      await deleteRoleMenu(id);
      toast.success("삭제되었습니다.");
      if (isEditMode.value && editTargetId.value === id) resetForm();
      await fetchMappings();
    } catch (error) {
      toast.error(`오류: ${error.response?.data?.message || "삭제 실패"}`);
    } finally {
      isSubmitting.value = false;
    }
  };
  const resetForm = () => {
    isEditMode.value = false;
    editTargetId.value = null;
    form.value = { roleId: "", menuId: "", useYn: 1 };
  };

  onMounted(() => {
    fetchRoles();
    fetchMenus();
    fetchMappings();
  });

  return {
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
  };
}
