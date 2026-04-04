<template>
  <section class="card-section">
    <div class="card-header">
      <h2 class="section-title">자재 유형 목록</h2>
    </div>
    <div v-if="isLoading" class="loading-state">데이터를 불러오는 중...</div>
    <div v-else-if="!matTypes.length" class="empty-state">
      등록된 자재 유형이 없습니다.
    </div>
    <div class="table-container" v-else>
      <table class="data-table">
        <thead>
          <tr>
            <th>자재 유형 코드</th>
            <th>자재 유형명</th>
            <th>조달 유형</th>
            <th>가격 제어</th>
            <th>사용 여부</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in matTypes" :key="item.id">
            <td>{{ item.matType }}</td>
            <td>{{ getMatTypeName(item) }}</td>
            <td>{{ item.procureType }}</td>
            <td>{{ item.priceCtrlType }}</td>
            <td>{{ item.useYn ? "Y" : "N" }}</td>
            <td class="action-buttons">
              <button @click="$emit('edit-item', item)" class="btn-secondary">
                수정
              </button>
              <button @click="$emit('delete-item', item.id)" class="btn-danger">
                삭제
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({
  matTypes: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["edit-item", "delete-item"]);

// 기본 언어(예: 'ko')의 자재 유형명을 반환하는 함수
function getMatTypeName(matType) {
  if (!matType.names || matType.names.length === 0) {
    return "-";
  }
  const nameInKorean = matType.names.find((n) => n.langu === "ko");
  return nameInKorean ? nameInKorean.matTypeNm : matType.names[0].matTypeNm;
}
</script>

<style scoped></style>
