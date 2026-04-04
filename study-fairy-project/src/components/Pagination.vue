<template>
  <div class="pagination-container" v-if="totalPages > 1">
    <button
      @click="changePage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="pagination-button"
    >
      &laquo;
    </button>
    <button
      v-for="page in pages"
      :key="page"
      @click="changePage(page)"
      :class="['pagination-button', { active: currentPage === page }]"
    >
      {{ page }}
    </button>
    <button
      @click="changePage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="pagination-button"
    >
      &raquo;
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  maxVisibleButtons: {
    type: Number,
    default: 5,
  },
});

const emit = defineEmits(["page-change"]);

const pages = computed(() => {
  const range = [];
  const start =
    Math.floor((props.currentPage - 1) / props.maxVisibleButtons) *
      props.maxVisibleButtons +
    1;
  const end = Math.min(start + props.maxVisibleButtons - 1, props.totalPages);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  return range;
});

function changePage(page) {
  if (page > 0 && page <= props.totalPages) {
    emit("page-change", page);
  }
}
</script>
