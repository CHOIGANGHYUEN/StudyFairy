import { createRouter, createWebHistory } from "vue-router";
import SummaryView from "../views/serv/SummaryView.vue";
import HomeView from "@/views/home/HomeView.vue";
import EmptyView from "@/views/EmptyView.vue";
import UserManagementView from "@/views/sys/UserManagementView.vue";
import MenuManagementView from "@/views/sys/MenuManagementView.vue";
import LanguageManagementView from "@/views/sys/LanguageManagementView.vue";
import MainManagementView from "@/views/sys/MainManagementView.vue";
import CodeManagementView from "@/views/sys/CodeManagementView.vue";

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
      path: "/sys",
      name: "sys",
      component: MainManagementView,
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
    {
      path: "/sys/codes",
      name: "codes",
      component: CodeManagementView,
    },
  ],
});

export default router;
