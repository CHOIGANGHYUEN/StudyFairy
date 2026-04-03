<template>
  <div class="app-wrapper">
    <!-- 1. Header 영역 -->
    <AppHeader />

    <!-- 2. Menu 영역 (동적 탭) -->
    <NavMenu />

    <!-- 3. Body 영역 (선택된 화면 표시 영역) -->
    <main class="app-body">
      <router-view />
    </main>

    <!-- 4. Footer 영역 -->
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from "./components/layout/AppHeader.vue";
import NavMenu from "./components/layout/NavMenu.vue";
import AppFooter from "./components/layout/AppFooter.vue";
</script>
