<template>
  <div class="admin-container list-layout">
    <PageTitle />
    <section class="search-area">
      <select class="search-select">
        <option value="roleId">권한 ID</option>
      </select>
      <input
        type="text"
        v-model="searchKeyword"
        placeholder="검색어를 입력하세요."
        @keyup.enter="handleSearch"
        class="search-input"
      />
      <div class="search-btn-area">
        <button class="btn btn-primary" @click="handleSearch">조회</button>
        <button class="btn btn-secondary" @click="goToCreate">추가</button>
        <button
          class="btn btn-outline"
          @click="goToDetail('view')"
          :disabled="!selectedRow"
        >
          상세
        </button>
        <button
          class="btn btn-outline"
          @click="goToDetail('edit')"
          :disabled="!selectedRow"
        >
          수정
        </button>
        <button
          class="btn btn-danger"
          @click="handleDelete"
          :disabled="!selectedRow"
        >
          삭제
        </button>
      </div>
    </section>

    <section class="result-area">
      <div class="result-header">
        <h2 class="result-title">권한 조회 결과</h2>
        <span class="badge badge-purple">총 {{ items.length }}건</span>
      </div>
      <div class="result-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="w-16 text-center">ID</th>
              <th>권한 ID</th>
              <th>설명</th>
              <th class="w-24 text-center">상태</th>
              <th>생성일시</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in paginatedItems"
              :key="item.id"
              :class="{ selected: selectedRow?.id === item.id }"
              @click="selectRow(item)"
            >
              <td class="text-center">{{ item.id }}</td>
              <td class="font-bold text-purple-700">{{ item.roleId }}</td>
              <td>{{ item.description }}</td>
              <td class="text-center">
                <span
                  :class="[
                    'status-badge',
                    item.useYn === 1 ? 'active' : 'inactive',
                  ]"
                  >{{ item.useYn === 1 ? "사용" : "미사용" }}</span
                >
              </td>
              <td>{{ formatDate(item.createdAt) }}</td>
            </tr>
            <tr v-if="paginatedItems.length === 0">
              <td colspan="5" class="empty-state">조회된 데이터가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="result-pagination">
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
import PageTitle from "@/components/PageTitle.vue";
import Pagination from "@/components/Pagination.vue";
import { useSyst002v011 } from "../function/syst002f011";

const {
  searchKeyword,
  items,
  paginatedItems,
  currentPage,
  totalPages,
  handleSearch,
  handlePageChange,
  goToDetail,
  goToCreate,
  handleDelete,
  selectedRow,
  selectRow,
  formatDate,
} = useSyst002v011();
</script>

<style scoped>
.text-purple-700 {
  color: #7e22ce;
}
</style>
