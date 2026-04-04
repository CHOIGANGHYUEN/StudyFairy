import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/service/api";
import HomeView from "@/views/home/HomeView.vue";
import LoginView from "@/views/sys/LoginView.vue";
// ... (other imports)
import SummaryView from "@/views/serv/SummaryView.vue";
import EmptyView from "@/views/EmptyView.vue";
import UserManagementView from "@/views/sys/UserManagementView.vue";
import MenuManagementView from "@/views/sys/MenuManagementView.vue";
import LanguageManagementView from "@/views/sys/LanguageManagementView.vue";
import MainManagementView from "@/views/sys/MainManagementView.vue";
import CodeManagementView from "@/views/sys/CodeManagementView.vue";
import RoleManagementView from "@/views/sys/RoleManagementView.vue";
import UserRoleManagementView from "@/views/sys/UserRoleManagementView.vue";
import MenuRoleManagementView from "@/views/sys/MenuRoleManagementView.vue";
import RoleMainManagementView from "@/views/sys/RoleMainManagementView.vue";
import ScheduleManagementView from "@/views/sys/ScheduleManagementView.vue";
import ScheduleCalendarView from "@/views/sch/ScheduleCalendarView.vue";
import UnitManagementView from "@/views/erp/com/UnitManagementView.vue";
import CompanyManagementView from "@/views/erp/com/CompanyManagementView.vue";
import MatTypeManagementView from "@/views/erp/com/MatTypeManagementView.vue";
import MatClassManagementView from "@/views/erp/com/MatClassManagementView.vue";
import TableManagementView from "@/views/sys/TableManagementView.vue";
import TableHistoryView from "@/views/log/history/TableHistoryView.vue";
import PdfExtractView from "@/views/serv/PdfExtractView.vue";

const routes = [
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
    path: "/sch",
    name: "schedule-calendar",
    component: ScheduleCalendarView,
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
  {
    path: "/sys/roles",
    name: "roles",
    component: RoleMainManagementView,
  },
  {
    path: "/sys/roles/role",
    name: "roles-role",
    component: RoleManagementView,
  },
  {
    path: "/sys/roles/userrole",
    name: "roles-userrole",
    component: UserRoleManagementView,
  },
  {
    path: "/sys/roles/menurole",
    name: "roles-menurole",
    component: MenuRoleManagementView,
  },
  {
    path: "/sys/schedules",
    name: "schedules",
    component: ScheduleManagementView,
  },
  {
    path: "/erp/com/units",
    name: "units",
    component: UnitManagementView,
  },
  {
    path: "/erp/com/companies",
    name: "companies",
    component: CompanyManagementView,
  },
  {
    path: "/erp/com/mattypes",
    name: "mattypes",
    component: MatTypeManagementView,
  },
  {
    path: "/erp/com/matclasses",
    name: "matclasses",
    component: MatClassManagementView,
  },
  {
    path: "/sys/tables",
    name: "tables",
    component: TableManagementView,
  },
  {
    path: "/log/history/table",
    name: "table-history",
    component: TableHistoryView,
  },
  {
    path: "/pdf",
    name: "PdfExtract",
    // PdfExtractView.vue 컴포넌트의 실제 경로에 맞게 지정해주세요.
    component: PdfExtractView,
    meta: {
      requiresAuth: true, // 프로젝트 설정에 따라 인증이 필요하다면 추가
      title: "PDF 텍스트 추출", // PageTitle.vue 컴포넌트에서 활용할 폴백 타이틀
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 화면 전환 시 인증 검사
router.beforeEach(async (to) => {
  const publicPages = ["/login"];
  const authRequired = !publicPages.includes(to.path);
  const auth = useAuthStore();

  // 로그인 페이지에 접근하려는 경우
  if (to.path === "/login") {
    // 이미 로그인되어 있다면 홈으로 리디렉션
    if (auth.accessToken) {
      return "/";
    }
    // 그렇지 않으면 로그인 페이지로 진행
    return true;
  }

  // 인증이 필요한 페이지에 접근하려는 경우
  if (authRequired) {
    if (!auth.accessToken) {
      // 로그인되어 있지 않으면 로그인 페이지로 리디렉션
      auth.returnUrl = to.fullPath;
      return "/login";
    }

    // 서버에 토큰 유효성 검증 요청 (사용자 요청사항)
    try {
      // Axios 인스턴스를 사용하면 인터셉터가 토큰을 자동으로 주입하고,
      // 401 에러 발생 시 자동으로 로그아웃 처리합니다.
      await api.post("/auth/verify-token");
    } catch (error) {
      // 401 이외의 네트워크 오류 등이 발생했을 경우에 대한 방어 코드
      // api.js의 인터셉터가 401은 이미 처리했으므로, 여기서는 그 외의 에러만 잡힙니다.
      console.error("Token verification failed:", error);
      auth.logout();
      return "/login";
    }
  }

  // 그 외의 경우, 정상적으로 내비게이션 진행
  return true;
});

export default router;
