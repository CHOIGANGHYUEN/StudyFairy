<template>
  <nav class="app-menu">
    <ul class="tab-list">
      <li
        v-for="menu in visibleMenus"
        :key="menu.menuId"
        class="tab-item-container"
        @mouseenter="activeMenuId = menu.menuId"
        @mouseleave="resetMenus"
      >
        <router-link
          :to="menu.path || '#'"
          class="tab-link"
          active-class="active"
        >
          {{ menu.menuNm }}
          <span v-if="hasChildren(menu)" class="arrow">▼</span>
        </router-link>

        <ul
          v-if="hasChildren(menu) && activeMenuId === menu.menuId"
          class="sub-menu"
        >
          <li
            v-for="child in menu.children"
            :key="child.menuId"
            class="sub-item"
            @mouseenter="activeSubMenuId = child.menuId"
            @mouseleave="activeSubMenuId = null"
          >
            <router-link
              :to="child.path || '#'"
              class="sub-link"
              active-class="sub-active"
            >
              {{ child.menuNm }}
              <span v-if="hasChildren(child)" class="side-arrow">▶</span>
            </router-link>

            <ul
              v-if="hasChildren(child) && activeSubMenuId === child.menuId"
              class="grand-child-menu"
            >
              <li v-for="grandChild in child.children" :key="grandChild.menuId">
                <router-link
                  :to="grandChild.path || '#'"
                  class="sub-link"
                  active-class="sub-active"
                >
                  {{ grandChild.menuNm }}
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/service/api";

const allMenus = ref([]); // 전체 메뉴 원본
const userMenuIds = ref(new Set()); // 사용자가 접근 가능한 menuId 목록

const activeMenuId = ref(null);
const activeSubMenuId = ref(null);

const authStore = useAuthStore();

// 사용자의 역할(role)에 따라 필터링된 메뉴 목록
const visibleMenus = computed(() => {
  if (userMenuIds.value.size === 0) {
    return [];
  }

  const filterByPermission = (menus) => {
    // Top-down filtering: A menu must have direct permission to be shown.
    return menus
      .filter((menu) => userMenuIds.value.has(menu.menuId) && menu.useYn > 0)
      .map((menu) => ({
        ...menu,
        children: menu.children ? filterByPermission(menu.children) : [],
      }));
  };

  return filterByPermission(allMenus.value);
});

const hasChildren = (item) => item.children && item.children.length > 0;

const resetMenus = () => {
  activeMenuId.value = null;
  activeSubMenuId.value = null;
};

// 메뉴 데이터 및 권한을 불러오는 함수
const loadAuthorizedMenus = async () => {
  // 로그아웃 상태이거나 사용자 정보가 없으면 메뉴를 비웁니다.
  if (!authStore.user || !authStore.user.roles) {
    allMenus.value = [];
    userMenuIds.value.clear();
    return;
  }

  try {
    const userRoleIds = authStore.user.roles.map((r) => r.roleId);
    console.log("userRoleIds:", userRoleIds);

    if (userRoleIds.length === 0) {
      allMenus.value = [];
      userMenuIds.value.clear();
      return;
    }

    // 1. 전체 메뉴와 역할-메뉴 매핑 정보를 병렬로 가져옴
    const [menuRes, roleMenuRes] = await Promise.all([
      api.get("/menus"),
      api.get("/role-menus"),
    ]);

    allMenus.value = menuRes.data;

    // 2. 현재 사용자의 역할(roleId)에 해당하고, 매핑이 활성화(useYn > 0)된 메뉴 ID들을 필터링
    const authorizedMenuIds = new Set(
      roleMenuRes.data
        .filter((rm) => userRoleIds.includes(rm.roleId) && rm.useYn > 0)
        .map((rm) => rm.menuId),
    );
    userMenuIds.value = authorizedMenuIds;
  } catch (error) {
    console.error("권한 메뉴 로드 실패:", error);
    allMenus.value = [];
    userMenuIds.value.clear();
  }
};

// 컴포넌트 마운트 시 메뉴 로드
onMounted(loadAuthorizedMenus);

// 사용자 정보(로그인/로그아웃) 변경 시 메뉴 다시 로드
watch(
  () => authStore.user,
  loadAuthorizedMenus,
  { deep: true }, // user 객체 내부의 변경도 감지
);
</script>
