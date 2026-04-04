<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>상세 데이터 변경 내역</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body p-4">
        <div class="grid grid-cols-2 gap-4 h-full">
          <!-- 변경 전 -->
          <div class="data-box border rounded p-3 bg-red-50 border-red-200 flex flex-col">
            <h4
              class="font-bold text-red-700 mb-2 text-sm border-b border-red-200 pb-1 shrink-0"
            >
              Before Value (변경 전)
            </h4>
            <div class="flex-1 min-h-0 overflow-auto relative">
              <pre class="text-xs absolute inset-0 w-full h-full">{{ formatJSON(item.beforeValue) }}</pre>
            </div>
            <div
              v-if="item.beforeCreatedAt"
              class="mt-2 text-xs text-gray-500 border-t border-red-200 pt-1 shrink-0"
            >
              최초 생성일: {{ formatDate(item.beforeCreatedAt) }}<br />
              최종 수정일: {{ formatDate(item.beforeChangedAt) }}
            </div>
          </div>

          <!-- 변경 후 -->
          <div class="data-box border rounded p-3 bg-green-50 border-green-200 flex flex-col">
            <h4
              class="font-bold text-green-700 mb-2 text-sm border-b border-green-200 pb-1 shrink-0"
            >
              After Value (변경 후)
            </h4>
            <div class="flex-1 min-h-0 overflow-auto relative">
              <pre class="text-xs absolute inset-0 w-full h-full">{{ formatJSON(item.afterValue) }}</pre>
            </div>
            <div
              v-if="item.afterCreatedAt"
              class="mt-2 text-xs text-gray-500 border-t border-green-200 pt-1 shrink-0"
            >
              최초 생성일: {{ formatDate(item.afterCreatedAt) }}<br />
              최종 수정일: {{ formatDate(item.afterChangedAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

function formatJSON(val) {
  if (!val) return "데이터 없음";
  try {
    const parsed = JSON.parse(val);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return val; // JSON이 아니면 그대로 반환
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.modal-body {
  flex: 1;
  min-height: 0;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #64748b;
}
.close-btn:hover {
  color: #1e293b;
}
</style>