<template>
  <div class="toast-container">
    <TransitionGroup name="toast-list" tag="div" class="toast-wrapper">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="global-toast"
        :class="`toast-${toast.type}`"
      >
        <!-- 타입별 아이콘 -->
        <svg
          v-if="toast.type === 'success'"
          class="icon-sm"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <svg
          v-else-if="toast.type === 'error'"
          class="icon-sm"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <svg
          v-else-if="toast.type === 'warning'"
          class="icon-sm"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <svg
          v-else
          class="icon-sm"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <span class="toast-message">{{ toast.message }}</span>

        <button
          @click="toastStore.removeToast(toast.id)"
          class="toast-close-btn"
        >
          <svg
            class="icon-xs"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style="width: 14px; height: 14px"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToastStore } from "@/stores/useToastStore";

const toastStore = useToastStore();
</script>

<style scoped>
.toast-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.toast-close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
}
.toast-close-btn:hover {
  color: white;
}
</style>
