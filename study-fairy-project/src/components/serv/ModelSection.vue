<template>
  <section class="model-section">
    <h2>0. 모델 선택</h2>

    <div class="model-select-wrapper">
      <!-- 드롭다운 방식의 모델 선택 -->
      <select v-model="localModel" class="model-dropdown">
        <optgroup label="Google Gemini">
          <option
            v-for="model in geminiModels"
            :key="model.value"
            :value="model.value"
          >
            {{ model.name }}
          </option>
        </optgroup>
      </select>

      <!-- 선택된 모델의 상세 설명 표시 -->
      <div class="model-info" v-if="selectedModelInfo">
        <strong>{{ selectedModelInfo.name }}</strong>
        <span>{{ selectedModelInfo.desc }}</span>
      </div>
    </div>

    <!-- 하위 모델 선택 시 자동 생성되는 Step List -->
    <transition name="fade">
      <div v-if="isFlash" class="step-list-container">
        <h3>💡 Step-By-Step 사고 모드 자동 활성화됨</h3>
        <p>
          하위 모델의 품질 향상을 위해, AI가 다음 단계를 거쳐 생각하도록
          유도합니다.
        </p>
        <ol class="step-list">
          <li v-for="(step, index) in steps" :key="index">{{ step }}</li>
        </ol>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  steps: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

// v-model 양방향 바인딩
const localModel = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 추가된 모델 리스트
const geminiModels = ref([
  {
    value: "gemini-3-pro-preview",
    name: "Gemini 3 Pro",
    desc: "고성능, 복잡한 추론 및 정교한 요약에 적합",
  },
  {
    value: "gemini-3-flash-preview",
    name: "Gemini 3 Flash",
    desc: "빠른 속도, 가벼운 작업에 적합",
  },
  {
    value: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    desc: "대규모 컨텍스트 및 복잡한 코드 분석",
  },
  {
    value: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    desc: "가장 빠르고 효율적인 멀티모달 모델",
  },
  {
    value: "gemini-1.0-pro",
    name: "Gemini 1.0 Pro",
    desc: "안정적인 일반 텍스트 처리 모델",
  },
]);

// 모든 모델을 하나의 배열로 합쳐서 검색에 사용
const allModels = computed(() => [...geminiModels.value]);

// 현재 선택된 모델의 정보를 가져오는 computed
const selectedModelInfo = computed(() => {
  return allModels.value.find((model) => model.value === localModel.value);
});

// 하위 모델(Flash, 3.5, Haiku 등)인지 판별하여 Step-by-Step 모드를 켬
const isFlash = computed(() => {
  if (!localModel.value) return false;
  const val = localModel.value.toLowerCase();
  return val.includes("flash") || val.includes("3.5") || val.includes("haiku");
});
</script>

<style scoped>
.model-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.model-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 드롭다운 스타일링 */
.model-dropdown {
  width: 100%;
  padding: 0.875rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  background-color: #f8fafc;
  border: 2px solid #cbd5e1;
  border-radius: 0.5rem;
  outline: none;
  cursor: pointer;
  appearance: none; /* 기본 화살표 숨김 */
  /* 커스텀 화살표 아이콘 */
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.65rem auto;
  transition: all 0.2s ease;
}

.model-dropdown:hover {
  border-color: #94a3b8;
}

.model-dropdown:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  background-color: #ffffff;
}

.model-dropdown optgroup {
  font-weight: 700;
  color: #475569;
}

.model-dropdown option {
  font-weight: normal;
  color: #1e293b;
  padding: 0.5rem;
}

/* 선택된 모델 정보 박스 */
.model-info {
  padding: 1rem 1.25rem;
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 0.25rem 0.5rem 0.5rem 0.25rem;
}

.model-info strong {
  display: block;
  font-size: 1.05rem;
  color: #1e293b;
  margin-bottom: 0.375rem;
}

.model-info span {
  display: block;
  font-size: 0.9rem;
  color: #475569;
}

/* Step-By-Step 안내 박스 */
.step-list-container {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
}

.step-list-container h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.05rem;
  color: #166534;
}

.step-list-container p {
  font-size: 0.9rem;
  color: #15803d;
  margin-bottom: 1rem;
}

.step-list {
  padding-left: 1.5rem;
  margin: 0;
  color: #166534;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
