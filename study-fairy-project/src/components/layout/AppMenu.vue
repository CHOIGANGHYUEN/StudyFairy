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

const menus = ref([]);
const activeMenuId = ref(null); // 1차 메뉴 호버 상태
const activeSubMenuId = ref(null); // 2차 메뉴 호버 상태

const authStore = useAuthStore();

// ✅ 부모가 비활성(useYn=0)이더라도 활성 자식이 있으면 부모는 보이도록 필터링 로직 수정
const visibleMenus = computed(() => {
  const filterActive = (list) => {
    return list
      .map(m => {
        // 1. 자식들을 먼저 재귀적으로 필터링
        const filteredChildren = m.children ? filterActive(m.children) : [];
        return {
          ...m,
          children: filteredChildren,
        };
      })
      .filter(m => {
        // 2. 자신(m)이 활성이거나, 필터링된 자식이 하나라도 있으면 표시
        return m.useYn === 1 || (m.children && m.children.length > 0);
      });
  };
  return filterActive(menus.value);
});

const hasChildren = (item) => item.children && item.children.length > 0;

const resetMenus = () => {
  activeMenuId.value = null;
  activeSubMenuId.value = null;
};

const fetchMenus = async () => {
  // 로그인되지 않은 상태면 메뉴를 비웁니다.
  if (!authStore.accessToken) {
    menus.value = [];
    return;
  }

  try {
    const response = await api.get("/menus");
    menus.value = response.data;
  } catch (error) {
    console.error("메뉴 트리 로드 실패:", error);
    // 인터셉터가 401을 처리하므로, 여기서는 메뉴를 비워주기만 하면 됩니다.
    menus.value = [];
  }
};

onMounted(() => fetchMenus());
watch(
  () => authStore.accessToken,
  () => fetchMenus(),
);
</script>

<style scoped>
.app-menu {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 2rem;
  position: relative;
}
.tab-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}
.tab-item-container {
  position: relative;
}

/* 공통 링크 스타일 */
.tab-link,
.sub-link {
  text-decoration: none;
  transition: all 0.2s;
}
.tab-link {
  display: flex;
  align-items: center;
  padding: 1rem 0.5rem;
  color: #64748b;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  gap: 4px;
}
.tab-link.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  font-weight: 700;
}

/* 2차 메뉴 (Dropdown) */
.sub-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem 0;
  list-style: none;
  min-width: 180px;
  z-index: 100;
}

.sub-item {
  position: relative;
} /* 소분류 기준점 */

.sub-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #475569;
  font-size: 0.9rem;
}
.sub-link:hover,
.sub-link.sub-active {
  background-color: #f1f5f9;
  color: #2563eb;
}

/* 3차 메뉴 (Fly-out) */
.grand-child-menu {
  position: absolute;
  top: 0;
  left: 100%; /* 2차 메뉴 우측에 붙임 */
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  list-style: none;
  min-width: 180px;
  z-index: 101;
  margin-left: 2px; /* 약간의 간격 */
}

.arrow,
.side-arrow {
  font-size: 0.6rem;
  color: #94a3b8;
}
</style>
