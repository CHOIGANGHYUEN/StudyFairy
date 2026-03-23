<template>
  <div class="management-dashboard">
    <h1>시스템 관리</h1>
    <p class="subtitle">Study Fairy 시스템의 주요 기능을 관리합니다.</p>
    <div class="card-container">
      <router-link to="/sys/users" class="card-link">
        <div class="card">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-users"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <h2 class="card-title">사용자 관리</h2>
          <p class="card-description">시스템 사용자 계정을 관리하고 권한을 설정합니다.</p>
        </div>
      </router-link>

      <router-link to="/sys/menus" class="card-link">
        <div class="card">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </div>
          <h2 class="card-title">메뉴 관리</h2>
          <p class="card-description">네비게이션 메뉴의 구조와 표시를 관리합니다.</p>
        </div>
      </router-link>

      <router-link to="/sys/languages" class="card-link">
        <div class="card">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-globe"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </div>
          <h2 class="card-title">언어 관리</h2>
          <p class="card-description">다국어 지원을 위한 언어 설정을 관리합니다.</p>
        </div>
      </router-link>

      <router-link to="/sys/codes" class="card-link">
        <div class="card">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-code"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          </div>
          <h2 class="card-title">공통 코드 관리</h2>
          <p class="card-description">시스템 전반에서 사용되는 공통 코드를 관리합니다.</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
// This component is a navigation dashboard, so no complex script is needed.
</script>

<style scoped>
.management-dashboard {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #333;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.subtitle {
  text-align: center;
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 3rem;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.card-link {
  text-decoration: none;
  color: inherit;
}

.card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.card-icon {
  margin-bottom: 1.5rem;
  color: #3b82f6;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.card-description {
  font-size: 1rem;
  color: #475569;
  line-height: 1.5;
}
</style>
