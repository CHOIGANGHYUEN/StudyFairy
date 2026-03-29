<template>
  <div class="card-section file-upload-section">
    <div class="file-input-wrapper">
      <label for="pdf-file-input" class="btn btn-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon-sm"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M2 6a2 2 0 012-2h5.293a1 1 0 01.707.293l4 4a1 1 0 01.293.707v5.586a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
          />
          <path
            d="M15 9h-4a1 1 0 01-1-1V4a1 1 0 011-1h.586a1 1 0 01.707.293l4 4a1 1 0 01.293.707V9z"
          />
        </svg>
        PDF 파일 선택
      </label>
      <input
        id="pdf-file-input"
        type="file"
        class="hidden"
        accept=".pdf"
        @change="onFileChange"
        :disabled="isLoading"
      />
      <span v-if="fileName" class="file-name-display">{{ fileName }}</span>
    </div>
    <div class="divider-vertical"></div>
    <button
      type="button"
      class="btn btn-secondary btn-google"
      @click="onGoogleDriveClick"
      :disabled="isLoading"
    >
      <svg class="google-logo" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Google Drive
    </button>
  </div>
</template>

<script setup>
defineProps({
  isLoading: Boolean,
  fileName: String,
});

const emit = defineEmits(["file-change", "google-drive-click"]);

const onFileChange = (event) => {
  emit("file-change", event);
};

const onGoogleDriveClick = () => {
  emit("google-drive-click");
};
</script>

<style scoped>
.file-upload-section {
  flex-direction: row;
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  gap: 1rem;
  flex-shrink: 0;
}

.file-input-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-grow: 1;
  overflow: hidden;
}

.file-name-display {
  font-size: 0.95rem;
  color: var(--text-color-secondary);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.divider-vertical {
  width: 1px;
  align-self: stretch;
  background-color: var(--border-color);
}

.google-logo {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
