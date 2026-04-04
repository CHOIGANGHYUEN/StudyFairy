import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { getMenus } from "@/service/menuService";
import { getRoleMenus } from "@/service/roleMenuService";

export function useMenuPermissions() {
  const allowedPaths = ref(new Set());
  const authStore = useAuthStore();

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
          if (node.path) menuIdToPath[node.menuId] = node.path;
          if (node.children && node.children.length > 0)
            traverse(node.children);
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

  return { allowedPaths };
}
