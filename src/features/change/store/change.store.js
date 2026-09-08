// change 도메인 상태 store
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChangeStore = defineStore('feature-change', () => {
  // 담을 상태: pendingChangeRequest, changeImpact, changeHistory
  const pendingChangeRequest = ref(null)
  const changeImpact = ref(null)
  const changeHistory = ref([])

  function $reset() {
    pendingChangeRequest.value = null
    changeImpact.value = null
    changeHistory.value = []
  }

  return { pendingChangeRequest, changeImpact, changeHistory, $reset }
})
