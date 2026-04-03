<template>
  <section class="card-section">
    <div class="card-header flex justify-between items-center">
      <h2 class="section-title">
        {{ isEditMode ? "회사 정보 수정" : "새 회사 등록" }}
      </h2>
      <button
        v-if="isEditMode"
        @click="emit('reset')"
        class="text-sm font-medium text-blue-600 hover:underline"
      >
        취소 및 신규 전환
      </button>
    </div>
    <form @submit.prevent="emit('submit')">
      <div class="form-grid-complex">
        <!-- Main Company Info -->
        <div class="form-group">
          <label>회사 ID *</label>
          <input
            type="text"
            :value="formData.company"
            @input="updateForm('company', $event.target.value)"
            required
            :disabled="isEditMode"
          />
        </div>
        <div class="form-group">
          <label>대표자명</label>
          <input
            type="text"
            :value="formData.repNm"
            @input="updateForm('repNm', $event.target.value)"
          />
        </div>
        <div class="form-group">
          <label>사업자번호</label>
          <input
            type="text"
            :value="formData.regNo"
            @input="updateForm('regNo', $event.target.value)"
          />
        </div>
        <div class="form-group">
          <label>법인번호</label>
          <input
            type="text"
            :value="formData.corpNo"
            @input="updateForm('corpNo', $event.target.value)"
          />
        </div>
        <div class="form-group full-span">
          <label>업태 / 종목</label>
          <div class="flex gap-4">
            <select
              class="flex-1"
              :value="formData.bzType"
              @change="onBzTypeChange"
            >
              <option value="">업태 선택</option>
              <option
                v-for="type in bzTypes"
                :key="type.subCode || type.subcode"
                :value="type.subCode || type.subcode"
              >
                {{ type.description || type.codeNm }}
              </option>
            </select>
            <select
              class="flex-1"
              :value="formData.bzItem"
              @change="updateForm('bzItem', $event.target.value)"
              :disabled="!formData.bzType"
            >
              <option value="">종목 선택</option>
              <option
                v-for="item in filteredBzItems"
                :key="item.subCode || item.subcode"
                :value="item.subCode || item.subcode"
              >
                {{ item.description || item.codeNm }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-group full-span">
          <label>주소</label>
          <div class="flex gap-2 items-center">
            <input
              style="width: 100px"
              type="text"
              :value="formData.zipCode"
              @input="updateForm('zipCode', $event.target.value)"
              placeholder="우편번호"
            />
            <button
              type="button"
              class="btn btn-secondary"
              @click="openPostcode"
            >
              주소검색
            </button>
          </div>
          <input
            class="mt-2"
            type="text"
            :value="formData.addr"
            @input="updateForm('addr', $event.target.value)"
            placeholder="주소"
          />
          <input
            class="mt-2"
            type="text"
            :value="formData.addrDetail"
            @input="updateForm('addrDetail', $event.target.value)"
            placeholder="상세주소"
          />
        </div>
        <div class="form-group">
          <label>연락처</label>
          <input
            type="tel"
            :value="formData.telNo"
            @input="updateForm('telNo', $event.target.value)"
          />
        </div>
        <div class="form-group">
          <label>팩스</label>
          <input
            type="tel"
            :value="formData.faxNo"
            @input="updateForm('faxNo', $event.target.value)"
          />
        </div>
        <div class="form-group">
          <label>이메일</label>
          <input
            type="email"
            :value="formData.email"
            @input="updateForm('email', $event.target.value)"
          />
        </div>
        <div class="form-group">
          <label>주 통화</label>
          <select
            :value="formData.currency"
            @change="updateForm('currency', $event.target.value)"
          >
            <option value="">선택</option>
            <option v-for="unit in units" :key="unit.unit" :value="unit.unit">
              {{ unit.unitNm }} ({{ unit.unit }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>사용 여부</label>
          <select
            :value="formData.useYn"
            @input="updateForm('useYn', Number($event.target.value))"
          >
            <option :value="1">사용</option>
            <option :value="0">미사용</option>
          </select>
        </div>
      </div>

      <!-- Multilingual Names -->
      <div class="multilang-section">
        <h3 class="subsection-title">다국어 회사명</h3>
        <div
          v-for="(name, index) in localNames"
          :key="index"
          class="form-grid-multilang"
        >
          <select v-model="name.langu" :disabled="isEditMode">
            <option value="" disabled>언어 선택</option>
            <option
              v-for="lang in availableLanguages"
              :key="lang.langu"
              :value="lang.langu"
            >
              {{ lang.languNm }}
            </option>
          </select>
          <input type="text" v-model="name.companyNm" placeholder="회사명" />
          <button
            type="button"
            @click="removeName(index)"
            class="btn-icon btn-danger"
          >
            🗑️
          </button>
        </div>
        <button type="button" @click="addName" class="btn btn-outline mt-2">
          언어 추가
        </button>
      </div>

      <div class="p-4 border-t border-slate-200">
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="isSubmitting || !formData.company"
        >
          {{
            isSubmitting ? "처리 중..." : isEditMode ? "수정하기" : "등록하기"
          }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import api from "@/service/api";

const props = defineProps({
  isEditMode: Boolean,
  isSubmitting: Boolean,
  formData: Object,
  availableLanguages: Array,
});

const emit = defineEmits(["submit", "reset", "update:formData"]);

const localNames = ref([]);
const bzTypes = ref([]);
const bzItems = ref([]);
const units = ref([]);

// API 응답 데이터(배열)를 어떤 포맷이든 안전하게 추출하는 헬퍼 함수
const extractData = (res, name) => {
  let result = [];
  if (Array.isArray(res)) result = res;
  else if (res?.data && Array.isArray(res.data)) result = res.data;
  else if (res?.data?.data && Array.isArray(res.data.data))
    result = res.data.data;

  if (result.length === 0) {
    console.warn(`[${name}] 데이터가 비어있습니다. API 응답 확인:`, res);
  }
  return result;
};

onMounted(async () => {
  try {
    const [bzTypeRes, bzItemRes, unitRes] = await Promise.all([
      api.get("/codes/items/ERP/COM001").catch((e) => {
        console.error("COM001 API 에러:", e);
        return { data: [] };
      }),
      api.get("/codes/items/ERP/COM002").catch((e) => {
        console.error("COM002 API 에러:", e);
        return { data: [] };
      }),
      api.get("/units").catch((e) => {
        console.error("UNITS API 에러:", e);
        return { data: [] };
      }),
    ]);

    bzTypes.value = extractData(bzTypeRes, "COM001");
    bzItems.value = extractData(bzItemRes, "COM002");
    units.value = extractData(unitRes, "UNITS");
  } catch (error) {
    console.error("Failed to load select options:", error);
  }
});

const filteredBzItems = computed(() => {
  if (!props.formData.bzType) return [];
  return bzItems.value.filter(
    (item) =>
      item.field2 === props.formData.bzType ||
      item.FIELD2 === props.formData.bzType,
  );
});

watch(
  () => props.formData.names, // 1. 감시 대상을 'names'로 좁힙니다.
  (newNames) => {
    // 2. 현재 로컬 값과 들어온 값이 동일한지 체크 (무한 루프 방어막)
    const currentStr = JSON.stringify(localNames.value);
    const newStr = JSON.stringify(newNames);

    if (currentStr !== newStr) {
      localNames.value = newNames ? JSON.parse(JSON.stringify(newNames)) : [];
    }
  },
  { immediate: true, deep: true },
);

const updateForm = (key, value) => {
  // Emit updates for main form data
  emit("update:formData", { ...props.formData, [key]: value });
};

const onBzTypeChange = (event) => {
  const val = event.target.value;
  // 업태가 변경될 경우 종목 데이터를 초기화하기 위해 상태를 동시에 전송
  emit("update:formData", { ...props.formData, bzType: val, bzItem: "" });
};

watch(
  localNames,
  (newNames) => {
    // Emit updates for names
    emit("update:formData", { ...props.formData, names: newNames });
  },
  { deep: true },
);

const addName = () => {
  localNames.value.push({ langu: "", companyNm: "" });
};

const removeName = (index) => {
  localNames.value.splice(index, 1);
};

const openPostcode = () => {
  new window.daum.Postcode({
    oncomplete: (data) => {
      updateForm("zipCode", data.zonecode);
      updateForm("addr", data.address);
    },
  }).open();
};
</script>

<style scoped>
.form-grid-complex {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem;
}
.full-span {
  grid-column: span 2;
}
.multilang-section {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}
.subsection-title {
  font-weight: 600;
  margin-bottom: 1rem;
}
.form-grid-multilang {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}
.p-4 {
  padding: 1rem;
}
.mt-2 {
  margin-top: 0.5rem;
}
.border-t {
  border-top-width: 1px;
}
.border-slate-200 {
  border-color: #e2e8f0;
}
.flex-1 {
  flex: 1;
}
</style>
