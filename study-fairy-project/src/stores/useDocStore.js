import { defineStore } from "pinia";

export const useDocStore = defineStore("doc", {
  state: () => ({
    savedPrompt: "여기에 요약용 기본 프롬프트를 저장하세요.", // 미리 저장할 프롬프트
    tocList: [], // AI가 추출한 목차 리스트 [{ id: 1, title: '목차1' }, ...]
    selectedTocs: [], // 사용자가 선택한 목차들
  }),
  actions: {
    setTocList(list) {
      this.tocList = list;
    },
    updatePrompt(newPrompt) {
      this.savedPrompt = newPrompt;
    },
  },
});
