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
import { useScheduleManagement } from "@/composables/useScheduleManagement";
import PageTitle from "@/components/common/PageTitle.vue";
import Pagination from "@/components/common/Pagination.vue";

const {
  isSubmitting,
  isEditMode,
  yearOptions,
  schedules,
  sys001Items,
  sys002Items,
  searchParams,
  minSchDate,
  maxSchDate,
  form,
  currentPage,
  totalPages,
  handlePageChange,
  handleSearch,
  handleSubmit,
  editSchedule,
  deleteSchedule,
  resetForm,
  formatDateOnly,
} = useScheduleManagement();
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
