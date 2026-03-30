<template>
  <section class="card-section">
    <div class="card-header flex justify-between items-center">
      <h2 class="section-title">
        {{ isEditMode ? "메뉴 정보 수정" : "신규 메뉴 등록" }}
      </h2>
      <button
        v-if="isEditMode"
        @click="emit('reset')"
        class="text-sm text-blue-600 font-medium"
      >
        취소 및 신규 전환
      </button>
    </div>
    <form @submit.prevent="emit('submit')" class="registration-form">
      <div class="form-grid">
        <div class="form-group">
          <label>언어 *</label>
          <select
            :value="formData.langu"
            @input="updateForm('langu', $event.target.value)"
            required
          >
            <option
              v-for="lang in availableLanguages"
              :key="lang.langu"
              :value="lang.langu"
            >
              {{ lang.languNm }} ({{ lang.langu }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>메뉴 ID *</label>
          <input
            type="text"
            :value="formData.menuId"
            @input="updateForm('menuId', $event.target.value)"
            placeholder="예: M1000"
            :disabled="isEditMode"
            required
          />
        </div>

        <div class="form-group">
          <label>메뉴 레벨 *</label>
          <select
            :value="formData.menuLevel"
            @change="
              updateFields({
                menuLevel: Number($event.target.value),
                parentMenuId: '',
              })
            "
            required
          >
            <option :value="1">1단계 (대분류)</option>
            <option :value="2">2단계 (중분류)</option>
            <option :value="3">3단계 (소분류)</option>
          </select>
        </div>

        <div class="form-group">
          <label>상위 메뉴</label>
          <select
            :value="formData.parentMenuId"
            @input="updateForm('parentMenuId', $event.target.value)"
            :disabled="formData.menuLevel === 1"
          >
            <option value="">없음 (최상위)</option>
            <option
              v-for="parent in filteredParentOptions"
              :key="parent.menuId"
              :value="parent.menuId"
            >
              [{{ parent.menuLevel }}단] {{ parent.menuNm }} ({{
                parent.menuId
              }})
            </option>
          </select>
        </div>

        <div class="form-group full-width">
          <label>메뉴명 *</label>
          <input
            type="text"
            :value="formData.menuNm"
            @input="updateForm('menuNm', $event.target.value)"
            required
          />
        </div>

        <div class="form-group full-width">
          <label>설명 (Description)</label>
          <input
            type="text"
            :value="formData.description"
            @input="updateForm('description', $event.target.value)"
            placeholder="메뉴에 대한 설명을 입력하세요"
          />
        </div>

        <div class="form-group">
          <label>경로 (Path)</label>
          <input
            type="text"
            :value="formData.path"
            @input="updateForm('path', $event.target.value)"
            placeholder="/example/path"
          />
        </div>

        <div class="form-group">
          <label>순번 *</label>
          <input
            type="number"
            :value="formData.ordNum"
            @input="updateForm('ordNum', Number($event.target.value))"
            min="1"
            required
          />
        </div>

        <div class="form-group">
          <label>사용 여부</label>
          <select
            :value="formData.useYn"
            @input="updateForm('useYn', Number($event.target.value))"
          >
            <option :value="1">사용함</option>
            <option :value="0">사용 안함</option>
          </select>
        </div>
      </div>
      <div class="p-4 border-t border-slate-200">
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="isSubmitting"
        >
          {{
            isSubmitting
              ? "처리 중..."
              : isEditMode
                ? "정보 수정하기"
                : "메뉴 등록하기"
          }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  isEditMode: Boolean,
  isSubmitting: Boolean,
  formData: Object,
  availableLanguages: Array,
  flatMenus: Array,
});

const emit = defineEmits(["submit", "reset", "update:formData"]);

// 여러 필드를 동시에 업데이트할 수 있는 함수 추가
const updateFields = (updates) => {
  emit("update:formData", {
    ...props.formData,
    ...updates,
  });
};

// 기존 updateForm은 그대로 두셔도 되고, 위 함수를 활용하게 수정해도 됩니다.
const updateForm = (key, value) => {
  updateFields({ [key]: value });
};

const filteredParentOptions = computed(() => {
  return props.flatMenus.filter(
    (m) =>
      m.menuLevel === props.formData.menuLevel - 1 &&
      m.langu === props.formData.langu,
  );
});
</script>

<style scoped>
.p-4 {
  padding: 1rem;
}
.border-t {
  border-top-width: 1px;
}
.border-slate-200 {
  border-color: #e2e8f0;
}
</style>
