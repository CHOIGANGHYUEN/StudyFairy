<template>
  <section>
    <h2>3. 요약 프롬프트</h2>
    <textarea
      v-model="localPrompt"
      placeholder="요약 프롬프트를 입력하세요."
      :disabled="isLoading"
    ></textarea>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  isLoading: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

// v-model 처리를 위한 computed 속성
const localPrompt = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>

<style scoped>
section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}
textarea {
  width: 100%;
  height: 100px;
  resize: vertical;
  padding: 0.5rem;
}
</style>
