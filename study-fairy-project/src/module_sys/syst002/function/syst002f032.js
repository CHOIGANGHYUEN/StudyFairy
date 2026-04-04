import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/service/api";
import { useToast } from "@/composables/useToast";

export function useSyst002v032() {
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  const isSubmitting = ref(false);
  const form = ref({ id: null, roleId: "", menuId: "", useYn: 1 });
  const roles = ref([]);
  const menus = ref([]);

  const isCreateMode = computed(() => route.params.id === "create");
  const isViewMode = computed(() => route.query.mode === "view");
  const isEditMode = computed(
    () =>
      route.query.mode === "edit" || (!isCreateMode.value && !isViewMode.value),
  );

  const fetchOptions = async () => {
    try {
      const [resRoles, resMenus] = await Promise.all([
        api.get("/roles"),
        api.get("/menus"),
      ]);
      roles.value = resRoles.data?.data || resRoles.data || [];

      // 트리구조 메뉴를 1차원 배열로 평탄화 처리
      const flatList = [];
      const flatten = (items) => {
        items.forEach((m) => {
          flatList.push(m);
          if (m.children) flatten(m.children);
        });
      };
      flatten(resMenus.data?.data || resMenus.data || []);
      menus.value = flatList;
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    if (isCreateMode.value) return;
    try {
      const res = await api.get(`/role-menus/${route.params.id}`);
      form.value = { ...(res.data?.data || res.data) };
    } catch (error) {
      toast.error("상세 정보를 불러오는데 실패했습니다.");
      handleClose();
    }
  };

  const handleSave = async () => {
    if (isViewMode.value || !form.value.roleId || !form.value.menuId) return;
    isSubmitting.value = true;
    try {
      if (isCreateMode.value) await api.post("/role-menus", form.value);
      else await api.put(`/role-menus/${form.value.id}`, form.value);
      toast.success(isCreateMode.value ? "등록되었습니다." : "수정되었습니다.");
      handleClose();
    } catch (error) {
      toast.error("저장 처리 중 오류가 발생했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };
  const handleClose = () => router.back();
  onMounted(() => {
    fetchOptions();
    fetchData();
  });
  return {
    isCreateMode,
    isEditMode,
    isViewMode,
    isSubmitting,
    form,
    roles,
    menus,
    handleSave,
    handleClose,
  };
}
