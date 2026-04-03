<template>
  <div class="sidebar card-section">
    <h3>테이블 목록</h3>
    <div class="mb-4">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="테이블명/모듈 검색..."
        class="form-control"
      />
    </div>
    <button @click="$emit('create')" class="btn btn-primary w-full mb-4">
      새 테이블 추가
    </button>
    <ul class="table-list">
      <li
        v-for="table in filteredTables"
        :key="table.tablen"
        @click="$emit('select', table)"
        :class="{ active: currentTableId === table.tablen }"
        class="flex justify-between items-center"
      >
        <div>
          {{ table.tablen }}
          <span class="text-xs text-gray-500">({{ table.module }})</span>
        </div>
        <span
          v-if="table.dbStatus === 'NOT_CREATED'"
          class="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold mr-1"
          title="실제 DB에 테이블 없음"
        >
          미생성
        </span>
        <span
          v-if="table.isModified"
          class="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold"
          title="변경 이력 있음"
        >
          변경됨
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  tables: { type: Array, required: true },
  currentTableId: { type: String, default: null },
});

defineEmits(["create", "select"]);

const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

const filteredTables = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return props.tables;
  return props.tables.filter(
    (t) =>
      t.tablen.toLowerCase().includes(query) ||
      t.module.toLowerCase().includes(query),
  );
});

const totalPages = computed(
  () => Math.ceil(filteredTables.value.length / itemsPerPage.value) || 1,
);

const paginatedTables = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredTables.value.slice(start, start + itemsPerPage.value);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}
</script>

<style scoped>
.sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
}
.sidebar-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}
.border-b {
  border-bottom: 1px solid var(--border-color);
}
.table-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}
.table-list li {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.table-list li:hover {
  background-color: var(--bg-color-secondary);
}
.table-list li.active {
  background-color: var(--primary-light);
  border-left: 4px solid var(--primary-color);
}
.table-list-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.table-id {
  font-weight: 700;
  color: var(--text-color-primary);
  font-size: 0.95rem;
}
.table-module {
  font-size: 0.75rem;
  color: var(--text-color-muted);
  background: var(--bg-color);
  padding: 0.1rem 0.4rem;
  border-radius: var(--border-radius-sm);
}
.table-list-badges {
  display: flex;
  gap: 0.5rem;
}
.modified-badge {
  background: #fef08a; /* Yellow */
  color: #854d0e;
}
.empty-list {
  padding: 2rem;
  text-align: center;
  color: var(--text-color-muted);
}
.pagination {
  border-top: 1px solid var(--border-color);
  background: var(--bg-color-secondary);
}
</style>
