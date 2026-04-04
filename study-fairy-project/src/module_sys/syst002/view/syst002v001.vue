<template>
  <div class="admin-container">
    <PageTitle />
    <section class="card-section">
      <div class="menu-grid">
        <button class="menu-card" @click="goToMenu('/sys/syst002/roles')">
          <div class="menu-icon bg-purple">🛡️</div>
          <div class="menu-info">
            <h3>권한 관리</h3>
            <p>시스템에서 사용되는 권한(Role)을 조회하고 관리합니다.</p>
          </div>
        </button>
        <button class="menu-card" @click="goToMenu('/sys/syst002/user-roles')">
          <div class="menu-icon bg-green">👤</div>
          <div class="menu-info">
            <h3>사용자별 권한 관리</h3>
            <p>특정 사용자에게 시스템 권한을 부여하고 관리합니다.</p>
          </div>
        </button>
        <button class="menu-card" @click="goToMenu('/sys/syst002/menu-roles')">
          <div class="menu-icon bg-blue">📁</div>
          <div class="menu-info">
            <h3>메뉴별 권한 관리</h3>
            <p>특정 권한에 접근 가능한 메뉴를 연결하고 관리합니다.</p>
          </div>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { useSyst002v001 } from "../function/syst002f001";

const { goToMenu } = useSyst002v001();
</script>

<style scoped>
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}
.menu-card {
  display: flex;
  align-items: flex-start;
  text-align: left;
  padding: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  width: 100%;
}
.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}
.menu-icon {
  font-size: 1.5rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  margin-right: 1rem;
  flex-shrink: 0;
}
.bg-purple {
  background-color: #f3e8ff;
  color: #7e22ce;
}
.bg-green {
  background-color: #dcfce7;
  color: #166534;
}
.bg-blue {
  background-color: #dbeafe;
  color: #1d4ed8;
}
.menu-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}
.menu-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
}
</style>
