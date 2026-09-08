// collection 도메인 상태 store
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as collectionApi from '@/features/collection/api/collection.api'

export const useCollectionStore = defineStore('feature-collection', () => {
  const collectionStatus = ref(null)

  /** @type {import('vue').Ref<import('@/features/collection/api/collection.api').AchievedGoal[]>} */
  const achievedGoals = ref([])
  const isLoading = ref(false)
  const isAdding = ref(false)
  const error = ref(null)

  function $reset() {
    collectionStatus.value = null
    achievedGoals.value = []
    isLoading.value = false
    isAdding.value = false
    error.value = null
  }

  const hasGoals = computed(
    () => Array.isArray(achievedGoals.value) && achievedGoals.value.length > 0
  )

  const totalAchievedCount = computed(() => achievedGoals.value.length)

  const totalAchievedAmount = computed(() =>
    achievedGoals.value.reduce((sum, goal) => sum + (Number(goal?.achievedAmount) || 0), 0)
  )

  async function fetchAchievedGoals() {
    isLoading.value = true
    error.value = null
    try {
      const data = await collectionApi.getAchievedGoals()
      achievedGoals.value = Array.isArray(data) ? data : []
    } catch (caughtError) {
      error.value = caughtError?.message || '완주한 목표를 불러오지 못했습니다.'
      achievedGoals.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function addAchievedGoal(goalId) {
    isAdding.value = true
    error.value = null
    try {
      await collectionApi.addGoalToCollection(goalId)
      await fetchAchievedGoals()
    } finally {
      isAdding.value = false
    }
  }

  return {
    collectionStatus,
    achievedGoals,
    isLoading,
    isAdding,
    error,
    hasGoals,
    totalAchievedCount,
    totalAchievedAmount,
    fetchAchievedGoals,
    addAchievedGoal,
    $reset,
  }
})
