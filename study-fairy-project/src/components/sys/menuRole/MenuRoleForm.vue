<template>
  <section class="card-section">
    <div class="card-header flex justify-between items-center">
      <h2 class="section-title">
        {{ isEditMode ? "매핑 정보 수정" : "새 매핑 등록" }}
      </h2>
      <button
        v-if="isEditMode"
        @click="$emit('reset')"
        class="text-sm font-medium text-blue-600 hover:underline"
      >
        취소 및 신규 전환
      </button>
    </div>
    <form @submit.prevent="$emit('submit')">
      <div class="form-grid">
        <div class="form-group">
          <label for="roleId">권한 (Role) *</label>
          <select
            id="roleId"
            v-model="formData.roleId"
            required
            :disabled="isEditMode || isSubmitting"
          >
            <option value="" disabled>권한을 선택하세요</option>
            <option
              v-for="role in roles"
              :key="role.roleId"
              :value="role.roleId"
            >
              {{ role.roleId }} ({{ role.description || "설명 없음" }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="menuId">메뉴 (Menu) *</label>
          <select
            id="menuId"
            v-model="formData.menuId"
            required
            :disabled="isEditMode || isSubmitting"
          >
            <option value="" disabled>메뉴를 선택하세요</option>
            <option
              v-for="menu in menus"
              :key="menu.menuId"
              :value="menu.menuId"
            >
              {{ menu.menuNm }} [{{ menu.menuId }}]
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="useYn">사용 여부</label>
          <select
            id="useYn"
            v-model.number="formData.useYn"
            :disabled="isSubmitting"
          >
            <option :value="1">사용</option>
            <option :value="0">미사용</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        class="btn-primary"
        :disabled="isSubmitting || !formData.roleId || !formData.menuId"
      >
        {{ isSubmitting ? "처리 중..." : isEditMode ? "수정하기" : "등록하기" }}
      </button>
    </form>
  </section>
</template>

<script setup>
defineProps({
  isEditMode: Boolean,
  isSubmitting: Boolean,
  roles: Array,
  menus: Array,
  formData: Object,
});
defineEmits(["submit", "reset"]);
</script>

<style scoped>
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
</style>
