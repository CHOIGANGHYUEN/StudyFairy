<template>
  <div class="admin-container">
    <div class="page-header justify-between">
      <PageTitle title="단위 관리" />
      <button @click="handleCreate" class="btn btn-primary">
        새 단위 등록
      </button>
    </div>

    <!-- 단위 목록 (기존 UnitList) -->
    <div class="card">
      <div class="card-body">
        <table class="data-table">
          <thead>
            <tr>
              <th>단위 ID</th>
              <th>단위명</th>
              <th>기본 단위 여부</th>
              <th>기본 단위 ID</th>
              <th>변환 계수</th>
              <th>사용 여부</th>
              <th>정렬 순서</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="units.length === 0">
              <td colspan="8" class="text-center">데이터가 없습니다.</td>
            </tr>
            <tr v-for="unit in units" :key="unit.id">
              <td>{{ unit.unit }}</td>
              <td>{{ unit.unitNm }}</td>
              <td>{{ unit.baseUnitYn ? "Yes" : "No" }}</td>
              <td>{{ unit.baseUnit }}</td>
              <td>{{ unit.convRate }}</td>
              <td>{{ unit.useYn ? "Yes" : "No" }}</td>
              <td>{{ unit.dispOrd }}</td>
              <td class="action-buttons">
                <button @click="handleEdit(unit)" class="btn-icon">✏️</button>
                <button @click="handleDelete(unit.id)" class="btn-icon">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 단위 등록/수정 모달 (기존 UnitForm) -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ isEditing ? "단위 수정" : "새 단위 등록" }}
          </h3>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitUnitForm" class="form-grid">
            <div class="form-group">
              <label for="unit">단위 ID</label>
              <input type="text" id="unit" v-model="unitForm.unit" required />
            </div>
            <div class="form-group">
              <label for="unitNm">단위명</label>
              <input
                type="text"
                id="unitNm"
                v-model="unitForm.unitNm"
                required
              />
            </div>
            <div class="form-group">
              <label>기본 단위 여부</label>
              <div class="flex gap-4">
                <label class="items-center">
                  <input
                    type="radio"
                    v-model="unitForm.baseUnitYn"
                    :value="1"
                  />
                  Yes
                </label>
                <label class="items-center">
                  <input
                    type="radio"
                    v-model="unitForm.baseUnitYn"
                    :value="0"
                  />
                  No
                </label>
              </div>
            </div>
            <div class="form-group">
              <label for="baseUnit">기본 단위 ID</label>
              <select
                id="baseUnit"
                v-model="unitForm.baseUnit"
                :disabled="unitForm.baseUnitYn == 1"
              >
                <option value="">없음</option>
                <option
                  v-for="baseUnit in baseUnits"
                  :key="baseUnit.unit"
                  :value="baseUnit.unit"
                >
                  {{ baseUnit.unitNm }} ({{ baseUnit.unit }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="convRate">변환 계수</label>
              <input
                type="number"
                step="0.00001"
                id="convRate"
                v-model="unitForm.convRate"
                :disabled="unitForm.baseUnitYn == 1"
              />
            </div>
            <div class="form-group">
              <label for="dispOrd">정렬 순서</label>
              <input type="number" id="dispOrd" v-model="unitForm.dispOrd" />
            </div>
            <div class="form-group full-width">
              <label>사용 여부</label>
              <label class="items-center">
                <input
                  type="checkbox"
                  v-model="unitForm.useYn"
                  true-value="1"
                  false-value="0"
                />
                사용
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" type="button" class="btn btn-secondary">
            취소
          </button>
          <button @click="submitUnitForm" type="submit" class="btn btn-primary">
            {{ isEditing ? "수정" : "등록" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import PageTitle from "@/components/PageTitle.vue";
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

const unitForm = ref({
  id: null,
  unit: "",
  unitNm: "",
  baseUnitYn: 1,
  baseUnit: null,
  convRate: 1.0,
  useYn: "1",
  dispOrd: 10,
});

const isEditing = computed(() => !!editableUnit.value);
const baseUnits = computed(() => units.value.filter((u) => u.baseUnitYn === 1));

watch(
  editableUnit,
  (newUnit) => {
    if (newUnit) unitForm.value = { ...newUnit };
    else
      unitForm.value = {
        id: null,
        unit: "",
        unitNm: "",
        baseUnitYn: 1,
        baseUnit: null,
        convRate: 1.0,
        useYn: "1",
        dispOrd: 10,
      };
  },
  { immediate: true },
);

watch(
  () => unitForm.value.baseUnitYn,
  (isBase) => {
    if (isBase == 1) {
      unitForm.value.baseUnit = null;
      unitForm.value.convRate = 1.0;
    }
  },
);

const submitUnitForm = () => {
  handleSave({ ...unitForm.value });
};
</script>
