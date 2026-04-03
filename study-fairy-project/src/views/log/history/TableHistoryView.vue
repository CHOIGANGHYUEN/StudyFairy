<template>
  <div class="table-history-container">
    <PageTitle>
      <template #icon>
        <svg
          class="w-6 h-6 text-primary-color"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </template>
      <template #subtitle>테이블 구조의 변경 이력을 조회하고 추적합니다.</template>
    </PageTitle>

    <!-- 검색 필터 컴포넌트 -->
    <TableHistorySearch 
      v-model="filters" 
      @search="onSearch" 
    />

    <!-- 데이터 목록 컴포넌트 -->
    <TableHistoryList
      :histories="histories"
      :current-page="filters.page"
      :total-pages="totalPages"
      @open-detail="openDetail"
      @page-change="onPageChange"
    />

    <!-- 상세 모달 컴포넌트 -->
    <TableHistoryDetailModal
      v-if="selectedItem"
      :item="selectedItem"
      @close="closeDetail"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getTableHistories } from "@/service/tableHistoryService";
import PageTitle from "@/components/PageTitle.vue";
import TableHistorySearch from "@/components/log/history/TableHistorySearch.vue";
import TableHistoryList from "@/components/log/history/TableHistoryList.vue";
import TableHistoryDetailModal from "@/components/log/history/TableHistoryDetailModal.vue";

const filters = ref({
  tablen: "",
  targetType: "",
  actionType: "",
  isApplied: "",
  page: 1,
  size: 20,
});

const histories = ref([]);
const totalPages = ref(1);
const selectedItem = ref(null);

onMounted(() => {
  fetchHistories();
});

// 검색 실행 시 첫 페이지로 초기화
function onSearch() {
  filters.value.page = 1;
  fetchHistories();
}

async function fetchHistories() {
  try {
    const res = await getTableHistories(filters.value);
    histories.value = res.data?.rows || res.rows || [];
    const total = res.data?.total || res.total || 0;
    totalPages.value = Math.ceil(total / filters.value.size) || 1;
  } catch (error) {
    console.error("이력 조회 중 오류 발생:", error);
  }
}

function onPageChange(page) {
  filters.value.page = page;
  fetchHistories();
}

function openDetail(item) {
  selectedItem.value = item;
}

function closeDetail() {
  selectedItem.value = null;
}
</script>

<style scoped>
.table-history-container {
  display: flex;
  flex-direction: column;
  gap: 0; /* PageTitle 자체에 margin-bottom이 있음 */
}
</style>