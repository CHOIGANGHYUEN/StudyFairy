import { ref, onMounted } from "vue";
import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from "@/service/unitService";
import { useToast } from "@/composables/useToast";

export function useUnitManagement() {
  const units = ref([]);
  const isModalOpen = ref(false);
  const editableUnit = ref(null);
  const toast = useToast();

  const fetchUnits = async () => {
    try {
      const response = await getUnits();
      units.value = response.data;
    } catch (error) {
      toast.error("단위 목록을 불러오는 데 실패했습니다.");
    }
  };

  const handleCreate = () => {
    editableUnit.value = null;
    isModalOpen.value = true;
  };

  const handleEdit = (unit) => {
    editableUnit.value = { ...unit };
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    editableUnit.value = null;
  };

  const handleSave = async (unitData) => {
    try {
      if (unitData.id) {
        await updateUnit(unitData.id, unitData);
      } else {
        await createUnit(unitData);
      }
      toast.success(
        unitData.id
          ? "성공적으로 수정되었습니다."
          : "성공적으로 등록되었습니다.",
      );
      closeModal();
      await fetchUnits();
    } catch (error) {
      toast.error(error.response?.data?.message || "저장에 실패했습니다.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("정말로 이 단위를 삭제하시겠습니까?")) return;
    try {
      await deleteUnit(id);
      toast.success("성공적으로 삭제되었습니다.");
      await fetchUnits();
    } catch (error) {
      toast.error(error.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  onMounted(fetchUnits);

  return {
    units,
    isModalOpen,
    editableUnit,
    handleCreate,
    handleEdit,
    closeModal,
    handleSave,
    handleDelete,
  };
}
