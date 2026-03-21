<template>
  <nav class="app-menu">
    <ul class="tab-list">
      <li v-for="(tab, index) in tabs" :key="index" class="tab-item">
        <router-link :to="tab.path" class="tab-link" active-class="active">
          {{ tab.name }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted } from "vue";

// 탭 데이터를 저장할 반응형 변수
const tabs = ref([]);

// 백엔드에서 메뉴 목록을 가져오는 함수
const fetchMenus = async () => {
  try {
    // 백엔드 서버 주소와 포트(3000)가 맞는지 확인하세요.
    const response = await fetch("http://localhost:3000/api/menus");
    if (response.ok) {
      tabs.value = await response.json(); // 가져온 데이터를 tabs 변수에 넣음
    } else {
      console.error("메뉴 데이터를 불러오는데 실패했습니다.");
    }
  } catch (error) {
    console.error("API 연결 오류:", error);
  }
};

// 컴포넌트가 마운트(화면에 렌더링)될 때 데이터 가져오기 실행
onMounted(() => {
  fetchMenus();
});
</script>

<style scoped>
.app-menu {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 2rem;
}

.tab-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.tab-item {
  margin-bottom: -1px;
}

.tab-link {
  display: inline-block;
  padding: 1rem 0.5rem;
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}

.tab-link:hover {
  color: #334155;
}

.tab-link.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  font-weight: 700;
}
</style>
