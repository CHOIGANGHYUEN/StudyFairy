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

    <!-- Search Section -->
    <section class="card-section search-section">
      <div class="search-grid">
        <div class="form-group">
          <label for="searchSchGroupCode">일정 그룹 (Group)</label>
          <select id="searchSchGroupCode" v-model="searchParams.schGroupCode">
            <option value="">전체</option>
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
          <label for="searchUserId">사용자 ID</label>
          <input
            type="text"
            id="searchUserId"
            v-model="searchParams.userId"
            placeholder="예: admin"
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="form-group">
          <label for="searchSchYear">연도 (Year)</label>
          <select id="searchSchYear" v-model="searchParams.schYear">
            <option value="">전체</option>
            <option v-for="y in yearOptions" :key="y" :value="String(y)">
              {{ y }}년
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="searchSchMonth">월 (Month)</label>
          <select id="searchSchMonth" v-model="searchParams.schMonth">
            <option value="">전체</option>
            <option
              v-for="m in 12"
              :key="m"
              :value="String(m).padStart(2, '0')"
            >
              {{ m }}월
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="searchSchDate">일자 (Date)</label>
          <input
            type="date"
            id="searchSchDate"
            v-model="searchParams.schDate"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <div class="search-actions">
        <div class="date-summary">
          <span class="summary-label">최초등록일:</span>
          <span class="summary-value">{{ minSchDate }}</span>
          <span class="summary-divider">|</span>
          <span class="summary-label">최종등록일:</span>
          <span class="summary-value">{{ maxSchDate }}</span>
        </div>
        <button class="btn-primary search-btn" @click="handleSearch">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon-sm"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          조회
        </button>
      </div>
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

      <!-- 페이징 컴포넌트 영역 -->
      <div class="pagination-wrapper" v-if="totalPages > 0">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="handlePageChange"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/service/api";
import PageTitle from "@/components/PageTitle.vue";
import Pagination from "@/components/Pagination.vue";

const authStore = useAuthStore();

// Pagination State
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const pageSize = 10; // Number of items per page

const isSubmitting = ref(false);
const isEditMode = ref(false);
const editTargetId = ref(null);

const currentYear = new Date().getFullYear();
const yearOptions = ref([currentYear - 1, currentYear, currentYear + 1]);

const schedules = ref([]);
const sys001Items = ref([]); // SGR001, SGR002 등
const sys002Items = ref([]); // schCode 항목들

const searchParams = ref({
  schGroupCode: "",
  userId: "",
  schYear: "",
  schMonth: "",
  schDate: "",
});

const minSchDate = ref("-");
const maxSchDate = ref("-");

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
  await fetchMinMaxDates();
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

const fetchSchedules = async (page = 1) => {
  try {
    const res = await api.get("/schedules", {
      params: {
        page: page,
        limit: pageSize,
        ...(searchParams.value.schGroupCode && {
          schGroupCode: searchParams.value.schGroupCode,
        }),
        ...(searchParams.value.userId && { userId: searchParams.value.userId }),
        ...(searchParams.value.schYear && {
          schYear: searchParams.value.schYear,
        }),
        ...(searchParams.value.schMonth && {
          schMonth: searchParams.value.schMonth,
        }),
        ...(searchParams.value.schDate && {
          schDate: searchParams.value.schDate,
        }),
      },
    });

    // 백엔드 응답이 페이징 객체인지 단순 배열인지 확인하여 분기 처리 (조회 안 되는 버그 수정)
    if (res.data && res.data.data) {
      schedules.value = res.data.data;
      totalPages.value = res.data.totalPages || 1;
      totalCount.value = res.data.totalCount || res.data.data.length;
    } else if (Array.isArray(res.data)) {
      // 배열 전체가 반환될 경우 프론트엔드에서 페이징(slice) 처리
      const allData = res.data;
      totalCount.value = allData.length;
      totalPages.value = Math.ceil(allData.length / pageSize) || 1;
      schedules.value = allData.slice((page - 1) * pageSize, page * pageSize);
    } else {
      schedules.value = [];
      totalPages.value = 1;
      totalCount.value = 0;
    }

    currentPage.value = page;
  } catch (error) {
    console.error("일정 목록 조회 실패:", error);
    schedules.value = [];
    totalPages.value = 1;
    totalCount.value = 0;
  }
};

const fetchMinMaxDates = async () => {
  try {
    // 년도, 월, 일 필터를 무시하고 오직 그룹코드와 사용자ID만으로 전체 일정의 최소/최대 값을 구함
    const params = {};
    if (searchParams.value.schGroupCode)
      params.schGroupCode = searchParams.value.schGroupCode;
    if (searchParams.value.userId) params.userId = searchParams.value.userId;

    // 백엔드 집계 API 호출
    const res = await api.get("/schedules/min-max", { params });
    const { minSchDate: minD, maxSchDate: maxD } = res.data;

    minSchDate.value = minD ? formatDateOnly(minD) : "-";
    maxSchDate.value = maxD ? formatDateOnly(maxD) : "-";
  } catch (error) {
    console.error("최초/최종 등록일 조회 실패:", error);
    minSchDate.value = "-";
    maxSchDate.value = "-";
  }
};

const handlePageChange = (page) => {
  fetchSchedules(page);
};

const handleSearch = () => {
  fetchSchedules(1);
  fetchMinMaxDates();
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
    await fetchMinMaxDates(); // 일괄 등록/수정 후 최소/최대 일자 갱신
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
    await fetchMinMaxDates(); // 삭제 후 갱신
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
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
}

/* Search Section Styles */
.search-section {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
}
.search-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}
.search-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
.date-summary {
  font-size: 0.95rem;
  color: #475569;
  background: #f8fafc;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.summary-label {
  font-weight: 700;
  color: #334155;
}
.summary-value {
  font-weight: 600;
  color: #2563eb;
  margin-left: 0.25rem;
}
.summary-divider {
  margin: 0 0.75rem;
  color: #cbd5e1;
}
.search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
}
.icon-sm {
  width: 1.2rem;
  height: 1.2rem;
}
@media (max-width: 1024px) {
  .search-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .search-grid {
    grid-template-columns: 1fr;
  }
  .search-actions {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
