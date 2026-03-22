import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/home/HomeView.vue";
import SummaryView from "../views/SummaryView.vue";
import EmptyView from "../views/EmptyView.vue"; // 새 탭용 빈 뷰 임포트
import MenuManagementView from "@/views/sys/MenuManagementView.vue";
import UserManagementView from "@/views/sys/UserManagementView.vue";
import LanguageManagementView from "@/views/sys/LanguageManagementView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/summary",
      name: "summary",
      component: SummaryView,
    },
    {
      // 새로운 빈 템플릿 라우트 추가
      path: "/empty",
      name: "empty",
      component: EmptyView,
    },
    {
      path: "/sys/users",
      name: "users",
      component: UserManagementView,
    },
    {
      path: "/sys/menus",
      name: "menus",
      component: MenuManagementView,
    },
    {
      path: "/sys/languages",
      name: "langu",
      component: LanguageManagementView,
    },
  ],
});

export default router;
