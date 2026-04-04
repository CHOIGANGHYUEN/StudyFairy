<template>
  <div class="admin-container list-layout">
    <PageTitle />
    <section class="search-area">
      <select class="search-select">
        <option value="menuNm">메뉴명</option>
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
        <h2 class="result-title">메뉴 조회 결과</h2>
        <span class="badge badge-blue">총 {{ items.length }}건</span>
      </div>
      <div class="result-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>메뉴 ID</th>
              <th>메뉴명 (레벨)</th>
              <th>경로</th>
              <th class="w-20 text-center">순번</th>
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
              <td class="font-bold">{{ item.menuId }}</td>
              <td
                :style="{ paddingLeft: `${(item.menuLevel - 1) * 20 + 12}px` }"
              >
                <span v-if="item.menuLevel > 1" class="text-gray-400 mr-1"
                  >└
                </span>
                {{ item.menuNm }}
                <span class="text-xs text-gray-500"
                  >({{ item.menuLevel }}단)</span
                >
              </td>
              <td>{{ item.path || "-" }}</td>
              <td class="text-center">{{ item.ordNum }}</td>
              <td class="text-center">
                <span
                  :class="[
                    'status-badge',
                    item.useYn === 1 ? 'active' : 'inactive',
                  ]"
                  >{{ item.useYn === 1 ? "사용" : "미사용" }}</span
                >
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
import { useSyst003v001 } from "../function/syst003f001";
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
} = useSyst003v001();
</script>
