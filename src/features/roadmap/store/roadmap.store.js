// roadmap 도메인 상태 store: 마일스톤 목록
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as roadmapApi from '@/features/roadmap/api/roadmap.api'

export const useRoadmapStore = defineStore('feature-roadmap', () => {
  const milestones = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  let milestonesRequestId = 0

  function $reset() {
    milestones.value = []
    isLoading.value = false
    error.value = null
    milestonesRequestId += 1
  }

  const nextMilestone = computed(
    () => milestones.value.find((milestone) => milestone.status === 'IN_PROGRESS') ?? null
  )

  const previousMilestone = computed(() => {
    if (!nextMilestone.value) return null
    const index = milestones.value.findIndex(
      (m) => m.milestoneId === nextMilestone.value.milestoneId
    )
    return index > 0 ? milestones.value[index - 1] : null
  })

  /**
   * @param {number} goalId
   */
  async function fetchMilestones(goalId) {
    const requestId = ++milestonesRequestId
    isLoading.value = true
    error.value = null
    milestones.value = []
    try {
      const fetchedMilestones = await roadmapApi.getMilestones(goalId)
      if (requestId !== milestonesRequestId) return null

      milestones.value = fetchedMilestones
      return fetchedMilestones
    } catch (caughtError) {
      if (requestId !== milestonesRequestId) return null

      error.value = caughtError
      throw caughtError
    } finally {
      if (requestId === milestonesRequestId) isLoading.value = false
    }
  }

  return { milestones, nextMilestone, previousMilestone, isLoading, error, fetchMilestones, $reset }
})
