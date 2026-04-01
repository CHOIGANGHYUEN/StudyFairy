<template>
  <section class="card-section">
    <div class="card-header">
      <h2 class="section-title">새 사용자 등록</h2>
    </div>
    <form @submit.prevent="submitForm">
      <div class="form-grid">
        <div class="form-group full-width">
          <label for="userId">사용자 ID *</label>
          <input
            type="text"
            id="userId"
            v-model="localUserId"
            placeholder="예: user_01, gildong@example.com"
            required
            :disabled="isSubmitting"
          />
          <p class="input-hint">ID는 중복될 수 없으며 필수 입력 사항입니다.</p>
        </div>
      </div>
      <button
        type="submit"
        class="btn-primary"
        :disabled="isSubmitting || !localUserId"
      >
        {{ isSubmitting ? "등록 중..." : "사용자 추가" }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { ref } from "vue";
defineProps({ isSubmitting: Boolean });
const emit = defineEmits(["register"]);

const localUserId = ref("");
const submitForm = () => {
  emit("register", localUserId.value);
  localUserId.value = "";
};
</script>

<style scoped>
.input-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.4rem;
}
</style>
