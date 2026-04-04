<template>
  <div class="admin-container" style="max-width: 1500px; margin: 1rem auto">
    <!-- TableManagementHeader -->
    <div
      class="page-header flex justify-between items-center mb-4 flex-wrap gap-4"
    >
      <div class="page-title">테이블 명세서 관리</div>
      <div class="flex gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <label class="font-bold text-sm text-text-color-secondary"
            >언어</label
          >
          <select
            v-model="searchLangu"
            class="form-control"
            style="width: 100px; padding: 0.4rem"
          >
            <option value="KO">KO</option>
            <option value="EN">EN</option>
          </select>
        </div>
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
    </div>

    <div class="responsive-layout">
      <!-- TableSidebar -->
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
        <button @click="createNewTable" class="btn btn-primary w-full mb-4">
          새 테이블 추가
        </button>
        <ul class="table-list">
          <li
            v-for="table in paginatedTables"
            :key="table.tablen"
            @click="selectTable(table)"
            :class="{ active: currentTable?.tablen === table.tablen }"
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
        <div
          v-if="sbTotalPages > 1"
          class="pagination flex justify-between items-center p-3 mt-auto"
        >
          <button
            @click="sbPrevPage"
            :disabled="sbCurrentPage === 1"
            class="btn btn-sm btn-outline text-xs px-2 py-1"
          >
            이전
          </button>
          <span class="text-xs font-bold"
            >{{ sbCurrentPage }} / {{ sbTotalPages }}</span
          >
          <button
            @click="sbNextPage"
            :disabled="sbCurrentPage === sbTotalPages"
            class="btn btn-sm btn-outline text-xs px-2 py-1"
          >
            다음
          </button>
        </div>
      </div>

      <div
        v-if="isEditorLoading"
        class="card flex justify-center items-center flex-1 editor-placeholder"
      >
        <div class="text-center text-text-color-muted">
          <p class="font-bold">데이터를 불러오는 중입니다...</p>
        </div>
      </div>

      <!-- TableEditor -->
      <div v-else-if="currentTable" class="editor-layout card">
        <div class="card-header flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span
              >{{
                currentTable.tablen === "New_Table"
                  ? "새 테이블"
                  : currentTable.tablen
              }}
              명세 편집</span
            >
          </div>
          <div class="action-buttons">
            <button
              @click="openSqlModal"
              class="btn btn-outline text-primary-color border-primary-light bg-primary-light"
            >
              SQL 스크립트 생성 및 실행
            </button>
            <button @click="deleteSpec" class="btn btn-secondary">
              명세 삭제
            </button>
            <button
              @click="saveSpec"
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
              <input
                type="text"
                v-model="currentTable.tablen"
                class="form-control"
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
                <strong class="text-indigo-700"
                  >스마트 입력 모드 활성화됨</strong
                ><br />
                • <b>순서 변경:</b> 좌측의 그립 아이콘을 드래그하세요.<br />
                • <b>엑셀 붙여넣기:</b> 엑셀에서 데이터를 복사(Ctrl+C)한 후
                이곳에서 붙여넣기(Ctrl+V) 하세요.
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
                    v-for="(fieldItem, index) in currentTable.field"
                    :key="index"
                    draggable="true"
                    @dragstart="onDragStart($event, index)"
                    @dragend="onDragEnd"
                    @dragover.prevent
                    @drop="onDrop($event, index)"
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
                <strong class="text-indigo-700">스마트 인덱스 설정</strong
                ><br />
                • <b>구성 컬럼 순서 변경:</b> 좌측의 그립 아이콘을 드래그하세요.
              </div>
            </div>
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
                        @dragstart="
                          onIdxFieldDragStart($event, idxIndex, fIndex)
                        "
                        @dragend="onDragEnd"
                        @dragover.prevent
                        @drop="onIdxFieldDrop($event, idxIndex, fIndex)"
                        class="draggable-row"
                      >
                        <td
                          class="text-center flex items-center justify-center gap-1"
                        >
                          <span class="drag-handle" title="드래그하여 순서 변경"
                            ><svg
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
                              ></path></svg
                          ></span>
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

    <!-- TableSqlModal -->
    <div v-if="showSqlModal" class="modal-overlay">
      <div class="modal-container sql-modal">
        <div class="modal-header">
          <h3 class="modal-title">DDL 스크립트 생성 및 실행</h3>
          <button class="btn-close" @click="showSqlModal = false">
            <svg
              class="icon-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
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
              <button @click="copyToClipboard" class="copy-btn">
                <svg
                  class="icon-xs"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  /></svg
                >복사
              </button>
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
            <svg
              class="icon-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              /></svg
            ><span
              >스크립트 직접 수정 후 실행 가능합니다. DB 구조 변경에
              주의하세요.</span
            >
          </div>
          <div class="footer-actions">
            <button @click="showSqlModal = false" class="btn btn-outline">
              닫기
            </button>
            <button
              @click="executeScript(sqlSelection)"
              class="btn btn-danger"
              :disabled="!generatedDDL"
            >
              <svg
                class="icon-sm mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                /></svg
              >DB 즉시 실행
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed, watch } from "vue";
import { useTableList } from "@/composables/sys/table/useTableList";
import { useTableDetail } from "@/composables/sys/table/useTableDetail";
import { useTableSql } from "@/composables/sys/table/useTableSql";
import { useToast } from "@/composables/useToast";

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

const searchQuery = ref("");
const sbCurrentPage = ref(1);
const sbItemsPerPage = ref(10);

const filteredTables = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return tables.value;
  return tables.value.filter(
    (t) =>
      t.tablen.toLowerCase().includes(query) ||
      t.module.toLowerCase().includes(query),
  );
});

const sbTotalPages = computed(
  () => Math.ceil(filteredTables.value.length / sbItemsPerPage.value) || 1,
);
const paginatedTables = computed(() => {
  const start = (sbCurrentPage.value - 1) * sbItemsPerPage.value;
  return filteredTables.value.slice(start, start + sbItemsPerPage.value);
});

watch(searchQuery, () => {
  sbCurrentPage.value = 1;
});
function sbNextPage() {
  if (sbCurrentPage.value < sbTotalPages.value) sbCurrentPage.value++;
}
function sbPrevPage() {
  if (sbCurrentPage.value > 1) sbCurrentPage.value--;
}

const activeTab = ref("fields");
const draggedIndex = ref(null);
const draggedIdxIndex = ref(null);
const draggedIdxFieldIndex = ref(null);

function onDragStart(event, index) {
  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = "move";
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
  const fields = currentTable.value.field;
  const [movedItem] = fields.splice(fromIndex, 1);
  fields.splice(index, 0, movedItem);
  fields.forEach((f, i) => (f.fieldOrder = i + 1));
}

function onIdxFieldDragStart(event, idxIndex, fIndex) {
  draggedIdxIndex.value = idxIndex;
  draggedIdxFieldIndex.value = fIndex;
  event.target.classList.add("dragging");
}
function onIdxFieldDrop(event, targetIdxIndex, targetFIndex) {
  if (draggedIdxIndex.value !== targetIdxIndex) return;
  const fromIndex = draggedIdxFieldIndex.value;
  if (fromIndex === null || fromIndex === targetFIndex) return;
  const fields = currentTable.value.tableindex[targetIdxIndex].indexfield;
  const [movedItem] = fields.splice(fromIndex, 1);
  fields.splice(targetFIndex, 0, movedItem);
  fields.forEach((f, i) => (f.fieldOrder = i + 1));
}

function handlePaste(event) {
  const pasteData = (event.clipboardData || window.clipboardData).getData(
    "text",
  );
  if (!pasteData || (!pasteData.includes("\t") && !pasteData.includes("\n")))
    return;
  const activeTag = document.activeElement?.tagName?.toLowerCase();
  if (
    (activeTag === "input" || activeTag === "select") &&
    !pasteData.includes("\n")
  )
    return;
  event.preventDefault();
  const rows = pasteData.split(/\r\n|\n|\r/).filter((row) => row.trim() !== "");
  if (rows.length === 0) return;
  const startIndex = currentTable.value.field.length;
  rows.forEach((row, index) => {
    const cols = row.split("\t");
    if (cols.length >= 1) {
      currentTable.value.field.push({
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
  if (!currentTable.value.field) currentTable.value.field = [];
  currentTable.value.field.push({
    fieldOrder: currentTable.value.field.length + 1,
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
  currentTable.value.field.splice(index, 1);
}
function addIndex() {
  if (!currentTable.value.tableindex) currentTable.value.tableindex = [];
  currentTable.value.tableindex.push({
    indexn: `idx_new_${currentTable.value.tableindex.length + 1}`,
    isUnique: 0,
    tableindexx: [{ langu: "KO", indexNm: "", description: "" }],
    indexfield: [],
  });
}
function removeIndex(index) {
  currentTable.value.tableindex.splice(index, 1);
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

watchEffect(() => {
  if (currentTable.value) {
    if (!currentTable.value.tablex || currentTable.value.tablex.length === 0)
      currentTable.value.tablex = [
        { langu: "KO", tableNm: "", description: "" },
      ];
    if (!currentTable.value.field) currentTable.value.field = [];
    if (!currentTable.value.tableindex) currentTable.value.tableindex = [];
  }
});

const sqlSelection = ref("CREATE_TABLE");
const toast = useToast();
watch(sqlSelection, (newVal) => generateSqlFromModal(newVal));
watch(
  () => showSqlModal.value,
  (newVal) => {
    if (newVal) generateSqlFromModal(sqlSelection.value);
  },
);
async function copyToClipboard() {
  if (!generatedDDL.value) return;
  try {
    await navigator.clipboard.writeText(generatedDDL.value);
    toast.success("스크립트가 클립보드에 복사되었습니다.");
  } catch (err) {
    console.error(err);
    toast.error("클립보드 복사에 실패했습니다.");
  }
}
</script>

<style scoped>
.responsive-layout {
  display: flex;
  gap: 1rem;
}
.editor-placeholder {
  min-height: calc(100vh - 160px);
}

.sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
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
.pagination {
  border-top: 1px solid var(--border-color);
  background: var(--bg-color-secondary);
}

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
  transition: all var(--transition-fast);
  user-select: none;
}
.segment:hover {
  color: var(--text-color-primary);
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
  box-shadow: var(--shadow-sm);
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: color 0.2s;
}
.copy-btn:hover {
  color: white;
}
.code-textarea {
  flex: 1;
  font-family: "Consolas", "Courier New", Courier, monospace;
  background-color: transparent;
  color: #a7f3d0;
  border: none;
  padding: 1.5rem;
  resize: none;
  line-height: 1.7;
  font-size: 0.9rem;
}
.code-textarea:focus {
  outline: none;
}
.custom-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.75rem;
  border-top: 1px solid var(--border-color);
  background-color: white;
}
.warning-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #b91c1c;
  font-size: 0.85rem;
  font-weight: 600;
}
.footer-actions {
  display: flex;
  gap: 0.5rem;
}
.icon-xs {
  width: 1rem;
  height: 1rem;
}
@media (max-width: 1024px) {
  .responsive-layout {
    flex-direction: column;
  }
  .editor-placeholder {
    min-height: 400px;
  }
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 400px;
  }
}
@media (max-width: 640px) {
  .segmented-control {
    flex-direction: column;
    width: 100%;
  }
  .segment {
    text-align: center;
  }
  .footer-actions {
    flex-direction: column;
    width: 100%;
  }
  .footer-actions button {
    width: 100%;
  }
  .custom-modal-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
