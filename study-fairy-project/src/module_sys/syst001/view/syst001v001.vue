<template>
  <div class="admin-container list-layout">
    <PageTitle />

    <section class="search-area">
      <select class="search-select">
        <option value="userId">사용자 ID</option>
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
          @click="goToDetail(selectedRow?.id, 'view')"
          :disabled="!selectedRow"
        >
          상세
        </button>
        <button
          class="btn btn-outline"
          @click="goToDetail(selectedRow?.id, 'edit')"
          :disabled="!selectedRow"
        >
          수정
        </button>
        <button
          class="btn btn-danger"
          @click="handleDelete(selectedRow?.id)"
          :disabled="!selectedRow"
        >
          삭제
        </button>
      </div>
    </section>

    <section class="result-area">
      <div class="result-header">
        <h2 class="result-title">사용자 조회 결과</h2>
        <span class="badge badge-blue">총 {{ users.length }}건</span>
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
              <th>사용자 ID</th>
              <th>생성자</th>
              <th>생성일시</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in paginatedUsers"
              :key="user.id"
              :class="{ selected: selectedRow?.id === user.id }"
              @click="selectRow(user)"
            >
              <td class="text-center" @click.stop>
                <input
                  type="checkbox"
                  :value="user.id"
                  v-model="selectedRows"
                />
              </td>
              <td class="text-center">{{ user.id }}</td>
              <td class="font-bold text-blue-700">{{ user.userId }}</td>
              <td>{{ user.createdBy || "-" }}</td>
              <td>{{ formatDate(user.createdAt) }}</td>
            </tr>
            <tr v-if="paginatedUsers.length === 0">
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
import { useSyst001v001 } from "../function/syst001f001";

const {
  searchKeyword,
  users,
  paginatedUsers,
  currentPage,
  totalPages,
  handleSearch,
  handlePageChange,
  goToDetail,
  goToCreate,
  handleAdd,
  handleDelete,
  formatDate,
  selectedRows,
  selectedRow,
  selectRow,
  isAllSelected,
  handleToggleAll,
} = useSyst001v001();
</script>
