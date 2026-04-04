<template>
  <section class="card-section">
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-16 text-center">확장</th>
            <th class="w-16">ID</th>
            <th>메뉴 체계 (레벨/명칭/ID)</th>
            <th class="w-20 text-center">순번</th>
            <th class="w-24 text-center">상태</th>
            <th class="w-24 text-center">관리</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="l1 in paginatedMenus" :key="l1.id">
            <tr class="row-l1">
              <td class="text-center">
                <button
                  v-if="l1.children && l1.children.length"
                  @click="emit('toggle', l1.menuId)"
                  class="toggle-btn"
                >
                  {{ expandedMenus.includes(l1.menuId) ? "▼" : "▶" }}
                </button>
              </td>
              <td>{{ l1.id }}</td>
              <td class="font-bold">
                <span class="badge l1">대</span> {{ l1.menuNm }}
                <span class="mid">{{ l1.menuId }}</span>
              </td>
              <td class="text-center font-bold text-blue-600">
                {{ l1.ordNum }}
              </td>
              <td class="text-center">
                <span
                  :class="[
                    'status-badge',
                    l1.useYn === 1 ? 'active' : 'inactive',
                  ]"
                  >{{ l1.useYn === 1 ? "사용" : "미사용" }}</span
                >
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button @click="emit('edit', l1)" class="btn-icon">✏️</button>
                  <button @click="emit('delete', l1.id)" class="btn-icon">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <template v-if="expandedMenus.includes(l1.menuId)">
              <template v-for="l2 in l1.children" :key="l2.id">
                <tr class="row-l2">
                  <td class="text-center">
                    <button
                      v-if="l2.children && l2.children.length"
                      @click="emit('toggle', l2.menuId)"
                      class="toggle-btn"
                    >
                      {{ expandedMenus.includes(l2.menuId) ? "▼" : "▶" }}
                    </button>
                  </td>
                  <td>{{ l2.id }}</td>
                  <td class="pl-indent-1">
                    <span class="tree-line">└</span>
                    <span class="badge l2">중</span> {{ l2.menuNm }}
                    <span class="mid">{{ l2.menuId }}</span>
                  </td>
                  <td class="text-center">{{ l2.ordNum }}</td>
                  <td class="text-center">
                    <span
                      :class="[
                        'status-badge sm',
                        l2.useYn === 1 ? 'active' : 'inactive',
                      ]"
                      >{{ l2.useYn === 1 ? "사용" : "미사용" }}</span
                    >
                  </td>
                  <td class="text-center">
                    <div class="action-buttons">
                      <button @click="emit('edit', l2)" class="btn-icon">
                        ✏️
                      </button>
                      <button @click="emit('delete', l2.id)" class="btn-icon">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                <template v-if="expandedMenus.includes(l2.menuId)">
                  <tr v-for="l3 in l2.children" :key="l3.id" class="row-l3">
                    <td></td>
                    <td>{{ l3.id }}</td>
                    <td class="pl-indent-2">
                      <span class="tree-line">└</span>
                      <span class="badge l3">소</span> {{ l3.menuNm }}
                      <span class="mid">{{ l3.menuId }}</span>
                    </td>
                    <td class="text-center text-slate-400">
                      {{ l3.ordNum }}
                    </td>
                    <td class="text-center">
                      <span
                        :class="[
                          'status-badge sm',
                          l3.useYn === 1 ? 'active' : 'inactive',
                        ]"
                        >{{ l3.useYn === 1 ? "사용" : "미사용" }}</span
                      >
                    </td>
                    <td class="text-center">
                      <div class="action-buttons">
                        <button @click="emit('edit', l3)" class="btn-icon">
                          ✏️
                        </button>
                        <button @click="emit('delete', l3.id)" class="btn-icon">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </template>
          </template>
          <tr v-if="paginatedMenus.length === 0">
            <td colspan="6" class="empty-state">
              등록된 메뉴 정보가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="pagination-wrapper"
      v-if="totalPages > 0 && paginatedMenus.length > 0"
    >
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="emit('page-change', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import Pagination from "@/components/Pagination.vue";

defineProps({
  paginatedMenus: Array,
  expandedMenus: Array,
  currentPage: Number,
  totalPages: Number,
});

const emit = defineEmits(["toggle", "edit", "delete", "page-change"]);
</script>

<style scoped>
.mid {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-left: 0.5rem;
  font-family: monospace;
}
.tree-line {
  color: #cbd5e1;
  margin-right: 0.5rem;
  font-weight: bold;
}
.pl-indent-1 {
  padding-left: 2.5rem !important;
}
.pl-indent-2 {
  padding-left: 4.5rem !important;
}
.badge {
  font-size: 0.6rem;
  padding: 2px 5px;
  border-radius: 4px;
  color: white;
  margin-right: 4px;
}
.badge.l1 {
  background: #2563eb;
}
.badge.l2 {
  background: #10b981;
}
.badge.l3 {
  background: #8b5cf6;
}
.toggle-btn {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 2px 5px;
  cursor: pointer;
  font-size: 0.6rem;
  border-radius: 4px;
}
</style>
