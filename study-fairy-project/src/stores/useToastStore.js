import { defineStore } from "pinia";
import { ref } from "vue";

export const useToastStore = defineStore("toast", () => {
  const toasts = ref([]);
  let nextId = 0;

  const addToast = (message, type = "success", duration = 3000) => {
    const id = nextId++;
    toasts.value.push({ id, message, type });

    // 지정된 시간이 지나면 자동으로 토스트 제거
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) toasts.value.splice(index, 1);
  };

  return { toasts, addToast, removeToast };
});
