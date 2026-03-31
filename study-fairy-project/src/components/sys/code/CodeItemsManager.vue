<template>
  <section class="card-section item-panel">
    <div class="card-header flex justify-between items-center">
      <h2 class="section-title">상세 코드 목록</h2>
      <button
        v-if="selectedGroupCode"
        class="btn-icon"
        @click="addNewItemRow"
        title="Add new code"
      >
        ➕
      </button>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th style="min-width: 150px">Sub Code</th>
            <th style="min-width: 200px">Description</th>
            <th style="min-width: 80px">Use</th>
            <th v-for="i in 10" :key="`th-field${i}`" style="min-width: 120px">
              {{ headForm[`fieldNm${i}`] || `Field ${i}` }}
            </th>
            <th style="min-width: 100px" class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(newItem, index) in newItems"
            :key="`new-${index}`"
            class="new-item-row"
          >
            <td>
              <input
                type="text"
                v-model="newItem.subCode"
                placeholder="New Sub Code"
              />
            </td>
            <td><input type="text" v-model="newItem.description" /></td>
            <td>
              <select v-model.number="newItem.useYn">
                <option :value="1">Y</option>
                <option :value="0">N</option>
              </select>
            </td>
            <td v-for="i in 10" :key="`new-field${i}`">
              <input type="text" v-model="newItem[`field${i}`]" />
            </td>
            <td class="text-center">
              <div class="action-buttons">
                <button @click="saveItem(newItem, index)" class="btn-icon">
                  💾
                </button>
                <button @click="removeNewItemRow(index)" class="btn-icon">
                  ❌
                </button>
              </div>
            </td>
          </tr>
          <template v-for="item in items" :key="item.id">
            <tr v-if="editingItemId === item.id" class="edit-item-row">
              <td>
                <input type="text" v-model="editedItem.subCode" disabled />
              </td>
              <td>
                <input type="text" v-model="editedItem.description" />
              </td>
              <td>
                <select v-model.number="editedItem.useYn">
                  <option :value="1">Y</option>
                  <option :value="0">N</option>
                </select>
              </td>
              <td v-for="i in 10" :key="`edit-field${i}`">
                <input type="text" v-model="editedItem[`field${i}`]" />
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button @click="saveItem(editedItem)" class="btn-icon">
                    💾
                  </button>
                  <button @click="cancelEdit()" class="btn-icon">↩️</button>
                </div>
              </td>
            </tr>
            <tr v-else>
              <td class="font-bold">{{ item.subCode }}</td>
              <td>{{ item.description }}</td>
              <td>
                <span
                  :class="[
                    'status-badge',
                    item.useYn === 1 ? 'active' : 'inactive',
                  ]"
                  >{{ item.useYn === 1 ? "Y" : "N" }}</span
                >
              </td>
              <td v-for="i in 10" :key="`view-field${i}`">
                {{ item[`field${i}`] }}
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button @click="editItem(item)" class="btn-icon">✏️</button>
                  <button @click="emit('delete-item', item)" class="btn-icon">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </template>
          <tr
            v-if="
              selectedGroupCode && items.length === 0 && newItems.length === 0
            "
          >
            <td :colspan="14" class="empty-row">상세 코드가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      class="pagination-wrapper"
      v-if="pagination.totalPages > 1 && items.length > 0"
    >
      <Pagination
        :current-page="pagination.currentPage"
        :total-pages="pagination.totalPages"
        @page-change="emit('page-change', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from "vue";
import Pagination from "@/components/common/Pagination.vue";

const props = defineProps({
  items: Array,
  headForm: Object,
  selectedGroupCode: String,
  pagination: {
    type: Object,
    default: () => ({ currentPage: 1, totalPages: 1 }),
  },
});

const emit = defineEmits(["save-item", "delete-item", "page-change"]);

const editingItemId = ref(null);
const editedItem = ref(null);
const newItems = ref([]);

watch(
  () => props.selectedGroupCode,
  () => {
    cancelEdit();
    newItems.value = [];
  },
);

const addNewItemRow = () => {
  if (editingItemId.value) cancelEdit();
  const newItem = {
    subCode: "",
    description: "",
    useYn: 1,
  };
  for (let i = 1; i <= 10; i++) {
    newItem[`field${i}`] = "";
  }
  newItems.value.push(newItem);
};

const removeNewItemRow = (index) => {
  newItems.value.splice(index, 1);
};

const editItem = (item) => {
  newItems.value = [];
  editingItemId.value = item.id;
  editedItem.value = { ...item };
};

const cancelEdit = () => {
  editingItemId.value = null;
  editedItem.value = null;
};

const saveItem = (itemData, index = null) => {
  emit("save-item", { itemData, isCreate: index !== null });
  if (index === null) {
    // if edit
    cancelEdit();
  } else {
    // if create
    newItems.value.splice(index, 1);
  }
};
</script>

<style scoped>
.table-container {
  max-height: calc(100vh - 500px);
  overflow-y: auto;
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-top: 1px solid #e2e8f0;
  border-collapse: collapse;
  min-width: max-content;
}
.data-table th {
  position: sticky;
  top: 0;
  background-color: #f8fafc;
  z-index: 10;
}
.data-table td,
.data-table th {
  padding: 0.75rem;
  vertical-align: middle;
  text-align: left;
}
.data-table td input,
.data-table td select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #94a3b8;
  border-radius: 0.375rem;
  background-color: #f8fafc;
}
.new-item-row,
.edit-item-row {
  background-color: #f0f9ff;
}
.empty-row {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 0;
  border-top: 1px solid #e2e8f0;
}
</style>
