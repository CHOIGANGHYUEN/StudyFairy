<template>
    <section class="card-section category-selector-section">
        <div class="form-group">
            <label for="category-select">코드 카테고리 선택</label>
            <select
                id="category-select"
                :value="modelValue"
                @change="emit('update:modelValue', $event.target.value); emit('change')"
            >
                <option
                    v-for="cat in categories"
                    :key="cat.subCode"
                    :value="cat.subCode"
                >
                    {{ cat.description }} ({{ cat.subCode }})
                </option>
            </select>
        </div>
    </section>
</template>

<script setup>
defineProps({
    categories: Array,
    modelValue: String,
});

const emit = defineEmits(['update:modelValue', 'change']);
</script>

<style scoped>
.category-selector-section {
  padding: 0.5rem 1.5rem 1.5rem;
}
.category-selector-section label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}
.category-selector-section select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #cbd5e1;
}
</style>
