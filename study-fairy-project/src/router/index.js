import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import SummaryView from "../views/SummaryView.vue";
import EmptyView from "../views/EmptyView.vue"; // 새 탭용 빈 뷰 임포트

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
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
  ],
});

export default router;
