<template>
    <section class="card-section head-editor-section">
        <div class="card-header flex justify-between items-center">
            <h2 class="section-title">
                {{ headFormMode === "create" ? "신규 그룹 생성" : "그룹 정보" }}
            </h2>
            <div class="form-actions">
                <button class="btn btn-secondary" @click="emit('new')">신규</button>
                <button
                    class="btn btn-primary"
                    @click="emit('save')"
                    :disabled="isSubmitting || !formData.categoryCode"
                >
                    {{ isSubmitting ? "저장중..." : "저장" }}
                </button>
                <button
                    v-if="headFormMode === 'edit'"
                    class="btn btn-danger"
                    @click="emit('delete', formData.groupCode)"
                    :disabled="isSubmitting"
                >
                    삭제
                </button>
            </div>
        </div>
        <div class="form-container">
            <div class="form-grid head-form-grid">
                <div class="form-group">
                    <label>Group Code *</label>
                    <input
                        type="text"
                        :value="formData.groupCode"
                        @input="updateForm('groupCode', $event.target.value)"
                        :disabled="headFormMode === 'edit'"
                        required
                    />
                </div>
                <div class="form-group">
                    <label>Use</label>
                    <select :value="formData.useYn" @input="updateForm('useYn', Number($event.target.value))">
                        <option :value="1">Yes</option>
                        <option :value="0">No</option>
                    </select>
                </div>
                <div class="form-group head-form-grid-col-span-2">
                    <label>Description</label>
                    <input type="text" :value="formData.description" @input="updateForm('description', $event.target.value)" />
                </div>
            </div>

            <h3 class="subsection-title">상세 필드명 설정 (Field 1 ~ 10)</h3>
            <div class="form-grid field-names-grid">
                <div
                    class="form-group"
                    v-for="i in 10"
                    :key="`head-fieldNm${i}`"
                >
                    <label>Field {{ i }} 명칭</label>
                    <input
                        type="text"
                        :value="formData[`fieldNm${i}`]"
                        @input="updateForm(`fieldNm${i}`, $event.target.value)"
                        :placeholder="`미지정 시 Field ${i}`"
                    />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
const props = defineProps({
    formData: Object,
    headFormMode: String,
    isSubmitting: Boolean,
});

const emit = defineEmits(['new', 'save', 'delete', 'update:formData']);

const updateForm = (key, value) => {
    emit('update:formData', { ...props.formData, [key]: value });
}
</script>

<style scoped>
.form-container {
  padding: 1.5rem;
}
.head-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.head-form-grid-col-span-2 {
  grid-column: span 2;
}
.subsection-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}
.field-names-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
}
.field-names-grid label {
  font-size: 0.85rem;
  color: #475569;
}
.field-names-grid input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  font-size: 0.85rem;
}
.form-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
