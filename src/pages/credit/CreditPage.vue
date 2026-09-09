<!-- CreditPage.vue -->
<template>
  <div>
    <!-- 메인 대시보드 -->
    <CreditDashboard
      :current-score="currentScore"
      :history-list="historyList"
      :goal-data="currentGoal"
      @open-history="openHistoryModal"
    />

    <!-- 변동 이력 모달 -->
    <CreditHistoryModal
      :is-open="isHistoryModalOpen"
      :history-list="historyList"
      :total-elements="totalElements"
      :is-loading="isLoading"
      @close="closeHistoryModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import CreditDashboard from '@/features/credit/components/CreditDashboard.vue'
import CreditHistoryModal from '@/features/credit/components/CreditHistoryModal.vue'
import { useCreditStore } from '@/features/credit/store/credit.store'
import { useGoalStore } from '@/features/goal/store/goal.store'

const creditStore = useCreditStore()
const goalStore = useGoalStore()

const { currentScore, historyList, totalElements, isLoading } = storeToRefs(creditStore)
const { currentGoal } = storeToRefs(goalStore)

const isHistoryModalOpen = ref(false)

function openHistoryModal() {
  isHistoryModalOpen.value = true
}

function closeHistoryModal() {
  isHistoryModalOpen.value = false
}

onMounted(async () => {
  // 1. 신용점수 및 변동 이력 조회
  await creditStore.fetchCreditData()

  // 2. 등록된 목표(대출 상환 등) 조회 및 대시보드 데이터 호출
  await goalStore.fetchGoals()
  if (goalStore.selectedGoalId) {
    await goalStore.fetchDashboardData(goalStore.selectedGoalId)
  }
})
</script>
