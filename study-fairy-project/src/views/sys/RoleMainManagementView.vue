<template>
  <div class="admin-container">
    <PageTitle>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </template>
    </PageTitle>

    <section class="card-section">
      <div class="menu-grid">
        <router-link
          v-if="allowedPaths.has('/sys/roles/role')"
          to="/sys/roles/role"
          class="menu-card"
        >
          <div class="menu-icon bg-purple">🛡️</div>
          <div class="menu-info">
            <h3>권한 관리</h3>
            <p>시스템에서 사용되는 권한(Role)을 조회하고 관리합니다.</p>
          </div>
        </router-link>

        <router-link
          v-if="allowedPaths.has('/sys/roles/userrole')"
          to="/sys/roles/userrole"
          class="menu-card"
        >
          <div class="menu-icon bg-green">👤</div>
          <div class="menu-info">
            <h3>사용자 권한 매핑 관리</h3>
            <p>특정 사용자에게 시스템 권한을 부여하고 관리합니다.</p>
          </div>
        </router-link>

        <router-link
          v-if="allowedPaths.has('/sys/roles/menurole')"
          to="/sys/roles/menurole"
          class="menu-card"
        >
          <div class="menu-icon bg-blue">📁</div>
          <div class="menu-info">
            <h3>권한별 메뉴 매핑 관리</h3>
            <p>특정 권한에 접근 가능한 메뉴를 연결하고 관리합니다.</p>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { getMenus } from "@/service/menuService";
import { getRoleMenus } from "@/service/roleMenuService";

const authStore = useAuthStore();
const allowedPaths = ref(new Set());

onMounted(async () => {
  if (!authStore.user || !authStore.user.roles) return;
  const userRoleIds = authStore.user.roles.map((r) => r.roleId);
  if (userRoleIds.length === 0) return;

  try {
    const [menuRes, roleMenuRes] = await Promise.all([
      getMenus(),
      getRoleMenus(),
    ]);

    const menuIdToPath = {};
    const traverse = (nodes) => {
      for (const node of nodes) {
        if (node.path) {
          menuIdToPath[node.menuId] = node.path;
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      }
    };
    traverse(menuRes.data);

    const paths = new Set();
    for (const rm of roleMenuRes.data) {
      if (userRoleIds.includes(rm.roleId) && rm.useYn > 0) {
        if (menuIdToPath[rm.menuId]) paths.add(menuIdToPath[rm.menuId]);
      }
    }
    allowedPaths.value = paths;
  } catch (error) {
    console.error("권한 목록 로드 실패:", error);
  }
});
</script>

<style scoped>
.icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #1e293b;
}
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}
.menu-card {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
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
