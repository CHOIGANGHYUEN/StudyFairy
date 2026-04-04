<template>
  <div
    class="page-header flex justify-between items-center mb-4 flex-wrap gap-4"
  >
    <div class="page-title">테이블 명세서 관리</div>
    <div class="flex gap-4 flex-wrap">
      <div class="flex items-center gap-2">
        <label class="font-bold text-sm text-text-color-secondary">언어</label>
        <select
          :value="searchLangu"
          @change="$emit('update:searchLangu', $event.target.value)"
          class="form-control"
          style="width: 100px; padding: 0.4rem"
        >
          <option value="KO">KO</option>
          <option value="EN">EN</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="font-bold text-sm text-text-color-secondary"
          >DBMS 기준</label
        >
        <select
          :value="selectedDbms"
          @change="$emit('update:selectedDbms', $event.target.value)"
          class="form-control"
          style="width: 150px; padding: 0.4rem"
        >
          <option value="MySQL">MySQL</option>
          <option value="PostgreSQL">PostgreSQL</option>
          <option value="Oracle">Oracle</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ searchLangu: String, selectedDbms: String });
defineEmits(["update:searchLangu", "update:selectedDbms"]);
</script>
