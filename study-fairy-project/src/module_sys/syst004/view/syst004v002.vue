<template>
  <div class="admin-container list-layout max-w-1500">
    <PageTitle />

    <!-- 상단 고정 영역: 기본 정보 -->
    <section class="card-section mb-4 shrink-0">
      <div class="card-header flex justify-between items-center">
        <div class="flex items-center gap-2">
          <h2 class="section-title m-0">
            {{
              currentTable.tablen === "New_Table"
                ? "새 테이블"
                : currentTable.tablen
            }}
            명세 편집
          </h2>
        </div>
        <div class="action-buttons">
          <button @click="handleClose" class="btn btn-secondary">
            목록으로
          </button>
          <button
            @click="openSqlModal"
            class="btn btn-outline text-primary-color border-primary-light bg-primary-light"
          >
            SQL 스크립트 생성 및 실행
          </button>
          <button
            v-if="!isCreateMode"
            @click="handleDelete"
            class="btn btn-danger"
          >
            명세 삭제
          </button>
          <button
            @click="handleSave"
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "저장 중..." : "저장" }}
          </button>
        </div>
      </div>

      <div class="card-body pb-0">
        <div class="form-grid mb-4 grid-cols-4">
          <div class="form-group">
            <label>테이블 명 (ID)</label>
            <input
              type="text"
              v-model="currentTable.tablen"
              class="form-control"
              :disabled="!isCreateMode"
            />
          </div>
          <div class="form-group">
            <label>논리명 (Table Name)</label>
            <input
              type="text"
              v-model="currentTable.tablex[0].tableNm"
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
          <div class="form-group">
            <label>설명 (Description)</label>
            <input
              type="text"
              v-model="currentTable.tablex[0].description"
              class="form-control"
            />
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
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
      </div>
    </section>

    <!-- 하단 꽉 차는 영역: 에디터 -->
    <section class="result-area mb-0 min-h-400">
      <!-- Fields Tab -->
      <div
        v-if="activeTab === 'fields'"
        class="flex-1 flex flex-col min-h-0"
        @paste="handlePaste"
      >
        <div class="result-header shrink-0">
          <div class="tip-box tip-box-plain flex items-start gap-3 m-0 w-full">
            <div class="tip-icon mt-0.5">💡</div>
            <div class="tip-content text-sm text-gray-600 leading-relaxed">
              <strong class="text-indigo-700">스마트 입력 모드 활성화됨</strong
              ><br />
              • <b>순서 변경:</b> 좌측의 그립 아이콘을 드래그하세요.<br />
              • <b>엑셀 붙여넣기:</b> 엑셀에서 데이터를 복사한 후 이곳에서
              붙여넣기(Ctrl+V) 하세요.
              <span class="text-xs text-gray-400"
                >(물리명 | 논리명 | 타입 | 길이 | 소수 | PK | AI | Null |
                UQ)</span
              >
            </div>
          </div>
        </div>

        <div class="result-table-container">
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
                v-for="(fieldItem, index) in currentTable.field"
                :key="index"
                draggable="true"
                @dragstart="onDragStart($event, index)"
                @dragend="onDragEnd"
                @dragover.prevent
                @drop="onDrop($event, index)"
                class="draggable-row"
              >
                <td class="text-center flex items-center justify-center gap-1">
                  <span class="drag-handle" title="드래그하여 순서 변경"
                    >☰</span
                  >
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
                    :class="{
                      'text-blue-600': fieldItem.fieldKey === 'PRI',
                    }"
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
                    class="btn-icon text-red-400"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-3 border-t bg-white shrink-0">
          <button
            @click="addField"
            class="btn btn-outline btn-sm w-full border-dashed border-2 text-gray-500 hover:bg-gray-50 hover:text-primary-color"
          >
            + 새 컬럼 추가
          </button>
        </div>
      </div>

      <!-- Indexes Tab -->
      <div v-if="activeTab === 'indexes'" class="flex-1 flex flex-col min-h-0">
        <div class="result-header shrink-0">
          <div class="tip-box tip-box-plain flex items-start gap-3 m-0 w-full">
            <div class="tip-icon mt-0.5">💡</div>
            <div class="tip-content text-sm text-gray-600 leading-relaxed">
              <strong class="text-indigo-700">스마트 인덱스 설정</strong><br />
              • <b>구성 컬럼 순서 변경:</b> 좌측의 그립 아이콘을 드래그하세요.
              (인덱스 효율은 컬럼 순서에 영향을 받습니다)
            </div>
          </div>
        </div>

        <div class="result-table-container p-4">
          <div
            v-for="(idx, idxIndex) in currentTable.tableindex"
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
                  class="w-4 h-4 rounded"
                />
                Unique 인덱스
              </label>
              <button
                @click="removeIndex(idxIndex)"
                class="btn btn-sm btn-outline text-red-500 ml-auto"
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
              <table class="data-table grid-table bg-white mb-2">
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
                      <span class="drag-handle">☰</span
                      ><span class="text-xs font-bold text-gray-400 w-4">{{
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
                          v-for="f in currentTable.field"
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
                        class="btn-icon text-red-400"
                      >
                        ✕
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
              <button
                @click="addIndexField(idx)"
                class="btn btn-sm btn-outline w-full border-dashed border-2 text-gray-500"
              >
                + 필드 추가
              </button>
            </div>
          </div>
        </div>

        <div class="p-3 border-t bg-white shrink-0">
          <button
            @click="addIndex"
            class="btn btn-outline w-full border-dashed border-2 text-gray-500 hover:bg-gray-50 hover:text-primary-color"
          >
            + 인덱스 추가
          </button>
        </div>
      </div>
    </section>

    <!-- SQL Modal -->
    <div
      v-if="showSqlModal"
      class="modal-overlay"
      @click.self="showSqlModal = false"
    >
      <div class="modal-container sql-modal">
        <div class="modal-header">
          <h3 class="modal-title">DDL 스크립트 생성 및 실행</h3>
          <button class="btn-close" @click="showSqlModal = false">✕</button>
        </div>
        <div class="modal-body custom-modal-body">
          <div class="options-bar">
            <div class="segmented-control">
              <label
                :class="[
                  'segment',
                  { active: sqlSelection === 'CREATE_TABLE' },
                ]"
                ><input
                  type="radio"
                  v-model="sqlSelection"
                  value="CREATE_TABLE"
                  class="hidden"
                />테이블 생성</label
              >
              <label
                :class="['segment', { active: sqlSelection === 'ALTER_TABLE' }]"
                ><input
                  type="radio"
                  v-model="sqlSelection"
                  value="ALTER_TABLE"
                  class="hidden"
                />컬럼 수정</label
              >
              <label
                :class="['segment', { active: sqlSelection === 'ALTER_INDEX' }]"
                ><input
                  type="radio"
                  v-model="sqlSelection"
                  value="ALTER_INDEX"
                  class="hidden"
                />인덱스 변경</label
              >
              <label
                :class="['segment', { active: sqlSelection === 'DROP_TABLE' }]"
                ><input
                  type="radio"
                  v-model="sqlSelection"
                  value="DROP_TABLE"
                  class="hidden"
                />테이블 삭제</label
              >
            </div>
          </div>
          <div class="editor-wrapper">
            <div class="editor-toolbar">
              <div class="mac-dots">
                <div class="mac-dot red"></div>
                <div class="mac-dot yellow"></div>
                <div class="mac-dot green"></div>
                <span class="filename">generated_script.sql</span>
              </div>
              <button @click="copyToClipboard" class="copy-btn">복사</button>
            </div>
            <textarea
              v-model="generatedDDL"
              class="code-textarea flex-1"
              placeholder="생성된 DDL 스크립트가 없습니다."
              spellcheck="false"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer custom-modal-footer">
          <div class="warning-msg">
            <span
              >스크립트 직접 수정 후 실행 가능합니다. DB 구조 변경에
              주의하세요.</span
            >
          </div>
          <div class="footer-actions">
            <button @click="showSqlModal = false" class="btn btn-outline">
              닫기
            </button>
            <button
              @click="handleExecuteScript"
              class="btn btn-danger"
              :disabled="!generatedDDL"
            >
              DB 즉시 실행
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { useSyst004v002 } from "../function/syst004f002";

const {
  isCreateMode,
  isSubmitting,
  currentTable,
  activeTab,
  showSqlModal,
  sqlSelection,
  generatedDDL,
  openSqlModal,
  handleExecuteScript,
  copyToClipboard,
  handleSave,
  handleDelete,
  handleClose,
  addField,
  removeField,
  addIndex,
  removeIndex,
  addIndexField,
  removeIndexField,
  handlePaste,
  onDragStart,
  onDragEnd,
  onDrop,
  onIdxFieldDragStart,
  onIdxFieldDrop,
} = useSyst004v002();
</script>

<style scoped>
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
  padding: 0;
  border: 1px solid #e2e8f0;
  position: relative;
  background: white;
}
.draggable-row:hover td {
  background-color: #f8fafc;
}
.grid-input {
  width: 100%;
  height: 100%;
  padding: 0.6rem 0.5rem;
  border: 2px solid transparent;
  background: transparent;
  font-size: 0.85rem;
  outline: none;
}
.grid-input:focus {
  border-color: var(--primary-color);
  background: white;
  z-index: 10;
  position: relative;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.grid-checkbox {
  width: 1rem;
  height: 1rem;
  margin: 0 auto;
  display: block;
  cursor: pointer;
}
.index-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* SQL Modal Styles */
.sql-modal {
  max-width: 900px !important;
  width: 95vw;
  height: 80vh;
  display: flex;
  flex-direction: column;
}
.custom-modal-body {
  display: flex;
  flex-direction: column;
  padding: 0;
  background-color: var(--bg-color);
  flex: 1;
  overflow: hidden;
}
.options-bar {
  background-color: white;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}
.segmented-control {
  display: inline-flex;
  background-color: var(--bg-color-secondary);
  padding: 0.3rem;
  border-radius: 10px;
  gap: 0.25rem;
}
.segment {
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
}
.segment.active {
  background-color: white;
  color: var(--primary-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #334155;
  background-color: #0f172a;
}
.editor-toolbar {
  background-color: #1e293b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #334155;
}
.mac-dots {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.mac-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.mac-dot.red {
  background-color: #f87171;
}
.mac-dot.yellow {
  background-color: #facc15;
}
.mac-dot.green {
  background-color: #4ade80;
}
.filename {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  font-family: monospace;
  color: #94a3b8;
}
.copy-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}
.code-textarea {
  flex: 1;
  font-family: "Consolas", monospace;
  background-color: transparent;
  color: #a7f3d0;
  border: none;
  padding: 1.5rem;
  resize: none;
}
.custom-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.75rem;
  border-top: 1px solid var(--border-color);
  background-color: white;
}
</style>
