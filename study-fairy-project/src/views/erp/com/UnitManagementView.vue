<template>
  <div class="admin-container">
    <UnitToolbar @create="handleCreate" />
    <UnitList :units="units" @edit="handleEdit" @delete="handleDelete" />
    <UnitForm
      v-if="isModalOpen"
      :unit="editableUnit"
      :units="units"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from "@/services/unitService";
import UnitToolbar from "@/components/erp/com/UnitToolbar.vue";
import UnitList from "@/components/erp/com/UnitList.vue";
import UnitForm from "@/components/erp/com/UnitForm.vue";

const units = ref([]);
const isModalOpen = ref(false);
const editableUnit = ref(null);

const fetchUnits = async () => {
  try {
    const response = await getUnits();
    units.value = response.data;
  } catch (error) {
    console.error("Failed to fetch units:", error);
    alert("단위 목록을 불러오는 데 실패했습니다.");
  }
};

onMounted(fetchUnits);

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
      // Update
      await updateUnit(unitData.id, unitData);
      alert("성공적으로 수정되었습니다.");
    } else {
      // Create
      await createUnit(unitData);
      alert("성공적으로 등록되었습니다.");
    }
    closeModal();
    await fetchUnits(); // Refresh list
  } catch (error) {
    console.error("Failed to save unit:", error);
    const message = error.response?.data?.message || "저장에 실패했습니다.";
    alert(message);
  }
};

const handleDelete = async (id) => {
  if (!confirm("정말로 이 단위를 삭제하시겠습니까?")) {
    return;
  }
  try {
    await deleteUnit(id);
    alert("성공적으로 삭제되었습니다.");
    await fetchUnits(); // Refresh list
  } catch (error) {
    console.error("Failed to delete unit:", error);
    const message = error.response?.data?.message || "삭제에 실패했습니다.";
    alert(message);
  }
};
</script>
