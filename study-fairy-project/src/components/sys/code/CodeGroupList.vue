<template>
    <section class="card-section group-panel">
        <div class="card-header flex justify-between items-center">
            <h2 class="section-title">코드 그룹</h2>
        </div>
        <ul class="group-list">
            <li
                v-for="head in codeHeads"
                :key="head.id"
                class="group-item"
                :class="{ active: selectedGroupCode === head.groupCode }"
                @click="emit('select-group', head)"
            >
                <span>{{ head.groupCode }}</span>
                <span class="desc">{{ head.description }}</span>
            </li>
             <li v-if="codeHeads.length === 0" class="group-item-empty">
                데이터가 없습니다.
            </li>
        </ul>
    </section>
</template>

<script setup>
defineProps({
    codeHeads: Array,
    selectedGroupCode: String,
});

const emit = defineEmits(['select-group']);
</script>

<style scoped>
.group-panel {
    min-height: 400px;
}
.group-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: calc(100vh - 420px);
  overflow-y: auto;
}
.group-item {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}
.group-item:hover {
  background-color: #f8fafc;
}
.group-item.active {
  background-color: #e0e7ff;
  color: #4338ca;
  font-weight: 600;
}
.group-item .desc {
  font-size: 0.8rem;
  color: #64748b;
  display: block;
  margin-top: 2px;
}
.group-item.active .desc {
  color: #4f46e5;
}
.group-item-empty {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
}
</style>
