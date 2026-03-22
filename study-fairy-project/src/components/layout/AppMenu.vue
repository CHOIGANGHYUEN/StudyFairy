<template>
  <nav class="app-menu">
    <ul class="tab-list">
      <li v-for="menu in menus" :key="menu.menuId" class="tab-item-container">
        <!-- 상위 메뉴: menuNm 사용 -->
        <router-link
          :to="menu.path || '#'"
          class="tab-link"
          active-class="active"
          @mouseenter="activeMenuId = menu.menuId"
          @mouseleave="activeMenuId = null"
        >
          {{ menu.menuNm }}
          <span v-if="menu.children && menu.children.length" class="arrow"
            >▼</span
          >
        </router-link>

        <!-- 하위 메뉴 (마우스 오버 시 표시) -->
        <ul
          v-if="
            menu.children &&
            menu.children.length &&
            activeMenuId === menu.menuId
          "
          class="sub-menu"
          @mouseenter="activeMenuId = menu.menuId"
          @mouseleave="activeMenuId = null"
        >
          <li
            v-for="child in menu.children"
            :key="child.menuId"
            class="sub-item"
          >
            <router-link
              :to="child.path || '#'"
              class="sub-link"
              active-class="sub-active"
            >
              {{ child.menuNm }}
            </router-link>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted } from "vue";

const menus = ref([]);
const activeMenuId = ref(null); // 현재 마우스가 올라간 메뉴의 menuId

const fetchMenus = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/menus");
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    menus.value = data;
    console.log("메뉴 트리 로드 완료:", data);
  } catch (error) {
    console.error("메뉴 트리 로드 실패:", error);
  }
};

onMounted(() => {
  fetchMenus();
});
</script>

<style scoped>
.app-menu {
  background-color: #ffffff;
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

.tab-link {
  display: flex;
  align-items: center;
  padding: 1rem 0.5rem;
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  gap: 4px;
}

.arrow {
  font-size: 0.7rem;
  transition: transform 0.2s;
}

.tab-link.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  font-weight: 700;
}

/* 하위 메뉴 스타일 */
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
  min-width: 160px;
  z-index: 100;
}

.sub-item {
  width: 100%;
}

.sub-link {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #475569;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.sub-link:hover {
  background-color: #f1f5f9;
  color: #2563eb;
}

.sub-link.sub-active {
  color: #2563eb;
  background-color: #eff6ff;
  font-weight: 600;
}
</style>
