<template>
  <section class="card-section">
    <div class="card-header flex justify-between items-center">
      <h2 class="section-title">
        {{ isEditMode ? "사용자 권한 정보 수정" : "새 사용자 권한 등록" }}
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
      <div class="form-grid">
        <div class="form-group">
          <label for="userId">사용자 ID (User ID) *</label>
          <input
            type="text"
            id="userId"
            :value="formData.userId"
            @input="updateForm('userId', $event.target.value)"
            placeholder="예: admin, user_01"
            required
            :disabled="isEditMode || isSubmitting"
          />
        </div>
        <div class="form-group">
          <label for="roleId">부여할 권한 (Role) *</label>
          <select
            id="roleId"
            :value="formData.roleId"
            @input="updateForm('roleId', $event.target.value)"
            required
            :disabled="isEditMode || isSubmitting"
          >
            <option value="" disabled>권한을 선택하세요</option>
            <option
              v-for="role in roles"
              :key="role.roleId"
              :value="role.roleId"
            >
              {{ role.roleId }} ({{ role.description || "설명 없음" }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="useYn">사용 여부</label>
          <select
            id="useYn"
            :value="formData.useYn"
            @input="updateForm('useYn', Number($event.target.value))"
            :disabled="isSubmitting"
          >
            <option :value="1">사용</option>
            <option :value="0">미사용</option>
          </select>
        </div>
      </div>
      <div class="p-4 border-t border-slate-200">
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="isSubmitting || !formData.userId || !formData.roleId"
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
defineProps({
  isEditMode: Boolean,
  isSubmitting: Boolean,
  roles: Array,
  formData: Object,
});

const emit = defineEmits(["submit", "reset", "update:formData"]);

const updateForm = (key, value) => {
  emit("update:formData", { ...props.formData, [key]: value });
};
</script>

<style scoped>
/* Scoped styles specific to UserRoleForm can go here if needed */
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
