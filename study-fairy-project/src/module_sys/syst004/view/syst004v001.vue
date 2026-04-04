<template>
  <div class="admin-container list-layout max-w-1500">
    <PageTitle />
    <section class="search-area">
      <select class="search-select" v-model="searchLangu">
        <option value="KO">한국어</option>
        <option value="EN">영어</option>
      </select>
      <select class="search-select" v-model="selectedDbms">
        <option value="MySQL">MySQL</option>
        <option value="PostgreSQL">PostgreSQL</option>
        <option value="Oracle">Oracle</option>
      </select>
      <input
        type="text"
        v-model="searchKeyword"
        placeholder="테이블명 또는 모듈을 검색하세요."
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
        <h2 class="result-title">테이블 조회 결과</h2>
        <span class="badge badge-yellow">총 {{ items.length }}건</span>
      </div>
      <div class="result-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>테이블 ID (물리명)</th>
              <th>모듈</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in paginatedItems"
              :key="item.tablen"
              :class="{ selected: selectedRow?.tablen === item.tablen }"
              @click="selectRow(item)"
            >
              <td class="font-bold">{{ item.tablen }}</td>
              <td>{{ item.module }}</td>
              <td>
                <span
                  v-if="item.dbStatus === 'NOT_CREATED'"
                  class="badge badge-red"
                  >미생성</span
                >
                <span v-else-if="item.isModified" class="badge badge-yellow"
                  >변경됨</span
                >
                <span v-else class="badge badge-green">정상</span>
              </td>
            </tr>
            <tr v-if="paginatedItems.length === 0">
              <td colspan="3" class="empty-state">조회된 데이터가 없습니다.</td>
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
import { useSyst004v001 } from "./syst004f001";
const {
  searchLangu,
  selectedDbms,
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
} = useSyst004v001();
</script>
