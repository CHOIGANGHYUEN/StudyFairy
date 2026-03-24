<template>
  <div id="app-wrapper">
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

<style>
/* CSS Reset 및 기본 폰트 적용 */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%; /* 전체 화면 채우기 */
  background-color: #f8fafc; /* Body 배경색 설정 */
}

/* Flexbox를 이용해 화면을 세로로 꽉 채우도록 레이아웃 설정 */
#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: "Pretendard", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

/* Body 영역은 남은 공간을 모두 차지하도록 flex-grow 부여 */
.app-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto; /* 내용이 길면 스크롤 */
}
</style>
