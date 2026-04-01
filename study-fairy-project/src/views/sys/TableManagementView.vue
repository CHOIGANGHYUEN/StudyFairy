<template>
  <div class="table-spec-manager">
    <div class="header">
      <h2>테이블 명세서 관리</h2>
      <div class="dbms-select">
        <label for="dbms">DBMS 선택:</label>
        <select id="dbms" v-model="selectedDbms" @change="generateDDL">
          <option value="MySQL">MySQL</option>
          <option value="PostgreSQL">PostgreSQL</option>
          <option value="Oracle">Oracle</option>
        </select>
      </div>
    </div>

    <div class="layout">
      <!-- Left Pane: Table List -->
      <div class="sidebar card-section">
        <h3>테이블 목록</h3>
        <button @click="createNewTable" class="btn btn-primary w-full mb-4">
          새 테이블 추가
        </button>
        <ul class="table-list">
          <li
            v-for="table in tables"
            :key="table.tablen"
            @click="selectTable(table)"
            :class="{
              active: currentTable && currentTable.tablen === table.tablen,
            }"
          >
            {{ table.tablen }}
            <span class="text-xs text-gray-500">({{ table.module }})</span>
          </li>
        </ul>
      </div>

      <!-- Right Pane: Editor -->
      <div class="editor card-section" v-if="currentTable">
        <div class="flex justify-between items-center mb-4">
          <h3>기본 정보</h3>
          <button
            @click="saveSpec"
            class="btn btn-primary"
            :disabled="isSaving"
          >
            {{ isSaving ? "저장 중..." : "명세서 저장" }}
          </button>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>테이블 명 (ID)</label>
            <input
              type="text"
              v-model="currentTable.tablen"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label>모듈 명 (Module)</label>
            <input
              type="text"
              v-model="currentTable.module"
              class="form-control"
            />
          </div>
        </div>

        <h3 class="mt-6 mb-2">컬럼(Field) 목록</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>순서</th>
                <th>컬럼명 (ID)</th>
                <th>데이터 타입</th>
                <th>길이</th>
                <th>PK 여부</th>
                <th>NULL 허용</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(field, index) in currentTable.fields" :key="index">
                <td>
                  <input
                    type="number"
                    v-model="field.fieldOrder"
                    class="w-16 text-center"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="field.fieldn"
                    class="form-control"
                  />
                </td>
                <td>
                  <select v-model="field.fieldType" class="form-control">
                    <option value="VARCHAR">VARCHAR</option>
                    <option value="INT">INT</option>
                    <option value="BIGINT">BIGINT</option>
                    <option value="DATETIME">DATETIME</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    v-model="field.fieldLength"
                    class="w-20 text-center"
                  />
                </td>
                <td>
                  <select v-model="field.fieldKey" class="form-control">
                    <option value="">일반</option>
                    <option value="PRI">PK</option>
                  </select>
                </td>
                <td>
                  <input
                    type="checkbox"
                    v-model="field.isNull"
                    :true-value="1"
                    :false-value="0"
                  />
                </td>
                <td>
                  <button
                    @click="removeField(index)"
                    class="text-red-600 font-bold"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click="addField" class="btn btn-secondary mt-2">
          + 컬럼 추가
        </button>

        <h3 class="mt-8 mb-2">생성된 DDL 스크립트</h3>
        <button @click="generateDDL" class="btn btn-secondary mb-2 text-sm">
          DDL 새로고침
        </button>
        <textarea
          v-model="generatedDDL"
          rows="10"
          class="form-control font-mono bg-slate-900 text-green-400"
          readonly
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { getTables, saveTableSpec } from "@/service/tableService";

const tables = ref([]);
const currentTable = ref(null);
const selectedDbms = ref("MySQL");
const generatedDDL = ref("");
const isSaving = ref(false);

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

function createNewTable() {
  currentTable.value = {
    tablen: "New_Table",
    module: "SYS",
    fields: [],
  };
  generateDDL();
}

function selectTable(table) {
  currentTable.value = JSON.parse(JSON.stringify(table)); // Deep copy for editing
  generateDDL();
}

function addField() {
  currentTable.value.fields.push({
    fieldOrder: currentTable.value.fields.length + 1,
    fieldn: "new_field",
    fieldType: "VARCHAR",
    fieldLength: 45,
    fieldKey: "",
    isNull: 0,
    isAutoIncrement: 0,
  });
  generateDDL();
}

function removeField(index) {
  currentTable.value.fields.splice(index, 1);
  generateDDL();
}

watch(
  () => currentTable.value,
  () => {
    if (currentTable.value) generateDDL();
  },
  { deep: true },
);

function generateDDL() {
  if (!currentTable.value) return;

  let ddl = "";
  const tb = currentTable.value;

  if (selectedDbms.value === "MySQL") {
    ddl = `CREATE TABLE ${tb.tablen} (\n`;
    let primaryKeys = [];

    tb.fields.forEach((f, idx) => {
      let line = `  ${f.fieldn} ${f.fieldType}`;
      if (["VARCHAR", "INT", "BIGINT"].includes(f.fieldType) && f.fieldLength) {
        line += `(${f.fieldLength})`;
      }
      line += f.isNull ? " NULL" : " NOT NULL";
      if (f.isAutoIncrement) line += " AUTO_INCREMENT";

      if (f.fieldKey === "PRI") primaryKeys.push(f.fieldn);

      line +=
        idx < tb.fields.length - 1 || primaryKeys.length > 0 ? ",\n" : "\n";
      ddl += line;
    });

    if (primaryKeys.length > 0) {
      ddl += `  PRIMARY KEY (${primaryKeys.join(", ")})\n`;
    }
    ddl += `);\n`;
  } else {
    ddl = `-- ${selectedDbms.value} 문법 지원 예정입니다.\n`;
  }

  generatedDDL.value = ddl;
}

async function saveSpec() {
  isSaving.value = true;
  try {
    await saveTableSpec(currentTable.value);
    alert("명세서가 성공적으로 저장되었습니다.");
    await loadTables();
  } catch (error) {
    alert("저장 중 오류가 발생했습니다.");
    console.error(error);
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}
.sidebar {
  width: 300px;
  flex-shrink: 0;
}
.editor {
  flex-grow: 1;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.table-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.table-list li {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background-color 0.2s;
}
.table-list li:hover {
  background-color: #f8fafc;
}
.table-list li.active {
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
  font-weight: bold;
}
.font-mono {
  font-family: monospace;
}
.bg-slate-900 {
  background-color: #0f172a;
  color: #4ade80;
  padding: 1rem;
  border-radius: 6px;
}
</style>
