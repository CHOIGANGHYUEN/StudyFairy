<template>
  <div class="admin-container">
    <PageTitle>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </template>
    </PageTitle>

    <!-- Form Section -->
    <section class="card-section">
      <div class="card-header flex justify-between items-center">
        <h2 class="section-title">
          {{ isEditMode ? "일정 정보 수정" : "새 일정 등록" }}
        </h2>
        <button
          v-if="isEditMode"
          @click="resetForm"
          class="text-sm font-medium text-blue-600 hover:underline"
        >
          취소 및 신규 전환
        </button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label for="schGroupCode">일정 그룹 (Group Code) *</label>
            <select
              id="schGroupCode"
              v-model="form.schGroupCode"
              required
              :disabled="isSubmitting"
            >
              <option value="" disabled>그룹을 선택하세요</option>
              <!-- API에서 코드를 불러오지 못했을 때를 대비한 기본값 -->
              <option v-if="sys001Items.length === 0" value="SGR001">
                업무 (SGR001)
              </option>
              <option v-if="sys001Items.length === 0" value="SGR002">
                학습 (SGR002)
              </option>
              <!-- API 연동 시 출력될 코드 -->
              <option
                v-for="item in sys001Items"
                :key="item.subCode"
                :value="item.subCode"
              >
                {{ item.description || item.subCode }} ({{ item.subCode }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="userId">사용자 ID *</label>
            <input
              type="text"
              id="userId"
              v-model="form.userId"
              required
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-group" v-if="!isEditMode">
            <label for="schYear">대상 연도 (Year) *</label>
            <select
              id="schYear"
              v-model="form.schYear"
              required
              :disabled="isSubmitting"
            >
              <option v-for="y in yearOptions" :key="y" :value="String(y)">
                {{ y }}년
              </option>
            </select>
          </div>

          <div class="form-group" v-if="!isEditMode">
            <label for="schMonth">대상 월 (Month) *</label>
            <select
              id="schMonth"
              v-model="form.schMonth"
              required
              :disabled="isSubmitting"
            >
              <option
                v-for="m in 12"
                :key="m"
                :value="String(m).padStart(2, '0')"
              >
                {{ m }}월
              </option>
            </select>
          </div>

          <div class="form-group" v-if="isEditMode">
            <label for="schDate">일정 일자 (Date) *</label>
            <input
              type="date"
              id="schDate"
              v-model="form.schDate"
              required
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-group">
            <label for="schCode">일정 코드 (Schedule Code)</label>
            <select
              id="schCode"
              v-model="form.schCode"
              :disabled="isSubmitting"
            >
              <option value="">선택 안함</option>
              <option
                v-for="item in sys002Items"
                :key="item.subCode"
                :value="item.subCode"
              >
                {{ item.description || item.subCode }} ({{ item.subCode }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="useYn">사용 여부</label>
            <select
              id="useYn"
              v-model.number="form.useYn"
              :disabled="isSubmitting"
            >
              <option :value="1">사용</option>
              <option :value="0">미사용</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          class="btn-primary"
          :disabled="
            isSubmitting ||
            !form.schGroupCode ||
            !form.userId ||
            (isEditMode ? !form.schDate : !form.schYear || !form.schMonth)
          "
        >
          {{
            isSubmitting ? "처리 중..." : isEditMode ? "수정하기" : "등록하기"
          }}
        </button>
      </form>
    </section>

    <!-- Table Section -->
    <section class="card-section list-section">
      <div class="card-header list-header">
        <h2 class="section-title">등록된 일정 마스터 목록</h2>
        <span class="badge">{{ schedules.length }}건</span>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="w-16">ID</th>
              <th>그룹 코드</th>
              <th>사용자 ID</th>
              <th>일자</th>
              <th>일정 코드</th>
              <th class="w-24 text-center">상태</th>
              <th class="w-24 text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in schedules" :key="item.id">
              <td>{{ item.id }}</td>
              <td class="font-bold text-purple-700">{{ item.schGroupCode }}</td>
              <td class="font-bold text-blue-700">{{ item.userId }}</td>
              <td>{{ formatDateOnly(item.schDate) }}</td>
              <td>{{ item.schCode || "-" }}</td>
              <td class="text-center">
                <span
                  :class="[
                    'status-badge',
                    item.useYn === 1 ? 'active' : 'inactive',
                  ]"
                >
                  {{ item.useYn === 1 ? "사용" : "미사용" }}
                </span>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button
                    @click="editSchedule(item)"
                    class="btn-icon"
                    :disabled="isSubmitting"
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button
                    @click="deleteSchedule(item.id)"
                    class="btn-icon"
                    :disabled="isSubmitting"
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="schedules.length === 0">
              <td colspan="7" class="empty-state">등록된 일정이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/service/api";
import PageTitle from "@/components/PageTitle.vue";

const authStore = useAuthStore();

const isSubmitting = ref(false);
const isEditMode = ref(false);
const editTargetId = ref(null);

const currentYear = new Date().getFullYear();
const yearOptions = ref([currentYear - 1, currentYear, currentYear + 1]);

const schedules = ref([]);
const sys001Items = ref([]); // SGR001, SGR002 등
const sys002Items = ref([]); // schCode 항목들

const form = ref({
  schGroupCode: "",
  userId: authStore.user?.userId || "",
  schYear: String(currentYear),
  schMonth: String(new Date().getMonth() + 1).padStart(2, "0"),
  schDate: "",
  schCode: "",
  useYn: 1,
});

onMounted(async () => {
  await fetchCodes();
  await fetchSchedules();
});

const fetchCodes = async () => {
  try {
    // Category SYS 아래에 Group SYS001, SYS002가 존재한다고 가정하여 API 호출
    const [res1, res2] = await Promise.all([
      api.get("/codes/items/SYS/SYS001").catch(() => ({ data: [] })),
      api.get("/codes/items/SYS/SYS002").catch(() => ({ data: [] })),
    ]);
    sys001Items.value = res1.data;
    sys002Items.value = res2.data;
  } catch (error) {
    console.error("공통 코드 조회 실패:", error);
  }
};

const fetchSchedules = async () => {
  try {
    const res = await api.get("/schedules");
    schedules.value = res.data;
  } catch (error) {
    console.error("일정 목록 조회 실패:", error);
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      const [year, month] = form.value.schDate.split("-");
      const payload = {
        ...form.value,
        schYear: year,
        schMonth: month,
        schCode: form.value.schCode || null,
        changedBy: authStore.user?.userId || "SYSTEM",
      };
      await api.put(`/schedules/${editTargetId.value}`, payload);
      alert("일정이 수정되었습니다.");
    } else {
      const year = parseInt(form.value.schYear);
      const month = parseInt(form.value.schMonth);
      const daysInMonth = new Date(year, month, 0).getDate();

      const bulkPayload = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        bulkPayload.push({
          ...form.value,
          schDate: dateStr,
          schYear: String(year),
          schMonth: String(month).padStart(2, "0"),
          schCode: form.value.schCode || null,
          createdBy: authStore.user?.userId || "SYSTEM",
          changedBy: authStore.user?.userId || "SYSTEM",
        });
      }
      await api.post("/schedules/bulk", bulkPayload);
      alert(`${year}년 ${month}월의 일정이 일괄 등록되었습니다.`);
    }

    resetForm();
    await fetchSchedules();
  } catch (error) {
    const message = error.response?.data?.message || "작업 실패";
    alert(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const editSchedule = (item) => {
  isEditMode.value = true;
  editTargetId.value = item.id;
  form.value = {
    schGroupCode: item.schGroupCode,
    userId: item.userId,
    schYear: item.schYear || String(currentYear),
    schMonth:
      item.schMonth || String(new Date().getMonth() + 1).padStart(2, "0"),
    schDate: formatDateOnly(item.schDate), // YYYY-MM-DD 형식으로 바인딩
    schCode: item.schCode || "",
    useYn: item.useYn,
  };
  window.scrollTo(0, 0);
};

const deleteSchedule = async (id) => {
  if (
    !confirm(
      "정말 이 일정을 삭제하시겠습니까? 연관된 세부 일정도 모두 삭제됩니다.",
    )
  )
    return;
  isSubmitting.value = true;
  try {
    await api.delete(`/schedules/${id}`);
    alert("삭제되었습니다.");
    if (isEditMode.value && editTargetId.value === id) resetForm();
    await fetchSchedules();
  } catch (error) {
    const message = error.response?.data?.message || "삭제 실패";
    alert(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  isEditMode.value = false;
  editTargetId.value = null;
  form.value = {
    schGroupCode: "",
    userId: authStore.user?.userId || "",
    schYear: String(currentYear),
    schMonth: String(new Date().getMonth() + 1).padStart(2, "0"),
    schDate: "",
    schCode: "",
    useYn: 1,
  };
};

const formatDateOnly = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
</script>

<style scoped>
.icon {
  color: #f59e0b;
  width: 1.5rem;
  height: 1.5rem;
}
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.badge {
  background-color: #fef3c7;
  color: #d97706;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.table-container {
  overflow-x: auto;
}
.data-table tr:hover td {
  background-color: #f8fafc;
}
.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: #94a3b8;
}
.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}
.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}
.status-badge.inactive {
  background-color: #f1f5f9;
  color: #475569;
}
.text-purple-700 {
  color: #7e22ce;
}
.text-blue-700 {
  color: #1d4ed8;
}
</style>
