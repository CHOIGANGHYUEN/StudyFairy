<template>
  <section class="card-section">
    <div class="card-header">
      <h2 class="section-title">새 언어 추가</h2>
    </div>
    <form @submit.prevent="handleRegister">
      <div class="form-grid">
        <div class="form-group">
          <label for="langu">언어 코드 (Code) *</label>
          <input
            type="text"
            id="langu"
            v-model="newLang.langu"
            placeholder="예: ko, en"
            required
            :disabled="isSubmitting"
          />
          <p class="input-hint">ISO 639-1 형식 권장 (예: ko, en)</p>
        </div>
        <div class="form-group">
          <label for="languNm">언어 이름 (Name) *</label>
          <input
            type="text"
            id="languNm"
            v-model="newLang.languNm"
            placeholder="예: 한국어, English"
            required
            :disabled="isSubmitting"
          />
        </div>
      </div>
      <div class="p-4 border-t border-slate-200">
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="isSubmitting || !isValid"
        >
          {{ isSubmitting ? "처리 중..." : "언어 등록" }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";

defineProps({
  isSubmitting: Boolean,
});

const emit = defineEmits(["register"]);

const newLang = ref({
  langu: "",
  languNm: "",
});

const isValid = computed(() => {
  return (
    newLang.value.langu.trim() !== "" && newLang.value.languNm.trim() !== ""
  );
});

const handleRegister = () => {
  if (isValid.value) {
    emit("register", { ...newLang.value });
    // Reset form after emitting
    newLang.value = { langu: "", languNm: "" };
  }
};
</script>

<style scoped>
.border-t {
  border-top-width: 1px;
}
.border-slate-200 {
  border-color: #e2e8f0;
}
.p-4 {
  padding: 1rem;
}
</style>
