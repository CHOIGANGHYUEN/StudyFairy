<template>
  <section class="card-section list-section">
    <div class="card-header list-header">
      <h2 class="section-title">등록된 매핑 목록</h2>
      <span class="badge">{{ totalCount }}건</span>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-16">ID</th>
            <th>권한 ID (Role)</th>
            <th>메뉴 ID (Menu)</th>
            <th class="w-24 text-center">상태</th>
            <th>생성일시</th>
            <th class="w-24 text-center">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in mappings" :key="item.id">
            <td>{{ item.id }}</td>
            <td class="font-bold text-purple-700">{{ item.roleId }}</td>
            <td class="font-bold text-blue-700">{{ item.menuId }}</td>
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
            <td>{{ formatDate(item.createdAt) }}</td>
            <td class="text-center">
              <div class="action-buttons">
                <button
                  @click="emit('copy', item)"
                  class="btn-icon"
                  :disabled="isSubmitting"
                  title="참조생성"
                >
                  📄
                </button>
                <button
                  @click="emit('edit', item)"
                  class="btn-icon"
                  :disabled="isSubmitting"
                  title="수정"
                >
                  ✏️
                </button>
                <button
                  @click="emit('delete', item.id)"
                  class="btn-icon"
                  :disabled="isSubmitting"
                  title="삭제"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="mappings.length === 0">
            <td colspan="6" class="empty-state">
              등록된 매핑 정보가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination-wrapper" v-if="totalPages > 1">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="emit('pageChange', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import Pagination from "@/components/common/Pagination.vue";

defineProps({
  mappings: Array,
  isSubmitting: Boolean,
  totalCount: Number,
  currentPage: Number,
  totalPages: Number,
  formatDate: Function,
});

const emit = defineEmits(["copy", "edit", "delete", "pageChange"]);
</script>

<style scoped>
/* Add your styles here */
</style>
