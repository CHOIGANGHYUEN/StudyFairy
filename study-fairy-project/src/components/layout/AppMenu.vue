<template>
  <nav class="app-menu">
    <ul class="tab-list">
      <li v-for="(tab, index) in tabs" :key="index" class="tab-item">
        <router-link :to="tab.path" class="tab-link" active-class="active">
          {{ tab.name }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true,
    default: () => [],
  },
});
</script>

<style scoped>
.app-menu {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 2rem;
}

.tab-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.tab-item {
  margin-bottom: -1px; /* 부모 컨테이너의 bottom-border와 겹치게 하여 선택된 탭 효과 강조 */
}

.tab-link {
  display: inline-block;
  padding: 1rem 0.5rem;
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}

.tab-link:hover {
  color: #334155;
}

.tab-link.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  font-weight: 700;
}
</style>
