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

    <MenuRoleForm
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      :roles="roles"
      :menus="menus"
      :form-data="form"
      @submit="handleSubmit"
      @reset="resetForm"
    />

    <MenuRoleList
      :mappings="mappings"
      :is-submitting="isSubmitting"
      @copy="copyMapping"
      @edit="editMapping"
      @delete="deleteMapping"
    />
  </div>
</template>

<script setup>
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
import PageTitle from "@/components/PageTitle.vue";
import MenuRoleForm from "@/components/sys/menuRole/MenuRoleForm.vue";
import MenuRoleList from "@/components/sys/menuRole/MenuRoleList.vue";
import { useToast } from "@/composables/useToast";

const authStore = useAuthStore();
const toast = useToast();

const isSubmitting = ref(false);
const isEditMode = ref(false);
const editTargetId = ref(null);

const mappings = ref([]);
const roles = ref([]);
const menus = ref([]);

const form = ref({
  roleId: "",
  menuId: "",
  useYn: 1,
});

onMounted(async () => {
  await fetchRoles();
  await fetchMenus();
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

// 트리 형태의 메뉴를 평탄화(Flat)하여 셀렉트 박스에서 선택하기 쉽게 만듭니다.
const fetchMenus = async () => {
  try {
    const res = await getMenus();
    const tree = res.data;
    const flatList = [];
    const traverse = (nodes, depth = 0) => {
      for (const node of nodes) {
        const prefix = depth > 0 ? "　".repeat(depth) + "└ " : "";
        flatList.push({ menuId: node.menuId, menuNm: prefix + node.menuNm });
        if (node.children && node.children.length)
          traverse(node.children, depth + 1);
      }
    };
    traverse(tree);
    menus.value = flatList;
  } catch (error) {
    console.error(error);
  }
};

const fetchMappings = async () => {
  try {
    const res = await getRoleMenus();
    mappings.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      ...form.value,
      createdBy: authStore.user?.id || "SYSTEM",
      changedBy: authStore.user?.id || "SYSTEM",
    };

    if (isEditMode.value) {
      await updateRoleMenu(editTargetId.value, payload);
    } else {
      await createRoleMenu(payload);
    }

    toast.success(`매핑이 ${isEditMode.value ? "수정" : "등록"}되었습니다.`);

    // 연속 등록을 위해 역할(Role) 선택은 초기화하지 않고 유지
    const currentRoleId = form.value.roleId;
    const wasEditMode = isEditMode.value;

    resetForm();
    if (!wasEditMode) {
      form.value.roleId = currentRoleId;
    }
    await fetchMappings();
  } catch (error) {
    const message = error.response?.data?.message || "작업 실패";
    toast.error(`오류: ${message}`);
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
  window.scrollTo(0, 0); // 폼 위치로 스크롤
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
  if (!confirm("정말 이 매핑을 삭제하시겠습니까?")) return;
  isSubmitting.value = true;
  try {
    await deleteRoleMenu(id);
    toast.success("삭제되었습니다.");
    if (isEditMode.value && editTargetId.value === id) resetForm();
    await fetchMappings();
  } catch (error) {
    const message = error.response?.data?.message || "삭제 실패";
    toast.error(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  isEditMode.value = false;
  editTargetId.value = null;
  form.value = { roleId: "", menuId: "", useYn: 1 };
};
</script>

<style scoped>
.icon {
  color: #3b82f6;
  width: 1.5rem;
  height: 1.5rem;
}
</style>
