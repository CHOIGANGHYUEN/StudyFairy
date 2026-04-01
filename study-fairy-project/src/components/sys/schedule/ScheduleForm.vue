<template>
  <section class="card-section">
    <div class="card-header flex justify-between items-center">
      <h2 class="section-title">
        {{ isEditMode ? "일정 정보 수정" : "새 일정 등록" }}
      </h2>
      <button
        v-if="isEditMode"
        @click="$emit('reset')"
        class="text-sm font-medium text-blue-600 hover:underline"
      >
        취소 및 신규 전환
      </button>
    </div>
    <form @submit.prevent="$emit('submit')">
      <div class="form-grid">
        <div class="form-group">
          <label for="schGroupCode">일정 그룹 (Group Code) *</label>
          <select
            id="schGroupCode"
            v-model="formData.schGroupCode"
            required
            :disabled="isSubmitting"
          >
            <option value="" disabled>그룹을 선택하세요</option>
            <option v-if="sys001Items.length === 0" value="SGR001">
              업무 (SGR001)
            </option>
            <option v-if="sys001Items.length === 0" value="SGR002">
              학습 (SGR002)
            </option>
            <option
              v-for="item in sys001Items"
              :key="item.subCode"
              :value="item.subCode"
            >
              {{ item.description || item.subCode }} ({{ item.subCode }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="userId">사용자 ID *</label>
          <input
            type="text"
            id="userId"
            v-model="formData.userId"
            required
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-group" v-if="!isEditMode">
          <label for="schYear">대상 연도 (Year) *</label>
          <select
            id="schYear"
            v-model="formData.schYear"
            required
            :disabled="isSubmitting"
          >
            <option v-for="y in yearOptions" :key="y" :value="String(y)">
              {{ y }}년
            </option>
          </select>
        </div>
        <div class="form-group" v-if="!isEditMode">
          <label for="schMonth">대상 월 (Month) *</label>
          <select
            id="schMonth"
            v-model="formData.schMonth"
            required
            :disabled="isSubmitting"
          >
            <option
              v-for="m in 12"
              :key="m"
              :value="String(m).padStart(2, '0')"
            >
              {{ m }}월
            </option>
          </select>
        </div>
        <div class="form-group" v-if="isEditMode">
          <label for="schDate">일정 일자 (Date) *</label>
          <input
            type="date"
            id="schDate"
            v-model="formData.schDate"
            required
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-group">
          <label for="schCode">일정 코드 (Schedule Code)</label>
          <select
            id="schCode"
            v-model="formData.schCode"
            :disabled="isSubmitting"
          >
            <option value="">선택 안함</option>
            <option
              v-for="item in sys002Items"
              :key="item.subCode"
              :value="item.subCode"
            >
              {{ item.description || item.subCode }} ({{ item.subCode }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="useYn">사용 여부</label>
          <select
            id="useYn"
            v-model.number="formData.useYn"
            :disabled="isSubmitting"
          >
            <option :value="1">사용</option>
            <option :value="0">미사용</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        class="btn-primary"
        :disabled="
          isSubmitting ||
          !formData.schGroupCode ||
          !formData.userId ||
          (isEditMode
            ? !formData.schDate
            : !formData.schYear || !formData.schMonth)
        "
      >
        {{ isSubmitting ? "처리 중..." : isEditMode ? "수정하기" : "등록하기" }}
      </button>
    </form>
  </section>
</template>

<script setup>
defineProps({
  isEditMode: Boolean,
  isSubmitting: Boolean,
  formData: Object,
  sys001Items: Array,
  sys002Items: Array,
  yearOptions: Array,
});
defineEmits(["submit", "reset"]);
</script>

<style scoped>
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
</style>
