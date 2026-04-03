<template>
  <header class="page-header">
    <h1 class="page-title">
      <!-- 아이콘을 외부에서 주입할 수 있도록 slot 제공 -->
      <div class="icon-wrapper" v-if="$slots.icon">
        <slot name="icon"></slot>
      </div>
      {{ currentMenu?.menuNm || fallbackTitle }}
    </h1>

    <!-- description이 있으면 출력, 없으면 fallback용 slot 출력 -->
    <p
      v-if="currentMenu?.description"
      class="page-subtitle"
      :class="{ 'has-icon': $slots.icon }"
    >
      {{ currentMenu.description }}
    </p>
    <slot name="subtitle" v-else></slot>
  </header>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/service/api";

const route = useRoute();
const currentMenu = ref(null);
const fallbackTitle = ref("");

const loadMenuInfo = async () => {
  try {
    const res = await api.get("/menus");
    const tree = res.data;

    // 트리 구조에서 현재 라우트 경로(route.path)와 일치하는 메뉴 찾기
    const findMenuByPath = (nodes, targetPath) => {
      for (const node of nodes) {
        if (node.path && node.path === targetPath) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findMenuByPath(node.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const foundMenu = findMenuByPath(tree, route.path);

    if (foundMenu) {
      currentMenu.value = foundMenu;
    } else {
      currentMenu.value = null;
      fallbackTitle.value = route.meta.title || route.name || "페이지";
    }
  } catch (error) {
    console.error("메뉴 정보를 불러오는 데 실패했습니다.", error);
  }
};

// 컴포넌트 마운트 시 및 라우트 변경 시 메뉴 정보 로드
onMounted(loadMenuInfo);
watch(() => route.path, loadMenuInfo);
</script>
