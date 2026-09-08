// 전역 UI 상태 store: sidebarOpen, globalLoading, selectedGoalId
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const globalLoading = ref(false)
  /** @type {import('vue').Ref<string | null>} */
  const selectedGoalId = ref(null)

  function $reset() {
    sidebarOpen.value = false
    globalLoading.value = false
    selectedGoalId.value = null
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  /**
   * @param {boolean} value
   */
  function setGlobalLoading(value) {
    globalLoading.value = value
  }

  /**
   * @param {string | null} goalId
   */
  function setSelectedGoalId(goalId) {
    selectedGoalId.value = goalId
  }

  return {
    sidebarOpen,
    globalLoading,
    selectedGoalId,
    toggleSidebar,
    setGlobalLoading,
    setSelectedGoalId,
    $reset,
  }
})
