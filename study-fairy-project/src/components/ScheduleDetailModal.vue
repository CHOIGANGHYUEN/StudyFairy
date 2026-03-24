<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <h3>{{ formattedDate }} - 작업 등록</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">제목</label>
          <input type="text" id="title" v-model="formData.title" required />
        </div>
        <div class="form-group">
          <label for="subtitle">하위제목</label>
          <input type="text" id="subtitle" v-model="formData.subtitle" />
        </div>
        <div class="form-group">
          <label for="content">상세 내용</label>
          <textarea id="content" v-model="formData.content"></textarea>
        </div>
        <!-- Add other fields from sysSchedulerDetail as needed -->
        <!-- For example: code1, code2, code3 -->

        <div class="modal-actions">
          <button type="button" @click="close" class="btn-cancel">취소</button>
          <button type="submit" class="btn-submit">저장</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import api from '@/service/api';
import { useAuthStore } from '@/stores/useAuthStore';

const props = defineProps({
  visible: Boolean,
  date: String, // e.g., '2024-03-26'
  scheduleId: Number,
  schGroupCode: String,
  schYear: [String, Number],
  schMonth: [String, Number],
});

const emit = defineEmits(['close', 'save-success']);

const authStore = useAuthStore();

const formData = reactive({
  title: '',
  subtitle: '',
  content: '',
  // Initialize other fields here
});

const formattedDate = computed(() => {
    if (!props.date) return '';
    const d = new Date(props.date);
    return d.toLocaleDateString();
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    // Reset form when modal becomes visible
    formData.title = '';
    formData.subtitle = '';
    formData.content = '';
  }
});

const handleSubmit = async () => {
  if (!props.scheduleId) {
    alert("저장할 마스터 일정이 없습니다.");
    return;
  }

  const detailData = {
    ...formData,
    scheduleId: props.scheduleId,
    schGroupCode: props.schGroupCode,
    schYear: String(props.schYear),
    schMonth: String(props.schMonth).padStart(2, '0'),
    schDate: props.date,
    createdBy: authStore.user?.userId,
  };

  try {
    await api.post('/api/schedule-details', detailData);
    alert('작업이 성공적으로 등록되었습니다.');
    emit('save-success');
    close();
  } catch (error) {
    console.error("Error saving schedule detail:", error);
    alert('저장 중 오류가 발생했습니다.');
  }
};

const close = () => {
  emit('close');
};

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.modal-actions {
  text-align: right;
  margin-top: 1.5rem;
}
.modal-actions button {
  margin-left: 0.5rem;
}
.btn-cancel {
  background-color: #f0f0f0;
}
.btn-submit {
  background-color: #3498db;
  color: white;
}
</style>
