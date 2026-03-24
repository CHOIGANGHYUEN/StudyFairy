<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          환영합니다, <span class="highlight">{{ userName }}</span
          >님! 👋
        </h1>
        <p class="hero-subtitle">
          Study Fairy 관리자 대시보드에 오신 것을 환영합니다.<br />
          오늘도 요정처럼 빠르고 스마트하게 시스템을 관리해 보세요! ✨
        </p>
      </div>
      <div class="hero-illustration">
        <!-- 일러스트나 아이콘이 들어갈 자리 -->
        <div class="fairy-circle">🧚‍♀️</div>
      </div>
    </section>

    <!-- Quick Stats Section (Mock Data) -->
    <section class="stats-section">
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-blue">
          <span class="stat-icon">👥</span>
        </div>
        <div class="stat-info">
          <p class="stat-label">총 사용자</p>
          <h3 class="stat-value">1,248</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper bg-green">
          <span class="stat-icon">📚</span>
        </div>
        <div class="stat-info">
          <p class="stat-label">진행중인 학습</p>
          <h3 class="stat-value">342</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper bg-purple">
          <span class="stat-icon">⚡</span>
        </div>
        <div class="stat-info">
          <p class="stat-label">시스템 알림</p>
          <h3 class="stat-value">5</h3>
        </div>
      </div>
    </section>

    <!-- Quick Links Section -->
    <section class="quick-links-section">
      <div class="section-header">
        <h2 class="section-title">자주 찾는 메뉴</h2>
      </div>
      <div class="links-grid">
        <router-link to="/sys/users" class="link-card">
          <div class="link-icon">🧑‍💻</div>
          <span class="link-text">사용자 관리</span>
        </router-link>

        <router-link to="/sys/menus" class="link-card">
          <div class="link-icon">🗂️</div>
          <span class="link-text">메뉴 관리</span>
        </router-link>

        <router-link to="/sys/roles" class="link-card">
          <div class="link-icon">🛡️</div>
          <span class="link-text">권한 관리</span>
        </router-link>

        <router-link to="/sys/codes" class="link-card">
          <div class="link-icon">🏷️</div>
          <span class="link-text">공통 코드 관리</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";

const authStore = useAuthStore();

// 로그인한 사용자 ID를 가져옵니다. 없으면 '관리자'로 표시합니다.
const userName = computed(() => {
  return authStore.user?.userId || "관리자";
});
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Hero Section */
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
  border-radius: 1.5rem;
  padding: 3rem 4rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.highlight {
  color: #4f46e5;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.hero-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
}

.fairy-circle {
  font-size: 5rem;
  width: 120px;
  height: 120px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

.stat-icon-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
}

.bg-blue {
  background-color: #dbeafe;
  color: #2563eb;
}
.bg-green {
  background-color: #dcfce7;
  color: #16a34a;
}
.bg-purple {
  background-color: #f3e8ff;
  color: #9333ea;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

/* Quick Links Section */
.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #334155;
  margin: 0;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  text-decoration: none;
  color: #1e293b;
  transition: all 0.2s ease;
}

.link-card:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.link-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.link-text {
  font-weight: 600;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
    gap: 2rem;
  }
  .hero-title {
    font-size: 2rem;
  }
}
</style>
