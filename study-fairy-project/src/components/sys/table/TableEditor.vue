<template>
  <div class="editor-layout card">
    <div class="card-header flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span
          >{{ table.tablen === "New_Table" ? "새 테이블" : table.tablen }} 명세
          편집</span
        >
      </div>
      <div class="action-buttons">
        <button
          @click="$emit('open-sql')"
          class="btn btn-outline text-primary-color border-primary-light bg-primary-light"
        >
          SQL 스크립트 생성 및 실행
        </button>
        <button @click="$emit('delete')" class="btn btn-secondary">
          명세 삭제
        </button>
        <button
          @click="$emit('save')"
          class="btn btn-primary"
          :disabled="isSaving"
        >
          {{ isSaving ? "저장 중..." : "저장" }}
        </button>
      </div>
    </div>

    <div class="card-body overflow-y-auto">
      <h4 class="section-title">기본 정보</h4>
      <div class="form-grid mb-4 grid-cols-4">
        <div class="form-group">
          <label>테이블 명 (ID)</label>
          <input type="text" v-model="table.tablen" class="form-control" />
        </div>
        <div class="form-group">
          <label>논리명 (Table Name)</label>
          <input
            type="text"
            v-model="table.tablex[0].tableNm"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label>모듈 명 (Module)</label>
          <input type="text" v-model="table.module" class="form-control" />
        </div>
        <div class="form-group">
          <label>설명 (Description)</label>
          <input
            type="text"
            v-model="table.tablex[0].description"
            class="form-control"
          />
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs mb-4">
        <button
          @click="activeTab = 'fields'"
          :class="['tab-btn', { active: activeTab === 'fields' }]"
        >
          컬럼 (Fields)
        </button>
        <button
          @click="activeTab = 'indexes'"
          :class="['tab-btn', { active: activeTab === 'indexes' }]"
        >
          인덱스 (Indexes)
        </button>
      </div>

      <!-- Fields Tab -->
      <div v-if="activeTab === 'fields'" @paste="handlePaste">
        <div class="tip-box flex items-start gap-3 mb-4">
          <div class="tip-icon mt-0.5">💡</div>
          <div class="tip-content text-sm text-gray-600 leading-relaxed">
            <strong class="text-indigo-700">스마트 입력 모드 활성화됨</strong
            ><br />
            • <b>순서 변경:</b> 좌측의 그립 아이콘을 드래그하세요.<br />
            • <b>엑셀 붙여넣기:</b> 엑셀에서 데이터를 복사(Ctrl+C)한 후 이곳에서
            붙여넣기(Ctrl+V) 하세요.
            <span class="text-xs text-gray-400"
              >(물리명 | 논리명 | 타입 | 길이 | 소수 | PK | AI | Null |
              UQ)</span
            >
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table grid-table">
            <thead>
              <tr>
                <th class="col-order">순서</th>
                <th class="col-phys">물리명(ID)</th>
                <th class="col-logi">논리명(명칭)</th>
                <th class="col-type">타입</th>
                <th class="col-len">길이</th>
                <th class="col-point">소수</th>
                <th class="col-pk">PK</th>
                <th class="col-chk">AI</th>
                <th class="col-chk">Null</th>
                <th class="col-chk">UQ</th>
                <th class="col-del">삭제</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(fieldItem, index) in table.field"
                :key="index"
                draggable="true"
                @dragstart="onDragStart($event, index)"
                @dragend="onDragEnd"
                @dragover.prevent
                @drop="onDrop($event, index)"
                class="draggable-row"
              >
                <td class="text-center flex items-center justify-center gap-1">
                  <span class="drag-handle" title="드래그하여 순서 변경">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 9h8M8 15h8"
                      ></path>
                    </svg>
                  </span>
                  <span class="text-xs font-bold text-gray-400 w-4">{{
                    fieldItem.fieldOrder
                  }}</span>
                </td>
                <td>
                  <input
                    type="text"
                    v-model="fieldItem.fieldn"
                    class="grid-input font-mono text-sm"
                    placeholder="field_id"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="fieldItem.fieldx[0].fieldNm"
                    class="grid-input"
                    placeholder="논리명"
                  />
                </td>
                <td>
                  <select v-model="fieldItem.fieldType" class="grid-input">
                    <option value="VARCHAR">VARCHAR</option>
                    <option value="INT">INT</option>
                    <option value="BIGINT">BIGINT</option>
                    <option value="DATETIME">DATETIME</option>
                    <option value="DECIMAL">DECIMAL</option>
                    <option value="TEXT">TEXT</option>
                    <option value="CHAR">CHAR</option>
                  </select>
                </td>
                <td class="text-center">
                  <input
                    type="number"
                    v-model="fieldItem.fieldLength"
                    class="grid-input text-center"
                    placeholder="-"
                  />
                </td>
                <td class="text-center">
                  <input
                    type="number"
                    v-model="fieldItem.fieldPoint"
                    class="grid-input text-center"
                    placeholder="-"
                  />
                </td>
                <td>
                  <select
                    v-model="fieldItem.fieldKey"
                    class="grid-input text-center font-bold"
                    :class="{ 'text-blue-600': fieldItem.fieldKey === 'PRI' }"
                  >
                    <option value="">일반</option>
                    <option value="PRI">PK</option>
                  </select>
                </td>
                <td class="text-center">
                  <input
                    type="checkbox"
                    v-model="fieldItem.isAutoIncrement"
                    :true-value="1"
                    :false-value="0"
                    class="grid-checkbox"
                  />
                </td>
                <td class="text-center">
                  <input
                    type="checkbox"
                    v-model="fieldItem.isNull"
                    :true-value="1"
                    :false-value="0"
                    class="grid-checkbox"
                  />
                </td>
                <td class="text-center">
                  <input
                    type="checkbox"
                    v-model="fieldItem.isUnique"
                    :true-value="1"
                    :false-value="0"
                    class="grid-checkbox"
                  />
                </td>
                <td class="text-center">
                  <button
                    @click="removeField(index)"
                    class="btn-icon text-red-400 hover:text-red-600 transition-colors"
                    title="필드 삭제"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          @click="addField"
          class="btn btn-outline btn-sm mt-3 w-full border-dashed border-2 text-gray-500 hover:bg-gray-50 hover:text-primary-color"
        >
          + 새 컬럼 추가
        </button>
      </div>

      <!-- Indexes Tab -->
      <div v-if="activeTab === 'indexes'">
        <div class="tip-box flex items-start gap-3 mb-4">
          <div class="tip-icon mt-0.5">💡</div>
          <div class="tip-content text-sm text-gray-600 leading-relaxed">
            <strong class="text-indigo-700">스마트 인덱스 설정</strong><br />
            • <b>구성 컬럼 순서 변경:</b> 좌측의 그립 아이콘을 드래그하세요.
            (인덱스 효율은 컬럼 순서에 영향을 받습니다)
          </div>
        </div>

        <div
          v-for="(idx, idxIndex) in table.tableindex"
          :key="idxIndex"
          class="index-card mb-4"
        >
          <div
            class="index-header flex flex-wrap gap-4 items-center mb-3 pb-3 border-b border-gray-200"
          >
            <div class="flex items-center gap-2">
              <label class="font-bold text-sm text-gray-700 m-0"
                >인덱스 ID</label
              >
              <input
                type="text"
                v-model="idx.indexn"
                class="form-control w-40 p-1.5 text-sm font-mono"
                placeholder="idx_name"
              />
            </div>
            <div class="flex items-center gap-2">
              <label class="font-bold text-sm text-gray-700 m-0"
                >인덱스명</label
              >
              <input
                type="text"
                v-model="idx.tableindexx[0].indexNm"
                class="form-control w-40 p-1.5 text-sm"
                placeholder="인덱스 한글명"
              />
            </div>
            <label
              class="flex items-center gap-1.5 text-sm font-semibold text-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                v-model="idx.isUnique"
                :true-value="1"
                :false-value="0"
                class="w-4 h-4 rounded border-gray-300 text-primary-color focus:ring-primary-color"
              />
              Unique 인덱스
            </label>
            <button
              @click="removeIndex(idxIndex)"
              class="btn btn-sm btn-outline text-red-500 border-red-200 hover:bg-red-50 ml-auto"
            >
              인덱스 삭제
            </button>
          </div>
          <div
            class="index-fields bg-gray-50 p-4 rounded-md border border-gray-100"
          >
            <div
              class="text-xs font-bold mb-3 text-gray-500 uppercase tracking-wider"
            >
              인덱스 구성 컬럼
            </div>
            <div class="table-responsive mb-2">
              <table class="data-table grid-table bg-white">
                <thead>
                  <tr>
                    <th class="w-16 text-center">순서</th>
                    <th>대상 컬럼</th>
                    <th class="w-32 text-center">정렬</th>
                    <th class="w-16 text-center">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(ifield, fIndex) in idx.indexfield"
                    :key="fIndex"
                    draggable="true"
                    @dragstart="onIdxFieldDragStart($event, idxIndex, fIndex)"
                    @dragend="onDragEnd"
                    @dragover.prevent
                    @drop="onIdxFieldDrop($event, idxIndex, fIndex)"
                    class="draggable-row"
                  >
                    <td
                      class="text-center flex items-center justify-center gap-1"
                    >
                      <span class="drag-handle" title="드래그하여 순서 변경">
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 9h8M8 15h8"
                          ></path>
                        </svg>
                      </span>
                      <span class="text-xs font-bold text-gray-400 w-4">{{
                        fIndex + 1
                      }}</span>
                    </td>
                    <td>
                      <select
                        v-model="ifield.fieldn"
                        class="grid-input font-mono text-sm"
                      >
                        <option value="" disabled>필드 선택</option>
                        <option
                          v-for="f in table.field"
                          :key="f.fieldn"
                          :value="f.fieldn"
                        >
                          {{ f.fieldn }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <select
                        v-model="ifield.orderType"
                        class="grid-input text-center text-sm"
                      >
                        <option value="ASC">ASC</option>
                        <option value="DESC">DESC</option>
                      </select>
                    </td>
                    <td class="text-center">
                      <button
                        @click="removeIndexField(idx, fIndex)"
                        class="btn-icon text-red-400 hover:text-red-600 transition-colors"
                        title="컬럼 제외"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!idx.indexfield || idx.indexfield.length === 0">
                    <td
                      colspan="4"
                      class="text-center text-gray-400 py-4 text-sm bg-gray-50"
                    >
                      인덱스에 포함할 컬럼을 추가해주세요.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              @click="addIndexField(idx)"
              class="btn btn-sm btn-outline w-full border-dashed border-2 text-gray-500 hover:bg-gray-50 hover:text-primary-color"
            >
              + 필드 추가
            </button>
          </div>
        </div>
        <button
          @click="addIndex"
          class="btn btn-outline mt-2 w-full border-dashed border-2 text-gray-500 hover:bg-gray-50 hover:text-primary-color"
        >
          + 인덱스 추가
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from "vue";

const props = defineProps({
  table: { type: Object, required: true },
  isSaving: { type: Boolean, default: false },
});

// 방어적 코드: 전달받은 table 객체에 필수 속성이 없을 경우 초기화하여 렌더링 에러(화면 멈춤) 방지
watchEffect(() => {
  if (props.table) {
    if (!props.table.tablex || props.table.tablex.length === 0) {
      props.table.tablex = [{ langu: "KO", tableNm: "", description: "" }];
    }
    if (!props.table.field) props.table.field = [];
    if (!props.table.tableindex) props.table.tableindex = [];
  }
});

const emit = defineEmits(["open-sql", "save", "delete"]);

const activeTab = ref("fields");

// --- 드래그 앤 드롭 (순서 변경) 로직 ---
const draggedIndex = ref(null);

function onDragStart(event, index) {
  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", index);
  event.target.classList.add("dragging");
}

function onDragEnd(event) {
  event.target.classList.remove("dragging");
  draggedIndex.value = null;
  draggedIdxIndex.value = null;
  draggedIdxFieldIndex.value = null;
}

function onDrop(event, index) {
  const fromIndex = draggedIndex.value;
  if (fromIndex === null || fromIndex === index) return;

  const fields = props.table.field;
  const [movedItem] = fields.splice(fromIndex, 1);
  fields.splice(index, 0, movedItem);

  // 순서 재정렬
  fields.forEach((f, i) => (f.fieldOrder = i + 1));
}

// --- 인덱스 필드 드래그 앤 드롭 (순서 변경) 로직 ---
const draggedIdxIndex = ref(null);
const draggedIdxFieldIndex = ref(null);

function onIdxFieldDragStart(event, idxIndex, fIndex) {
  draggedIdxIndex.value = idxIndex;
  draggedIdxFieldIndex.value = fIndex;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", fIndex);
  event.target.classList.add("dragging");
}

function onIdxFieldDrop(event, targetIdxIndex, targetFIndex) {
  // 다른 인덱스 카드 간의 드래그 방지
  if (draggedIdxIndex.value !== targetIdxIndex) return;

  const fromIndex = draggedIdxFieldIndex.value;
  if (fromIndex === null || fromIndex === targetFIndex) return;

  const idx = props.table.tableindex[targetIdxIndex];
  const fields = idx.indexfield;
  const [movedItem] = fields.splice(fromIndex, 1);
  fields.splice(targetFIndex, 0, movedItem);

  // 순서 재정렬
  fields.forEach((f, i) => (f.fieldOrder = i + 1));
}

// --- 엑셀 복사/붙여넣기 로직 ---
function handlePaste(event) {
  const pasteData = (event.clipboardData || window.clipboardData).getData(
    "text",
  );
  if (!pasteData) return;

  if (!pasteData.includes("\t") && !pasteData.includes("\n")) return;

  const activeTag = document.activeElement?.tagName?.toLowerCase();
  if (
    (activeTag === "input" || activeTag === "select") &&
    !pasteData.includes("\n")
  )
    return;

  event.preventDefault();
  const rows = pasteData.split(/\r\n|\n|\r/).filter((row) => row.trim() !== "");
  if (rows.length === 0) return;

  const startIndex = props.table.field.length;

  rows.forEach((row, index) => {
    const cols = row.split("\t");
    if (cols.length >= 1) {
      props.table.field.push({
        fieldOrder: startIndex + index + 1,
        fieldn: cols[0]?.trim() || "new_field",
        fieldType: cols[2]?.trim().toUpperCase() || "VARCHAR",
        fieldLength:
          cols[3] && !isNaN(parseInt(cols[3]))
            ? parseInt(cols[3].trim())
            : null,
        fieldPoint:
          cols[4] && !isNaN(parseInt(cols[4]))
            ? parseInt(cols[4].trim())
            : null,
        fieldKey:
          cols[5]?.trim().toUpperCase() === "PK" ||
          cols[5]?.trim().toUpperCase() === "PRI"
            ? "PRI"
            : "",
        isAutoIncrement:
          cols[6]?.trim() === "1" || cols[6]?.trim().toUpperCase() === "Y"
            ? 1
            : 0,
        isNull:
          cols[7]?.trim() === "1" || cols[7]?.trim().toUpperCase() === "Y"
            ? 1
            : 0,
        isUnique:
          cols[8]?.trim() === "1" || cols[8]?.trim().toUpperCase() === "Y"
            ? 1
            : 0,
        isNonUnique: 0,
        fieldx: [
          { langu: "KO", fieldNm: cols[1]?.trim() || "", description: "" },
        ],
      });
    }
  });
}

function addField() {
  if (!props.table.field) props.table.field = [];
  props.table.field.push({
    fieldOrder: props.table.field.length + 1,
    fieldn: "new_field",
    fieldType: "VARCHAR",
    fieldLength: 45,
    fieldPoint: null,
    fieldKey: "",
    isNull: 0,
    isUnique: 0,
    isNonUnique: 0,
    isAutoIncrement: 0,
    fieldx: [{ langu: "KO", fieldNm: "", description: "" }],
  });
}

function removeField(index) {
  props.table.field.splice(index, 1);
}

function addIndex() {
  if (!props.table.tableindex) props.table.tableindex = [];
  props.table.tableindex.push({
    indexn: `idx_new_${props.table.tableindex.length + 1}`,
    isUnique: 0,
    tableindexx: [{ langu: "KO", indexNm: "", description: "" }],
    indexfield: [],
  });
}

function removeIndex(index) {
  props.table.tableindex.splice(index, 1);
}

function addIndexField(idx) {
  if (!idx.indexfield) idx.indexfield = [];
  idx.indexfield.push({
    fieldn: "",
    fieldOrder: idx.indexfield.length + 1,
    orderType: "ASC",
  });
}

function removeIndexField(idx, fieldIndex) {
  idx.indexfield.splice(fieldIndex, 1);
}
</script>

<style scoped>
/* 데이터 그리드 스타일링 (엑셀 느낌) */
.grid-table {
  border-collapse: collapse;
  width: 100%;
}
.grid-table th {
  background-color: #f8fafc;
  color: #475569;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 0.5rem;
  border: 1px solid #e2e8f0;
}
.grid-table td {
  padding: 0; /* input이 꽉 차게 */
  border: 1px solid #e2e8f0;
  position: relative;
  background: white;
}
.draggable-row:hover td {
  background-color: #f8fafc;
}

/* 그리드 내부 입력창 */
.grid-input {
  width: 100%;
  height: 100%;
  padding: 0.6rem 0.5rem;
  border: 2px solid transparent;
  background: transparent;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  outline: none;
}
.grid-input:hover {
  background: rgba(255, 255, 255, 0.5);
}
.grid-input:focus {
  border-color: var(--primary-color);
  background: white;
  z-index: 10;
  position: relative;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
select.grid-input {
  appearance: none;
  cursor: pointer;
}

/* 체크박스 정렬 */
.grid-checkbox {
  width: 1rem;
  height: 1rem;
  margin: 0 auto;
  display: block;
  cursor: pointer;
}

/* 인덱스 카드 */
.index-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
