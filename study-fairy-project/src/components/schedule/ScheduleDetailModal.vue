<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          {{ date }} 상세 일정
          <span v-if="isCopyMode" class="text-blue-500">(복사 등록)</span>
          <span v-else>{{ detailData ? "수정" : "등록" }}</span>
        </h3>
        <button class="close-btn" @click="$emit('close')" title="닫기">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- 1. 기본 정보 섹션 -->
        <h4 class="section-subtitle">기본 정보</h4>
        <div class="form-grid">
          <!-- 주차 -->
          <div class="form-group">
            <label>주차 (Week)</label>
            <input
              type="number"
              v-model.number="form.schWeek"
              placeholder="예: 1"
            />
          </div>

          <!-- 분류 1 -->
          <div class="form-group">
            <label>{{ isWork ? "회사/PJT (Code1)" : "교재 (Code1)" }}</label>
            <select v-if="code1Options.length > 0" v-model="form.code1">
              <option value="">선택하세요</option>
              <option
                v-for="opt in code1Options"
                :key="opt.subCode"
                :value="opt.subCode"
              >
                {{ opt.description }}
              </option>
            </select>
            <input
              v-else
              type="text"
              v-model="form.code1"
              placeholder="예: 내부 PJT / 수학의 정석"
            />
          </div>

          <!-- 분류 2 -->
          <div class="form-group">
            <label>{{ isWork ? "문의코드 (Code2)" : "유형 (Code2)" }}</label>
            <input
              type="text"
              v-model="form.code2"
              placeholder="예: REQ001 / 객관식"
            />
          </div>

          <!-- 분류 3 -->
          <div class="form-group">
            <label>{{ isWork ? "분류 (Code3)" : "구분 (Code3)" }}</label>
            <select v-if="code3Options.length > 0" v-model="form.code3">
              <option value="">선택하세요</option>
              <option
                v-for="opt in code3Options"
                :key="opt.subCode"
                :value="opt.subCode"
              >
                {{ opt.description }}
              </option>
            </select>
            <input
              v-else
              type="text"
              v-model="form.code3"
              placeholder="예: 개발 / 오답노트"
            />
          </div>

          <!-- 제목 -->
          <div class="form-group full-width">
            <label>{{
              isWork ? "문의 제목 (Title) *" : "작업 이름 (Title) *"
            }}</label>
            <input
              type="text"
              v-model="form.title"
              ref="titleInputRef"
              required
            />
          </div>

          <!-- 하위제목 -->
          <div class="form-group full-width">
            <label>{{
              isWork ? "문의 상세 (Subtitle)" : "상세 (Subtitle)"
            }}</label>
            <input type="text" v-model="form.subtitle" />
          </div>

          <!-- SGR001 (업무) 전용 필드 -->
          <template v-if="isWork">
            <div class="form-group">
              <label>요청자 (Req User)</label>
              <input type="text" v-model="form.reqUser" />
            </div>
            <div class="form-group">
              <label>담당자 (Mgr User)</label>
              <input type="text" v-model="form.mgrUser" />
            </div>
          </template>

          <!-- SGR002 (학습) 전용 필드 -->
          <template v-if="!isWork">
            <div class="form-group">
              <label>총 문항 수 (Total Qty)</label>
              <input type="number" v-model.number="form.totalQty" />
            </div>
            <div class="form-group">
              <label>맞춘 문항 수 (Pass Qty)</label>
              <input type="number" v-model.number="form.passQty" />
            </div>
            <div class="form-group full-width">
              <label>이해도 (Score)</label>
              <input
                type="number"
                v-model.number="form.score"
                placeholder="0 ~ 100"
              />
            </div>
          </template>

          <!-- 상세 내용 -->
          <div class="form-group full-width">
            <label>상세 내용 (Content)</label>
            <textarea
              v-model="form.content"
              rows="4"
              placeholder="상세한 내용을 입력하세요."
            ></textarea>
          </div>
        </div>

        <hr class="divider" />

        <!-- 2. 시간 및 설정 섹션 -->
        <h4 class="section-subtitle">시간 및 설정</h4>
        <div class="form-grid">
          <!-- 시간 설정 -->
          <div class="form-group">
            <label>시작 시간 (Start Time)</label>
            <input type="time" v-model="form.startTime" />
          </div>
          <div class="form-group">
            <label>종료 시간 (End Time)</label>
            <input type="time" v-model="form.endTime" />
          </div>

          <!-- 사용 여부 -->
          <div class="form-group">
            <label>사용 여부 (Use Y/N)</label>
            <select v-model.number="form.useYn">
              <option :value="1">사용</option>
              <option :value="0">미사용</option>
            </select>
          </div>
        </div>

        <div class="modal-footer relative">
          <div v-if="showToast" class="toast-message absolute-toast">
            <svg
              class="icon-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ toastMessage }}
          </div>

          <div class="footer-left">
            <button type="button" class="btn-cancel" @click="$emit('close')">
              <svg
                class="icon-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              닫기
            </button>
            <button
              v-if="detailData && !isCopyMode"
              type="button"
              class="btn-danger"
              @click="handleDelete"
              :disabled="isSubmitting"
            >
              <svg
                class="icon-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              삭제
            </button>
          </div>

          <div class="footer-right">
            <button
              v-if="detailData && !isCopyMode"
              type="button"
              class="btn-outline-primary"
              @click="handleSwitchToCopy"
              :disabled="isSubmitting"
              title="현재 내용을 복사하여 새로운 일정으로 등록합니다."
            >
              <svg
                class="icon-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              복사 생성
            </button>

            <button
              v-if="!detailData || isCopyMode"
              type="button"
              class="btn-secondary"
              @click="submitAndContinue"
              :disabled="isSubmitting"
            >
              <svg
                class="icon-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              저장 후 계속 등록
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              <svg
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
              {{ detailData && !isCopyMode ? "수정 저장" : "저장" }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import api from "@/services";
import { useAuthStore } from "@/stores/useAuthStore";

const props = defineProps({
  visible: Boolean,
  date: String,
  scheduleId: Number,
  schGroupCode: String,
  schYear: [String, Number],
  schMonth: [String, Number],
  detailData: { type: Object, default: null },
});

const emit = defineEmits(["close", "save-success", "save-keep-open"]);
const authStore = useAuthStore();
const isSubmitting = ref(false);
const isCopyMode = ref(false); // 복사 모드 상태 추가
const titleInputRef = ref(null); // 제목 입력칸 포커스를 위한 참조

const showToast = ref(false);
const toastMessage = ref("");

// 토스트(알림) 노출 함수
const triggerToast = (msg) => {
  toastMessage.value = msg;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 2500);
};

// SGR001 (업무 그룹) 인지 확인하여 UI를 변경합니다.
const isWork = computed(() => props.schGroupCode === "SGR001");

// 공통 코드(SYS003) 데이터를 담을 상태
const sys003Items = ref([]);

// API를 통해 SYS003 코드 목록 조회
const fetchSysCodes = async () => {
  try {
    const res = await api.get("/codes/items/SYS/SYS003");
    sys003Items.value =
      res.data.data || (Array.isArray(res.data) ? res.data : []);
  } catch (error) {
    console.error("공통 코드(SYS003) 조회 실패:", error);
  }
};

onMounted(() => {
  fetchSysCodes();
});

// Code1, Code3 옵션 필터링 (field1이 현재 그룹코드와 일치하고, field2가 각 코드명인 항목)
const code1Options = computed(() =>
  sys003Items.value.filter(
    (item) => item.field1 === props.schGroupCode && item.field2 === "CODE1",
  ),
);
const code3Options = computed(() =>
  sys003Items.value.filter(
    (item) => item.field1 === props.schGroupCode && item.field2 === "CODE3",
  ),
);

// 폼 기본값 초기화 함수
const defaultForm = () => ({
  schWeek: null,
  code1: "",
  code2: "",
  code3: "",
  title: "",
  subtitle: "",
  content: "",
  reqUser: "",
  mgrUser: "",
  startTime: "",
  endTime: "",
  totalQty: 0,
  passQty: 0,
  score: 0,
  useYn: 1,
});

const form = ref(defaultForm());

// 신규 폼 기본값 및 시간 자동 설정 분리 (연속 등록 시 재활용)
const initDefaults = (targetDate) => {
  form.value = defaultForm();
  if (targetDate) {
    const [year, month, day] = targetDate.split("-");
    const selectedDateObj = new Date(year, month - 1, day);

    const firstDay = new Date(year, month - 1, 1).getDay();
    form.value.schWeek = Math.ceil((selectedDateObj.getDate() + firstDay) / 7);

    const now = new Date();
    form.value.startTime = extractTimeLocal(now);
    now.setHours(now.getHours() + 1);
    form.value.endTime = extractTimeLocal(now);
  }
};

// 모달이 열릴 때마다 폼을 초기화합니다.
watch(
  () => props.visible,
  (newVal) => {
    isCopyMode.value = false; // 모달이 열릴 때 복사 모드 초기화
    if (newVal) {
      // 기존 데이터가 전달된 경우 (수정/상세 모드)
      if (props.detailData) {
        form.value = { ...defaultForm(), ...props.detailData };

        // 안전한 함수를 통해 시간만 정확하게 추출
        if (form.value.startTime) {
          form.value.startTime = extractTimeLocal(form.value.startTime);
        }
        if (form.value.endTime) {
          form.value.endTime = extractTimeLocal(form.value.endTime);
        }
      } else {
        // 신규 등록 모드
        initDefaults(props.date);
      }
    }
  },
);

const handleSwitchToCopy = () => {
  isCopyMode.value = true;
  triggerToast("복사 모드로 전환되었습니다. 내용을 수정 후 저장해주세요.");
};

const executeSubmit = async (closeAfterSave = true) => {
  if (!props.scheduleId) {
    alert("마스터 일정 ID가 없습니다. 화면을 새로고침 해주세요.");
    return;
  }

  isSubmitting.value = true;
  try {
    // props.date에서 연/월/일 추출 (예외 상황 대비 안전한 처리)
    let year = props.schYear;
    let month = String(props.schMonth).padStart(2, "0");
    if (props.date && props.date.includes("-")) {
      [year, month] = props.date.split("-");
    }

    const payload = {
      ...form.value,
      scheduleId: props.scheduleId,
      schGroupCode: props.schGroupCode,
      schYear: year,
      schMonth: month,
      schDate: props.date,
      createdBy: authStore.user?.userId || "SYSTEM",
    };

    // DB 포맷에 가장 호환성이 좋은 "YYYY-MM-DD HH:mm:ss" 형태로 결합
    payload.startTime = form.value.startTime
      ? `${props.date} ${form.value.startTime}:00`
      : null;
    payload.endTime = form.value.endTime
      ? `${props.date} ${form.value.endTime}:00`
      : null;

    // 수정(PUT) 또는 등록(POST) 분기
    if (props.detailData && props.detailData.id && !isCopyMode.value) {
      await api.put(`/schedule-details/${props.detailData.id}`, payload);
    } else {
      await api.post("/schedule-details", payload);
    }

    if (closeAfterSave) {
      emit("save-success"); // 기존 방식 (창 닫고 부모 조회)
    } else {
      emit("save-keep-open"); // 모달 유지 & 부모 캘린더 갱신
      triggerToast("저장되었습니다. 이어서 등록해주세요.");
      initDefaults(props.date); // 내용 비우기
      isCopyMode.value = false; // 연속 등록 시 폼이 비워지므로 다시 일반 신규 모드로
      nextTick(() => {
        if (titleInputRef.value) titleInputRef.value.focus(); // 제목창으로 포커스
      });
    }
  } catch (error) {
    console.error("상세 일정 등록 오류:", error);
    alert("등록 중 오류가 발생했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

const handleSubmit = () => executeSubmit(true); // 일반 저장(엔터, 저장버튼)
const submitAndContinue = () => executeSubmit(false); // 연속 등록

// 삭제 처리 함수
const handleDelete = async () => {
  if (!confirm("이 상세 일정을 삭제하시겠습니까?")) return;

  isSubmitting.value = true;
  try {
    await api.delete(`/schedule-details/${props.detailData.id}`);
    emit("save-success");
  } catch (error) {
    console.error("상세 일정 삭제 오류:", error);
    alert("삭제 중 오류가 발생했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

// 강력한 시간 포맷팅 헬퍼 함수 (어떤 형태의 값이 오든 HH:mm 추출)
const extractTimeLocal = (dateVal) => {
  if (!dateVal) return "";

  // 이미 "HH:mm" 형태인 경우 그대로 반환
  if (
    typeof dateVal === "string" &&
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(dateVal)
  )
    return dateVal;
  // "HH:mm:ss" 형태인 경우 초를 자르고 반환
  if (
    typeof dateVal === "string" &&
    /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)/.test(dateVal)
  )
    return dateVal.substring(0, 5);

  let dateObj = dateVal;
  if (typeof dateVal === "string") {
    // DB에서 "YYYY-MM-DD HH:mm:ss" 형태로 왔을 때 크로스 브라우저 처리를 위해 공백을 T로 치환
    dateObj = new Date(dateVal.replace(" ", "T"));
  }

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return "";

  const hh = String(dateObj.getHours()).padStart(2, "0");
  const min = String(dateObj.getMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 700px;
  border-radius: 16px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.35rem;
  color: #0f172a;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.modal-body {
  padding: 1.5rem 1.75rem;
  overflow-y: auto;
}

.section-subtitle {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.divider {
  border: none;
  border-top: 1px dashed #cbd5e1;
  margin: 2rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.full-width {
  grid-column: 1 / -1;
}

label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
}

input,
textarea,
select {
  padding: 0.65rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  color: #1e293b;
  background-color: #f8fafc;
}

input::placeholder,
textarea::placeholder {
  color: #94a3b8;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  background-color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.modal-footer {
  position: relative;
  padding: 1rem 1.75rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
  border-radius: 0 0 16px 16px;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  box-sizing: border-box;
}

.icon-sm {
  width: 1.1rem;
  height: 1.1rem;
}

.text-blue-500 {
  color: #3b82f6;
}

.btn-cancel {
  height: 38px;
  padding: 0 1.1rem;
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-primary {
  height: 38px;
  padding: 0 1.1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  background: #93c5fd;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-secondary {
  height: 38px;
  padding: 0 1.1rem;
  background: #e2e8f0;
  color: #334155;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-secondary:hover:not(:disabled) {
  background: #cbd5e1;
}

.btn-outline-primary {
  height: 38px;
  padding: 0 1.1rem;
  background: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-outline-primary:hover:not(:disabled) {
  background: #eff6ff;
}

.btn-danger {
  height: 38px;
  padding: 0 1.1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.absolute-toast {
  position: absolute;
  top: -3.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 9999px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  font-size: 0.85rem;
  z-index: 10;
  animation: fadeInOutToast 2.5s ease-in-out forwards;
}

@keyframes fadeInOutToast {
  0% {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  15% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  85% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
