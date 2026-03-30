<template>
  <div class="card">
    <div class="card-body">
      <table class="data-table">
        <thead>
          <tr>
            <th>단위 ID</th>
            <th>단위명</th>
            <th>기본 단위 여부</th>
            <th>기본 단위 ID</th>
            <th>변환 계수</th>
            <th>사용 여부</th>
            <th>정렬 순서</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="units.length === 0">
            <td colspan="8" class="text-center">데이터가 없습니다.</td>
          </tr>
          <tr v-for="unit in units" :key="unit.id">
            <td>{{ unit.unitId }}</td>
            <td>{{ unit.unitNm }}</td>
            <td>{{ unit.baseUnitYn ? 'Yes' : 'No' }}</td>
            <td>{{ unit.baseUnitId }}</td>
            <td>{{ unit.convRate }}</td>
            <td>{{ unit.useYn ? 'Yes' : 'No' }}</td>
            <td>{{ unit.dispOrd }}</td>
            <td class="action-buttons">
              <button @click="emit('edit', unit)" class="btn-icon">✏️</button>
              <button @click="emit('delete', unit.id)" class="btn-icon">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  units: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["edit", "delete"]);
</script>
