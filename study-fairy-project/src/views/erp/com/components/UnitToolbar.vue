<template>
  <div class="page-header justify-between">
    <PageTitle title="단위 관리" />
    <button @click="emit('create')" class="btn btn-primary">
      새 단위 등록
    </button>
  </div>
</template>

<script setup>
import PageTitle from "@/components/common/PageTitle.vue";

const emit = defineEmits(["create"]);
</script>
