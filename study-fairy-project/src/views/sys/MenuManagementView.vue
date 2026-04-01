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
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
      </template>
    </PageTitle>

    <MenuForm
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      v-model:formData="menuForm"
      :available-languages="availableLanguages"
      :flat-menus="flatMenus"
      @submit="handleRegisterOrUpdate"
      @reset="resetForm"
    />

    <MenuList
      :paginated-menus="paginatedMenus"
      :expanded-menus="expandedMenus"
      :current-page="currentPage"
      :total-pages="totalPages"
      @toggle="toggleMenu"
      @edit="editMenu"
      @delete="deleteMenu"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getLanguages } from "@/service/languageService";
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from "@/service/menuService";
import PageTitle from "@/components/PageTitle.vue";
import MenuForm from "@/components/sys/menu/MenuForm.vue";
import MenuList from "@/components/sys/menu/MenuList.vue";

const isSubmitting = ref(false);
const isEditMode = ref(false);
const editTargetId = ref(null);
const menuTree = ref([]);
const expandedMenus = ref([]);
const availableLanguages = ref([]);

const menuForm = ref({
  langu: "KO",
  menuId: "",
  menuNm: "",
  description: "",
  parentMenuId: "",
  path: "",
  menuLevel: 1,
  ordNum: 1,
  useYn: 1,
});

// Pagination State
const currentPage = ref(1);
const pageSize = 10;
const paginatedMenus = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return menuTree.value.slice(start, end);
});
const totalPages = computed(
  () => Math.ceil(menuTree.value.length / pageSize) || 1,
);
const handlePageChange = (page) => {
  currentPage.value = page;
};

const flatMenus = computed(() => {
  const result = [];
  const traverse = (nodes) => {
    if (!nodes || !nodes.length) return;
    for (const node of nodes) {
      const { children, ...rest } = node;
      result.push(rest);
      traverse(children);
    }
  };
  traverse(menuTree.value);
  return result;
});

const toggleMenu = (id) => {
  const idx = expandedMenus.value.indexOf(id);
  if (idx > -1) expandedMenus.value.splice(idx, 1);
  else expandedMenus.value.push(id);
};

const fetchLanguages = async () => {
  try {
    const res = await getLanguages();
    availableLanguages.value = res.data;
    if (availableLanguages.value.length > 0 && !menuForm.value.langu) {
      menuForm.value.langu = availableLanguages.value[0].langu;
    }
  } catch (error) {
    console.error("Error fetching languages:", error);
  }
};

const fetchMenus = async () => {
  try {
    const res = await getMenus();
    menuTree.value = res.data;
  } catch (error) {
    console.error("Error fetching menus:", error);
    menuTree.value = [];
  }
};

const handleRegisterOrUpdate = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      ...menuForm.value,
      parentMenuId: menuForm.value.parentMenuId || null,
    };
    if (isEditMode.value) {
      await updateMenu(editTargetId.value, payload);
    } else {
      await createMenu(payload);
    }
    alert("완료되었습니다.");
    resetForm();
    await fetchMenus();
  } catch (error) {
    const message = error.response?.data?.message || "작업에 실패했습니다.";
    alert(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const editMenu = (m) => {
  isEditMode.value = true;
  editTargetId.value = m.id;
  menuForm.value = { ...m, parentMenuId: m.parentMenuId || "" };
  window.scrollTo(0, 0);
};

const resetForm = () => {
  isEditMode.value = false;
  editTargetId.value = null;
  menuForm.value = {
    langu:
      availableLanguages.value.length > 0
        ? availableLanguages.value[0].langu
        : "KO",
    menuId: "",
    menuNm: "",
    description: "",
    parentMenuId: "",
    path: "",
    menuLevel: 1,
    ordNum: 1,
    useYn: 1,
  };
};

onMounted(() => {
  fetchLanguages();
  fetchMenus();
});
</script>

<style scoped>
/* Page-specific styles */
</style>
