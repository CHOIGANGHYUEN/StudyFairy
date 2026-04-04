<template>
  <div class="admin-container list-layout">
    <PageTitle />

    <!-- 1. 검색 조건 영역 -->
    <section class="search-area">
      <select class="search-select">
        <option value="all">전체 검색</option>
        <option value="code">코드 검색</option>
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
          :disabled="selectedRows.length === 0 && !selectedRow"
        >
          삭제
        </button>
      </div>
    </section>

    <!-- 2. 조회 결과 영역 -->
    <section class="result-area">
      <div class="result-header">
        <h2 class="result-title">데이터 조회 결과</h2>
        <span class="badge badge-blue">총 {{ items.length }}건</span>
      </div>
      <div class="result-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="w-12 text-center">
                <input
                  type="checkbox"
                  @change="handleToggleAll"
                  :checked="isAllSelected"
                />
              </th>
              <th class="w-16 text-center">ID</th>
              <th>데이터 명칭</th>
              <th>속성 값</th>
              <th class="w-24 text-center">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in paginatedItems"
              :key="item.id"
              :class="{ selected: selectedRow?.id === item.id }"
              @click="selectRow(item)"
            >
              <td class="text-center" @click.stop>
                <input
                  type="checkbox"
                  :value="item.id"
                  v-model="selectedRows"
                />
              </td>
              <td class="text-center">{{ item.id }}</td>
              <td class="font-bold text-blue-700">{{ item.name }}</td>
              <td>{{ item.value }}</td>
              <td class="text-center">
                <span
                  :class="[
                    'status-badge',
                    item.isActive ? 'active' : 'inactive',
                  ]"
                >
                  {{ item.isActive ? "사용" : "미사용" }}
                </span>
              </td>
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
import { useEmptyLogic } from "./emptyLogic";

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
  selectedRows,
  selectedRow,
  selectRow,
  isAllSelected,
  handleToggleAll,
} = useEmptyLogic();
</script>
