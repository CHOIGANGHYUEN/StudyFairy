<template>
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
          @keyup.enter="$emit('search')"
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
          <option v-for="m in 12" :key="m" :value="String(m).padStart(2, '0')">
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
          @keyup.enter="$emit('search')"
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
      <button class="btn-primary search-btn" @click="$emit('search')">
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
</template>

<script setup>
defineProps({
  searchParams: Object,
  sys001Items: Array,
  yearOptions: Array,
  minSchDate: String,
  maxSchDate: String,
});
defineEmits(["search"]);
</script>

<style scoped>
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
