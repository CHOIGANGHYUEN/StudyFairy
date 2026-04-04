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
import UnitToolbar from "@/components/erp/com/UnitToolbar.vue";
import UnitList from "@/components/erp/com/UnitList.vue";
import UnitForm from "@/components/erp/com/UnitForm.vue";
import { useUnitManagement } from "@/composables/erp/com/useUnitManagement";

const {
  units,
  isModalOpen,
  editableUnit,
  handleCreate,
  handleEdit,
  closeModal,
  handleSave,
  handleDelete,
} = useUnitManagement();
</script>
