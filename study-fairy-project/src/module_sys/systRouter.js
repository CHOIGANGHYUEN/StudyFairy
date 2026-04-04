/**
 * module_sys 전용 라우터 설정
 */
import Syst001v001 from "@/module_sys/syst001/view/syst001v001.vue";
import Syst001v002 from "@/module_sys/syst001/view/syst001v002.vue";

//import 제일 상단에 해줘
const systRouter = [
  {
    path: "/sys/syst001",
    name: "syst001-list",
    component: Syst001v001,
    meta: { title: "사용자 관리" },
  },
  {
    path: "/sys/syst001/create",
    name: "syst001-create",
    component: Syst001v002,
    meta: { title: "사용자 등록" },
  },
  {
    path: "/sys/syst001/:id",
    name: "syst001-detail",
    component: Syst001v002,
    meta: { title: "사용자 상세/수정" },
  },

  // ==========================================
  // syst003 : 메뉴 관리
  // ==========================================
  {
    path: "/sys/syst003",
    name: "syst003-list",
    component: () => import("@/module_sys/syst003/view/syst003v001.vue"),
    meta: { title: "메뉴 관리" },
  },
  {
    path: "/sys/syst003/create",
    name: "syst003-create",
    component: () => import("@/module_sys/syst003/view/syst003v002.vue"),
    meta: { title: "메뉴 등록" },
  },
  {
    path: "/sys/syst003/:id",
    name: "syst003-detail",
    component: () => import("@/module_sys/syst003/view/syst003v002.vue"),
    meta: { title: "메뉴 상세/수정" },
  },

  // ==========================================
  // syst004 : 테이블 관리
  // ==========================================
  {
    path: "/sys/syst004",
    name: "syst004-list",
    component: () => import("@/module_sys/syst004/view/syst004v001.vue"),
    meta: { title: "테이블 관리" },
  },
  {
    path: "/sys/syst004/create",
    name: "syst004-create",
    component: () => import("@/module_sys/syst004/view/syst004v002.vue"),
    meta: { title: "테이블 등록" },
  },
  {
    path: "/sys/syst004/:id",
    name: "syst004-detail",
    component: () => import("@/module_sys/syst004/view/syst004v002.vue"),
    meta: { title: "테이블 상세/수정" },
  },
];

export default systRouter;
