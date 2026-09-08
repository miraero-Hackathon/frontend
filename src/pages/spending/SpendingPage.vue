<template>
  <SpendingDashboard
    :goals="goals"
    :selected-goal-id="selectedGoalId"
    :selected-goal="selectedGoalName"
    :are-goals-loading="areGoalsLoading"
    @select-goal="selectGoal"
  />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { SpendingDashboard } from '@/features/spending'
import { useGoalStore } from '@/features/goal'

const goalStore = useGoalStore()
const { goals, selectedGoalId, selectedGoal, areGoalsLoading } = storeToRefs(goalStore)
const selectedGoalName = computed(() => selectedGoal.value?.goalName ?? '')

function selectGoal(goalId) {
  const numericGoalId = Number(goalId)
  if (Number.isInteger(numericGoalId) && numericGoalId > 0) goalStore.selectGoal(numericGoalId)
}

onMounted(async () => {
  await goalStore.fetchGoals()

  // 목표 조회가 실패하면 goals가 비어 있다. 이때 selection을 건드리면
  // 대시보드·로드맵과 공유하는 selectedGoalId까지 날아가므로 그대로 둔다.
  if (goals.value.length === 0) return

  const numericGoalId = Number(selectedGoalId.value)
  const hasSelectedGoal =
    Number.isInteger(numericGoalId) &&
    goals.value.some((goal) => Number(goal.goalId) === numericGoalId)

  if (hasSelectedGoal) return

  const firstGoalId = Number(goals.value[0]?.goalId)
  if (Number.isInteger(firstGoalId) && firstGoalId > 0) goalStore.selectGoal(firstGoalId)
})
</script>
