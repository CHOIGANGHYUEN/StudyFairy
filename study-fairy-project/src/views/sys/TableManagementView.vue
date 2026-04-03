<template>
  <div class="admin-container" style="max-width: 1500px; margin: 1rem auto">
    <div class="page-header flex justify-between items-center mb-4">
      <div class="page-title">테이블 명세서 관리</div>
      <div class="flex items-center gap-2">
        <label class="font-bold text-sm text-text-color-secondary"
          >DBMS 기준</label
        >
        <select
          v-model="selectedDbms"
          class="form-control"
          style="width: 150px; padding: 0.4rem"
        >
          <option value="MySQL">MySQL</option>
          <option value="PostgreSQL">PostgreSQL</option>
          <option value="Oracle">Oracle</option>
        </select>
      </div>
    </div>

    <div class="layout flex gap-4">
      <TableSidebar
        :tables="tables"
        :current-table-id="currentTable?.tablen"
        @select="selectTable"
        @create="createNewTable"
      />
      <TableEditor
        v-if="currentTable"
        :table="currentTable"
        :is-saving="isSaving"
        @open-sql="openSqlModal"
        @save="saveSpec"
        @delete="deleteSpec"
      />
      <div
        v-else
        class="card flex justify-center items-center flex-1"
        style="height: calc(100vh - 160px)"
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
import { ref, onMounted } from "vue";
import {
  getTables,
  saveTableSpec,
  executeTableScript,
  deleteTableSpec as apiDeleteTableSpec,
} from "@/service/tableService";
import { getTableHistories } from "@/service/tableHistoryService";

import TableSidebar from "@/components/sys/table/TableSidebar.vue";
import TableEditor from "@/components/sys/table/TableEditor.vue";
import TableSqlModal from "@/components/sys/table/TableSqlModal.vue";

const tables = ref([]);
const currentTable = ref(null);
const selectedDbms = ref("MySQL");
const generatedDDL = ref("");
const isSaving = ref(false);
const showSqlModal = ref(false);

onMounted(async () => {
  await loadTables();
});

async function loadTables() {
  try {
    const res = await getTables();
    tables.value = res.data || [];
  } catch (error) {
    console.error("테이블 목록을 불러오지 못했습니다.", error);
  }
}

function ensureTranslations(obj, defaultValues) {
  if (!obj.names || obj.names.length === 0) {
    obj.names = [{ langu: "KO", ...defaultValues }];
  } else {
    obj.names[0] = { langu: "KO", ...defaultValues, ...obj.names[0] };
  }
}

function createNewTable() {
  currentTable.value = {
    tablen: "New_Table",
    module: "SYS",
    names: [{ langu: "KO", tableNm: "", description: "" }],
    fields: [],
    indexes: [],
  };
  generatedDDL.value = "";
}

function selectTable(table) {
  const copy = JSON.parse(JSON.stringify(table));

  ensureTranslations(copy, { tableNm: "", description: "" });

  if (copy.fields) {
    copy.fields.forEach((f) => {
      ensureTranslations(f, { fieldNm: "", description: "" });
    });
  }
  if (copy.indexes) {
    copy.indexes.forEach((idx) => {
      ensureTranslations(idx, { indexNm: "", description: "" });
    });
  }

  if (copy.physicalDropFields && copy.physicalDropFields.length > 0) {
    copy.physicalDropFields.forEach((df) => {
      ensureTranslations(df, {
        fieldNm: "DB에서 삭제될 컬럼",
        description: "",
      });
      copy.fields.push(df);
    });
  }

  currentTable.value = copy;
  generatedDDL.value = "";
}

function openSqlModal() {
  showSqlModal.value = true;
}

async function generateSqlFromModal(type) {
  if (!currentTable.value) return;

  let ddl = "";
  const tb = currentTable.value;

  if (selectedDbms.value === "MySQL") {
    if (type === "DROP_TABLE") {
      ddl = `DROP TABLE IF EXISTS ${tb.tablen};\n`;
    } else if (type === "CREATE_TABLE") {
      ddl = `-- === 테이블 생성 ===\n`;
      ddl += `CREATE TABLE ${tb.tablen} (\n`;
      let primaryKeys = [];

      tb.fields.forEach((f, idx) => {
        let line = `  ${f.fieldn} ${f.fieldType}`;
        if (
          ["DECIMAL", "NUMERIC", "FLOAT", "DOUBLE"].includes(f.fieldType) &&
          f.fieldLength
        ) {
          line += `(${f.fieldLength}${f.fieldPoint ? "," + f.fieldPoint : ""})`;
        } else if (
          ["VARCHAR", "CHAR", "INT", "BIGINT"].includes(f.fieldType) &&
          f.fieldLength
        ) {
          line += `(${f.fieldLength})`;
        }
        line += f.isNull ? " NULL" : " NOT NULL";
        if (f.isAutoIncrement) line += " AUTO_INCREMENT";
        if (f.isUnique) line += " UNIQUE";
        if (f.names && f.names[0] && f.names[0].fieldNm) {
          line += ` COMMENT '${f.names[0].fieldNm}'`;
        }
        if (f.fieldKey === "PRI") primaryKeys.push(f.fieldn);
        ddl +=
          line +
          (idx < tb.fields.length - 1 || primaryKeys.length > 0 ? ",\n" : "\n");
      });

      if (primaryKeys.length > 0) {
        ddl += `  PRIMARY KEY (${primaryKeys.join(", ")})\n`;
      }
      ddl += `);\n`;

      if (tb.names && tb.names[0] && tb.names[0].tableNm) {
        ddl += `ALTER TABLE ${tb.tablen} COMMENT = '${tb.names[0].tableNm}';\n`;
      }
      ddl += "\n";
    } else if (type === "ALTER_TABLE" || type === "ALTER_INDEX") {
      let histories = [];
      try {
        // Only fetch unapplied histories! size=999 to get all unapplied changes for the table
        const res = await getTableHistories({ exactTablen: tb.tablen, isApplied: false, size: 999 });
        histories = res.rows || res.data?.rows || res.data || res || [];
        if (!Array.isArray(histories) && Array.isArray(histories.data))
          histories = histories.data;
        if (!Array.isArray(histories)) histories = [];
      } catch (e) {
        console.error("이력 조회 실패", e);
      }

      if (type === "ALTER_TABLE") {
        ddl = "-- === 테이블 수정 ===\n";
        const fieldHistories = histories.filter(
          (h) => h.targetType === "FIELD",
        );
        const latestChanges = {};
        for (const h of fieldHistories) {
          if (
            !latestChanges[h.targetName] ||
            new Date(h.changedAt || h.createdAt) >
              new Date(
                latestChanges[h.targetName].changedAt ||
                  latestChanges[h.targetName].createdAt,
              )
          ) {
            latestChanges[h.targetName] = h;
          }
        }

        let hasAlter = false;
        let pkChanged = false;

        // 1. Determine pkChanged and execute DROP COLUMNs
        for (const [fieldn, h] of Object.entries(latestChanges)) {
          if (h.actionType === "DELETE") {
            ddl += `ALTER TABLE ${tb.tablen} DROP COLUMN ${fieldn};\n`;
            hasAlter = true;
            try {
              if (JSON.parse(h.beforeValue).fieldKey === "PRI") pkChanged = true;
            } catch (e) {}
          } else if (h.actionType === "INSERT" || h.actionType === "UPDATE") {
            try {
              const f = JSON.parse(h.afterValue);
              if (h.actionType === "INSERT" && f.fieldKey === "PRI") pkChanged = true;
              if (h.actionType === "UPDATE" && h.targetColumn && h.targetColumn.includes("fieldKey")) pkChanged = true;
            } catch (e) {}
          }
        }

        // Helper for generating column definitions
        const getColDef = (f, withAi) => {
          let colDef = `${f.fieldType}`;
          if (["DECIMAL", "NUMERIC", "FLOAT", "DOUBLE"].includes(f.fieldType) && f.fieldLength) {
            colDef += `(${f.fieldLength}${f.fieldPoint ? "," + f.fieldPoint : ""})`;
          } else if (["VARCHAR", "CHAR", "INT", "BIGINT"].includes(f.fieldType) && f.fieldLength) {
            colDef += `(${f.fieldLength})`;
          }
          colDef += f.isNull ? " NULL" : " NOT NULL";
          if (withAi && f.isAutoIncrement) colDef += " AUTO_INCREMENT";
          if (f.names && f.names[0] && f.names[0].fieldNm) {
            colDef += ` COMMENT '${f.names[0].fieldNm}'`;
          }
          return colDef;
        };

        const aiFields = tb.fields.filter(f => f.isAutoIncrement);

        // 2. If PK is changing, safely strip AUTO_INCREMENT from existing AI fields first
        // This ensures DROP PRIMARY KEY won't fail due to an AI constraint.
        if (pkChanged) {
          aiFields.forEach(f => {
            const colDef = getColDef(f, false);
            ddl += `ALTER TABLE ${tb.tablen} MODIFY COLUMN ${f.fieldn} ${colDef};\n`;
            hasAlter = true;
          });
        }

        // 3. Add or Modify columns (WITHOUT AUTO_INCREMENT to avoid conflicts during PK changes)
        for (const [fieldn, h] of Object.entries(latestChanges)) {
          if (h.actionType === "INSERT" || h.actionType === "UPDATE") {
            try {
              const f = JSON.parse(h.afterValue);
              const colDef = getColDef(f, false);
              if (h.actionType === "INSERT") {
                ddl += `ALTER TABLE ${tb.tablen} ADD COLUMN ${fieldn} ${colDef};\n`;
              } else {
                // If pkChanged is true, we already stripped AI from current AI fields above.
                // We should skip generating an identical MODIFY here if it's the same field, but doing it again is safe.
                ddl += `ALTER TABLE ${tb.tablen} MODIFY COLUMN ${fieldn} ${colDef};\n`;
              }
              hasAlter = true;
            } catch (e) {}
          }
        }

        // 4. Drop and Re-add Primary Key if it changed
        if (pkChanged) {
          ddl += `ALTER TABLE ${tb.tablen} DROP PRIMARY KEY;\n`;
          const currentPks = tb.fields.filter(f => f.fieldKey === "PRI").map(f => f.fieldn);
          if (currentPks.length > 0) {
            ddl += `ALTER TABLE ${tb.tablen} ADD PRIMARY KEY (${currentPks.join(", ")});\n`;
          }
          hasAlter = true;
        }

        // 5. Safely restore or add AUTO_INCREMENT now that the PK is finalized
        aiFields.forEach(f => {
          // Add AI back if we touched it during the PK change or if it was modified in this update
          if (pkChanged || latestChanges[f.fieldn]) {
            const colDef = getColDef(f, true);
            ddl += `ALTER TABLE ${tb.tablen} MODIFY COLUMN ${f.fieldn} ${colDef};\n`;
            hasAlter = true;
          }
        });

        if (!hasAlter)
          ddl += "-- 실행되지 않은 최근 수정/삭제 기록이 없습니다.\n";
      } else if (type === "ALTER_INDEX") {
        ddl = "-- === 인덱스 변경 ===\n";
        const idxHistories = histories.filter((h) => h.targetType === "INDEX" || h.targetType === "INDEX_FIELD");
        const changedIndexNames = new Set();
        
        idxHistories.forEach(h => {
          let indexn = h.targetName;
          if (h.targetType === "INDEX_FIELD") {
             indexn = h.targetName.split('.')[0];
          }
          changedIndexNames.add(indexn);
        });

        let hasAlter = false;
        changedIndexNames.forEach(indexn => {
           const currentIdx = tb.indexes.find(i => i.indexn === indexn);
           
           // 기존 인덱스가 있다면 DROP 수행
           ddl += `DROP INDEX \`${indexn}\` ON \`${tb.tablen}\`;\n`;
           hasAlter = true;

           // 변경된 인덱스가 아직 존재한다면 (삭제된 것이 아니라면) CREATE
           if (currentIdx) {
              const uniqueStr = currentIdx.isUnique ? "UNIQUE " : "";
              const fieldsStr = (currentIdx.fields || [])
                .sort((a, b) => (a.fieldOrder || 0) - (b.fieldOrder || 0))
                .map((f) => `\`${f.fieldn}\``)
                .filter((f) => f)
                .join(", ");
              if (fieldsStr) {
                ddl += `CREATE ${uniqueStr}INDEX \`${indexn}\` ON \`${tb.tablen}\` (${fieldsStr});\n`;
              }
           }
        });

        if (!hasAlter)
          ddl += "-- 실행되지 않은 최근 인덱스 변경 기록이 없습니다.\n";
      }
    }
  } else {
    ddl = `-- ${selectedDbms.value} 문법 지원 예정입니다.\n`;
  }

  generatedDDL.value = ddl;
}

async function saveSpec() {
  isSaving.value = true;
  try {
    const payload = JSON.parse(JSON.stringify(currentTable.value));
    // 물리 DB 연동/DROP용으로만 쓰인 가상 항목들과 DROP을 확정한 항목을 명세서 저장에서 제외함
    // -> 백엔드로 전송되지 않으므로 sysFields에서 완전히 물리적으로 삭제됨.
    payload.fields = payload.fields.filter(
      (f) => f.dbAction !== "DROP" && !f.isPhysicalOnly,
    );

    await saveTableSpec(payload);
    alert("명세서가 성공적으로 저장되었습니다.");
    await loadTables();
  } catch (error) {
    alert("저장 중 오류가 발생했습니다.");
    console.error(error);
  } finally {
    isSaving.value = false;
  }
}
async function deleteSpec() {
  if (!currentTable.value || !currentTable.value.tablen) return;
  if (
    !confirm(
      `정말 '${currentTable.value.tablen}' 명세서를 삭제하시겠습니까?\n(DB의 실제 테이블은 유지되며 명세서만 삭제됩니다)`,
    )
  )
    return;

  try {
    await apiDeleteTableSpec(currentTable.value.tablen);
    alert("명세서가 삭제되었습니다.");
    currentTable.value = null;
    await loadTables();
  } catch (error) {
    alert("삭제 중 오류가 발생했습니다.");
    console.error(error);
  }
}

async function executeScript() {
  if (!generatedDDL.value) return;
  if (
    !confirm(
      "정말 이 스크립트를 DB에 실행하시겠습니까?\n주의: 실제 DB의 테이블이나 구조가 변경됩니다.",
    )
  )
    return;

  try {
    await executeTableScript({
      tablen: currentTable.value.tablen,
      script: generatedDDL.value,
    });
    alert("스크립트가 성공적으로 실행되어 DB에 반영되었습니다.");
  } catch (error) {
    alert(
      "스크립트 실행 중 오류가 발생했습니다.\n" +
        (error.response?.data?.message || error.message),
    );
  }
}
</script>
