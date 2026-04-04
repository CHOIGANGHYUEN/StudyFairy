<template>
  <div class="admin-container" style="max-width: 1500px; margin: 1rem auto">
    <TableManagementHeader
      v-model:searchLangu="searchLangu"
      v-model:selectedDbms="selectedDbms"
    />

    <div class="responsive-layout">
      <TableSidebar
        :tables="tables"
        :current-table-id="currentTable?.tablen"
        @select="selectTable"
        @create="createNewTable"
      />

      <div
        v-if="isEditorLoading"
        class="card flex justify-center items-center flex-1 editor-placeholder"
      >
        <div class="text-center text-text-color-muted">
          <p class="font-bold">데이터를 불러오는 중입니다...</p>
        </div>
      </div>

      <TableEditor
        v-else-if="currentTable"
        :table="currentTable"
        :is-saving="isSaving"
        @open-sql="openSqlModal"
        @save="saveSpec"
        @delete="deleteSpec"
      />

      <div
        v-else
        class="card flex justify-center items-center flex-1 editor-placeholder"
      >
        <div class="text-center text-text-color-muted">
          <svg
            class="icon-lg mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style="width: 4rem; height: 4rem; margin: 0 auto"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
            ></path>
          </svg>
          <p class="font-bold mt-2">
            좌측에서 테이블을 선택하거나 새 테이블을 추가하세요.
          </p>
        </div>
      </div>
    </div>

    <TableSqlModal
      v-model="showSqlModal"
      v-model:generatedDdl="generatedDDL"
      @generate="generateSqlFromModal"
      @execute="executeScript"
    />
  </div>
</template>

<script setup>
import TableManagementHeader from "@/components/sys/table/TableManagementHeader.vue";
import TableSidebar from "@/components/sys/table/TableSidebar.vue";
import TableEditor from "@/components/sys/table/TableEditor.vue";
import TableSqlModal from "@/components/sys/table/TableSqlModal.vue";

import { useTableList } from "@/composables/sys/useTableList";
import { useTableDetail } from "@/composables/sys/useTableDetail";
import { useTableSql } from "@/composables/sys/useTableSql";

const { tables, searchLangu, selectedDbms, loadTables } = useTableList();

const {
  currentTable,
  isEditorLoading,
  isSaving,
  createNewTable,
  selectTable,
  saveSpec,
  deleteSpec,
} = useTableDetail(searchLangu, loadTables);

const {
  showSqlModal,
  generatedDDL,
  openSqlModal,
  generateSqlFromModal,
  executeScript,
} = useTableSql(currentTable, selectedDbms);
</script>

<style scoped>
.responsive-layout {
  display: flex;
  gap: 1rem;
}
.editor-placeholder {
  min-height: calc(100vh - 160px);
}
@media (max-width: 1024px) {
  .responsive-layout {
    flex-direction: column;
  }
  .editor-placeholder {
    min-height: 400px;
  }
}
</style>
