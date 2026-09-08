<template>
  <CreditDashboard :credit-summary="creditSummary" :score-percentile="scorePercentile" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { CreditDashboard } from '@/features/credit'
import { useGoalStore } from '@/features/goal'

const goalStore = useGoalStore()
const { goals, selectedGoalId } = storeToRefs(goalStore)

// 서버/스토어 데이터 Mock 상태
const creditSummary = ref({
  score: 896,
  monthlyChange: 15,
})
const scorePercentile = ref(20)

onMounted(async () => {
  await goalStore.fetchGoals()

  if (goals.value.length === 0) return

  const numericGoalId = Number(selectedGoalId.value)
  const hasSelectedGoal =
    Number.isInteger(numericGoalId) &&
    goals.value.some((goal) => Number(goal.goalId) === numericGoalId)

  if (hasSelectedGoal) return

  const firstGoalId = Number(goals.value[0]?.goalId)
  if (Number.isInteger(firstGoalId) && firstGoalId > 0) {
    goalStore.selectGoal(firstGoalId)
  }
})
</script>
