<template>
  <div class="editor-layout card">
    <div class="card-header flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span>{{ table.tablen || "새 테이블" }} 명세 편집</span>
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
      <div class="form-grid mb-4" style="grid-template-columns: repeat(4, 1fr)">
        <div class="form-group">
          <label>테이블 명 (ID)</label>
          <input type="text" v-model="table.tablen" class="form-control" />
        </div>
        <div class="form-group">
          <label>논리명 (Table Name)</label>
          <input
            type="text"
            v-model="table.names[0].tableNm"
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
            v-model="table.names[0].description"
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
      <div v-if="activeTab === 'fields'">
        <div class="table-responsive">
          <table class="data-table dense-table">
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
              <tr v-for="(field, index) in table.fields" :key="index">
                <td class="text-center">
                  <input
                    type="number"
                    v-model="field.fieldOrder"
                    class="form-control dense-input text-center"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="field.fieldn"
                    class="form-control dense-input"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="field.names[0].fieldNm"
                    class="form-control dense-input"
                  />
                </td>
                <td>
                  <select
                    v-model="field.fieldType"
                    class="form-control dense-input"
                  >
                    <option value="VARCHAR">VARCHAR</option>
                    <option value="INT">INT</option>
                    <option value="BIGINT">BIGINT</option>
                    <option value="DATETIME">DATETIME</option>
                    <option value="DECIMAL">DECIMAL</option>
                  </select>
                </td>
                <td class="text-center">
                  <input
                    type="number"
                    v-model="field.fieldLength"
                    class="form-control dense-input text-center"
                  />
                </td>
                <td class="text-center">
                  <input
                    type="number"
                    v-model="field.fieldPoint"
                    class="form-control dense-input text-center"
                  />
                </td>
                <td>
                  <select
                    v-model="field.fieldKey"
                    class="form-control dense-input"
                  >
                    <option value="">일반</option>
                    <option value="PRI">PK</option>
                  </select>
                </td>
                <td class="text-center">
                  <input
                    type="checkbox"
                    v-model="field.isAutoIncrement"
                    :true-value="1"
                    :false-value="0"
                  />
                </td>
                <td class="text-center">
                  <input
                    type="checkbox"
                    v-model="field.isNull"
                    :true-value="1"
                    :false-value="0"
                  />
                </td>
                <td class="text-center">
                  <input
                    type="checkbox"
                    v-model="field.isUnique"
                    :true-value="1"
                    :false-value="0"
                  />
                </td>
                <td class="text-center">
                  <button
                    @click="removeField(index)"
                    class="btn-icon text-danger-color"
                  >
                    ✖
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click="addField" class="btn btn-outline mt-2">
          + 컬럼 추가
        </button>
      </div>

      <!-- Indexes Tab -->
      <div v-if="activeTab === 'indexes'">
        <div
          v-for="(idx, idxIndex) in table.indexes"
          :key="idxIndex"
          class="index-card mb-4"
        >
          <div
            class="flex flex-wrap gap-4 items-center mb-3"
            style="
              border-bottom: 1px solid var(--border-color);
              padding-bottom: 0.5rem;
            "
          >
            <div class="flex items-center gap-2">
              <label class="font-bold text-sm m-0">물리명</label>
              <input
                type="text"
                v-model="idx.indexn"
                class="form-control"
                style="width: 150px; padding: 0.4rem"
                placeholder="idx_name"
              />
            </div>
            <div class="flex items-center gap-2">
              <label class="font-bold text-sm m-0">논리명</label>
              <input
                type="text"
                v-model="idx.names[0].indexNm"
                class="form-control"
                style="width: 150px; padding: 0.4rem"
                placeholder="인덱스 한글명"
              />
            </div>
            <label class="flex items-center gap-1 text-sm font-semibold">
              <input
                type="checkbox"
                v-model="idx.isUnique"
                :true-value="1"
                :false-value="0"
              />
              Unique 인덱스
            </label>
            <button
              @click="removeIndex(idxIndex)"
              class="btn btn-outline text-danger-color ml-auto"
              style="border-color: var(--danger-light); padding: 0.3rem 0.6rem"
            >
              인덱스 삭제
            </button>
          </div>
          <div
            class="index-fields bg-secondary p-3"
            style="border-radius: var(--border-radius-sm)"
          >
            <div class="text-sm font-bold mb-2 text-text-color-secondary">
              포함 필드 지정
            </div>
            <div
              v-for="(ifield, fIndex) in idx.fields"
              :key="fIndex"
              class="flex gap-2 items-center mb-2"
            >
              <select
                v-model="ifield.fieldn"
                class="form-control"
                style="width: 200px; padding: 0.4rem"
              >
                <option value="" disabled>필드 선택</option>
                <option
                  v-for="f in table.fields"
                  :key="f.fieldn"
                  :value="f.fieldn"
                >
                  {{ f.fieldn }}
                </option>
              </select>
              <select
                v-model="ifield.orderType"
                class="form-control"
                style="width: 100px; padding: 0.4rem"
              >
                <option value="ASC">ASC</option>
                <option value="DESC">DESC</option>
              </select>
              <button @click="removeIndexField(idx, fIndex)" class="btn-icon">
                ✖
              </button>
            </div>
            <button
              @click="addIndexField(idx)"
              class="btn btn-outline text-sm mt-1"
              style="padding: 0.3rem 0.6rem"
            >
              + 필드 추가
            </button>
          </div>
        </div>
        <button @click="addIndex" class="btn btn-outline mt-2">
          + 인덱스 추가
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  table: { type: Object, required: true },
  isSaving: { type: Boolean, default: false },
});

const emit = defineEmits(["open-sql", "save", "delete"]);

const activeTab = ref("fields");

function addField() {
  if (!props.table.fields) props.table.fields = [];
  props.table.fields.push({
    fieldOrder: props.table.fields.length + 1,
    fieldn: "new_field",
    fieldType: "VARCHAR",
    fieldLength: 45,
    fieldPoint: null,
    fieldKey: "",
    isNull: 0,
    isUnique: 0,
    isNonUnique: 0,
    isAutoIncrement: 0,
    names: [{ langu: "KO", fieldNm: "", description: "" }],
  });
}

function removeField(index) {
  props.table.fields.splice(index, 1);
}

function addIndex() {
  if (!props.table.indexes) props.table.indexes = [];
  props.table.indexes.push({
    indexn: `idx_new_${props.table.indexes.length + 1}`,
    isUnique: 0,
    names: [{ langu: "KO", indexNm: "", description: "" }],
    fields: [],
  });
}

function removeIndex(index) {
  props.table.indexes.splice(index, 1);
}

function addIndexField(idx) {
  if (!idx.fields) idx.fields = [];
  idx.fields.push({
    fieldn: "",
    fieldOrder: idx.fields.length + 1,
    orderType: "ASC",
  });
}

function removeIndexField(idx, fieldIndex) {
  idx.fields.splice(fieldIndex, 1);
}
</script>
