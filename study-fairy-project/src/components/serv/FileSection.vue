<template>
  <section class="file-section-container">
    <div class="header">
      <h2 class="title">
        <div class="icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        1. 파일 선택
      </h2>
      <p class="subtitle">
        업로드할 로컬 파일이나 구글 드라이브 파일을 선택하세요.
      </p>
    </div>

    <div
      class="drop-zone"
      :class="{ 'is-dragging': isDragging, 'is-loading': isLoading }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="openFilePicker"
    >
      <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        multiple
        class="hidden-input"
      />

      <div class="drop-content">
        <div class="upload-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <p class="drop-text">파일을 이리로 끌어오거나 클릭하여 선택</p>

        <div class="button-group" @click.stop>
          <button
            @click="openFilePicker"
            :disabled="isLoading"
            class="btn-local"
          >
            로컬 파일 선택
          </button>
          <button
            @click="$emit('open-drive')"
            :disabled="isLoading"
            class="btn-drive"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="drive-icon">
              <path
                d="M12.51,15.55 L11,18.08 L3.59,5.22 L5.11,2.61 L12.51,15.55 Z M20.34,18.08 L5.17,18.08 L6.7,20.69 L21.86,20.69 L20.34,18.08 Z M20.41,5.22 L17.37,0 L9.83,0 L12.87,5.22 L20.41,5.22 Z"
              />
            </svg>
            구글 드라이브
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedFiles.length > 0" class="file-list-section">
      <div class="list-header">
        <h3>
          선택된 파일 <span class="badge">{{ selectedFiles.length }}</span>
        </h3>
        <button @click="clearFiles" class="btn-clear">모두 삭제</button>
      </div>

      <ul class="file-list">
        <li
          v-for="(file, index) in selectedFiles"
          :key="file.name + index"
          class="file-item"
        >
          <div class="file-info">
            <div class="file-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </div>
            <div class="file-details">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatSize(file.size) }}</span>
            </div>
          </div>
          <button @click.stop="removeFile(index)" class="btn-remove">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  selectedFiles: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:selectedFiles", "open-drive"]);

const fileInput = ref(null);
const isDragging = ref(false);

const openFilePicker = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileChange = (event) => {
  const newFiles = Array.from(event.target.files);
  addFiles(newFiles);
  event.target.value = "";
};

const handleDrop = (event) => {
  isDragging.value = false;
  const newFiles = Array.from(event.dataTransfer.files);
  addFiles(newFiles);
};

const addFiles = (files) => {
  emit("update:selectedFiles", [...props.selectedFiles, ...files]);
};

const removeFile = (index) => {
  const updatedFiles = props.selectedFiles.filter((_, i) => i !== index);
  emit("update:selectedFiles", updatedFiles);
};

const clearFiles = () => {
  emit("update:selectedFiles", []);
};

const formatSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
</script>

<style scoped>
/* 전체 컨테이너 및 헤더 스타일 */
.file-section-container {
  background-color: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  font-family: inherit;
}

.header {
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.icon-wrapper {
  padding: 0.375rem;
  background-color: #eff6ff;
  border-radius: 0.5rem;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #2563eb;
}

.subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
  margin-left: 2.25rem;
}

/* 드래그 앤 드롭 구역 스타일 */
.drop-zone {
  position: relative;
  border: 2px dashed #e2e8f0;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  cursor: pointer;
}

.drop-zone:hover {
  border-color: #cbd5e1;
}

.drop-zone.is-dragging {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.drop-zone.is-loading {
  opacity: 0.5;
  pointer-events: none;
}

.hidden-input {
  display: none;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
  transition: transform 0.2s;
}

.drop-zone:hover .upload-icon {
  transform: scale(1.1);
}

.upload-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #94a3b8;
}

.drop-text {
  color: #475569;
  font-weight: 500;
  font-size: 1.125rem;
  margin: 0;
}

/* 버튼 스타일 */
.button-group {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-local {
  padding: 0.625rem 1.25rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-local:hover:not(:disabled) {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.btn-drive {
  padding: 0.625rem 1.25rem;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.btn-drive:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-local:disabled,
.btn-drive:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drive-icon {
  width: 1rem;
  height: 1rem;
}

/* 선택된 파일 리스트 스타일 */
.file-list-section {
  margin-top: 2rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 1.5rem;
  animation: slideIn 0.3s ease-out forwards;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0 0.25rem;
}

.list-header h3 {
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.badge {
  padding: 0.125rem 0.5rem;
  background-color: #eff6ff;
  color: #2563eb;
  font-size: 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
}

.btn-clear {
  font-size: 0.75rem;
  color: #ef4444;
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-clear:hover {
  color: #dc2626;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 16rem;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem;
  background-color: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
}

.file-item:hover {
  border-color: #bfdbfe;
  background-color: #ffffff;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
}

.file-icon {
  padding: 0.625rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  color: #94a3b8;
  transition: all 0.2s;
}

.file-item:hover .file-icon {
  color: #3b82f6;
  border-color: #dbeafe;
}

.file-icon svg {
  width: 1rem;
  height: 1rem;
}

.file-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.btn-remove {
  padding: 0.5rem;
  background: none;
  border: none;
  color: #cbd5e1;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background-color: #fef2f2;
  color: #ef4444;
}

.btn-remove svg {
  width: 1.25rem;
  height: 1.25rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
