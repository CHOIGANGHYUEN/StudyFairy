<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">
          {{ isEditing ? "단위 수정" : "새 단위 등록" }}
        </h3>
        <button @click="emit('close')" class="btn-close">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="form-grid">
          <div class="form-group">
            <label for="unit">단위 ID</label>
            <input type="text" id="unit" v-model="form.unit" required />
          </div>
          <div class="form-group">
            <label for="unitNm">단위명</label>
            <input type="text" id="unitNm" v-model="form.unitNm" required />
          </div>
          <div class="form-group">
            <label>기본 단위 여부</label>
            <div class="flex gap-4">
              <label class="items-center">
                <input type="radio" v-model="form.baseUnitYn" :value="1" /> Yes
              </label>
              <label class="items-center">
                <input type="radio" v-model="form.baseUnitYn" :value="0" /> No
              </label>
            </div>
          </div>
          <div class="form-group">
            <label for="baseUnit">기본 단위 ID</label>
            <select
              id="baseUnit"
              v-model="form.baseUnit"
              :disabled="form.baseUnitYn == 1"
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
              v-model="form.convRate"
              :disabled="form.baseUnitYn == 1"
            />
          </div>
          <div class="form-group">
            <label for="dispOrd">정렬 순서</label>
            <input type="number" id="dispOrd" v-model="form.dispOrd" />
          </div>
          <div class="form-group full-width">
            <label>사용 여부</label>
            <label class="items-center">
              <input
                type="checkbox"
                v-model="form.useYn"
                true-value="1"
                false-value="0"
              />
              사용
            </label>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button @click="emit('close')" type="button" class="btn btn-secondary">
          취소
        </button>
        <button @click="handleSubmit" type="submit" class="btn btn-primary">
          {{ isEditing ? "수정" : "등록" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  unit: {
    type: Object,
    default: null,
  },
  units: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["close", "save"]);

const form = ref({
  id: null,
  unit: "",
  unitNm: "",
  baseUnitYn: 1,
  baseUnit: null,
  convRate: 1.0,
  useYn: "1",
  dispOrd: 10,
});

const isEditing = computed(() => !!props.unit);

const baseUnits = computed(() => props.units.filter((u) => u.baseUnitYn === 1));

watch(
  () => props.unit,
  (newUnit) => {
    if (newUnit) {
      form.value = { ...newUnit };
    } else {
      form.value = {
        id: null,
        unit: "",
        unitNm: "",
        baseUnitYn: 1,
        baseUnit: null,
        convRate: 1.0,
        useYn: "1",
        dispOrd: 10,
      };
    }
  },
  { immediate: true },
);

watch(
  () => form.value.baseUnitYn,
  (isBase) => {
    if (isBase == 1) {
      form.value.baseUnit = null;
      form.value.convRate = 1.0;
    }
  },
);

const handleSubmit = () => {
  emit("save", { ...form.value });
};
</script>
