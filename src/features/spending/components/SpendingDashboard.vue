<template>
  <div>
    <LoadingSpinner
      v-if="isInitialLoading"
      message="지출 정보를 불러오는 중이에요"
      container-class="min-h-[calc(100dvh-122px)] md:min-h-[calc(100dvh-80px)]"
    />

    <template v-else>
      <RoadmapSelector
        :goals="goals"
        :selected-goal-id="selectedGoalId"
        :disabled="areGoalsLoading"
        :trailing-text="myDataStatusText"
        @update:selected-goal-id="$emit('select-goal', $event)"
      />

      <div class="page-container pb-10 pt-4 sm:pb-14 sm:pt-6">
        <p
          v-if="error"
          class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          role="alert"
        >
          지출 정보를 불러오지 못했어요 잠시 후 다시 시도해 주세요
        </p>

        <p
          v-else-if="!hasNumericGoalId && !areGoalsLoading"
          class="rounded-2xl border border-[#E2E8F0] bg-white px-5 py-8 text-center text-sm text-[#64748B]"
        >
          지출관리에 사용할 목표를 먼저 만들어 주세요
        </p>

        <template v-else-if="spendingSummary">
          <SpendingSummarySection
            :total-spending="spendingSummary.totalSpending"
            :previous-month-spending="spendingSummary.previousMonthSpending"
            :saving-capacity="spendingSummary.savingCapacity"
            :remaining-months="spendingSummary.remainingMonths"
            :monthly-difference="spendingSummary.monthlyDifference"
            :goal-progress="spendingSummary.goalProgress"
            @open-transactions="openTransactionHistory"
          />

          <SpendingContentTabs
            class="mt-3 sm:mt-5 md:mt-7"
            :summary="spendingSummary"
            :selected-goal="selectedGoal"
          />
        </template>
      </div>
    </template>

    <SpendingHistoryModal
      v-model="isTransactionHistoryOpen"
      :transactions="transactionHistory?.transactions ?? []"
      :total-count="transactionHistory?.totalElements ?? 0"
      :total-expense="loadedTransactionsTotal"
      :loading="areTransactionsLoading"
      :error="transactionsError"
      @retry="loadTransactionHistory"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import SpendingContentTabs from '@/features/spending/components/SpendingContentTabs.vue'
import SpendingHistoryModal from '@/features/spending/components/SpendingHistoryModal.vue'
import SpendingSummarySection from '@/features/spending/components/SpendingSummarySection.vue'
import { useSpendingStore } from '@/features/spending/store/spending.store'
import RoadmapSelector from '@/shared/ui/RoadmapSelector.vue'
import LoadingSpinner from '@/shared/ui/LoadingSpinner.vue'

const spendingStore = useSpendingStore()
const {
  spendingSummary,
  isLoading,
  error,
  transactionHistory,
  areTransactionsLoading,
  transactionsError,
} = storeToRefs(spendingStore)
const isTransactionHistoryOpen = ref(false)

const props = defineProps({
  goals: {
    type: Array,
    default: () => [],
  },
  selectedGoalId: {
    type: [Number, String],
    default: null,
  },
  selectedGoal: {
    type: String,
    default: '',
  },
  areGoalsLoading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select-goal'])

const hasNumericGoalId = computed(() => {
  const goalId = Number(props.selectedGoalId)
  return Number.isInteger(goalId) && goalId > 0
})
const isInitialLoading = computed(
  () => props.areGoalsLoading || (isLoading.value && !spendingSummary.value)
)

const myDataStatusText = computed(() => {
  const month = Number(spendingSummary.value?.referenceMonth?.split('-')[1])
  return Number.isInteger(month) && month > 0 ? `${month}월 기준` : ''
})

// 지출 분석 응답에 기준 월이 없어도 모달('이번 달 지출 내역')이 조회 없이 빈 화면으로
// 남지 않도록 오늘 날짜 기준 연/월로 폴백한다.
const referenceDate = computed(() => {
  const [year, month] = (spendingSummary.value?.referenceMonth ?? '').split('-').map(Number)

  if (Number.isInteger(year) && Number.isInteger(month)) return { year, month }

  const today = new Date()
  return { year: today.getFullYear(), month: today.getMonth() + 1 }
})

// 모달 총액은 목록과 같은 /transactions 응답에서 계산한다.
// 지출 분석 API 합계를 쓰면 목록에 없는 항목까지 포함돼 금액과 내역이 어긋난다.
const loadedTransactionsTotal = computed(() =>
  (transactionHistory.value?.transactions ?? []).reduce(
    (total, transaction) => total + Math.abs(Number(transaction.amount) || 0),
    0
  )
)

function loadTransactionHistory() {
  return spendingStore.loadTransactions(referenceDate.value)
}

function openTransactionHistory() {
  isTransactionHistoryOpen.value = true
  loadTransactionHistory()
}

watch(
  () => props.selectedGoalId,
  (goalId) => {
    const numericGoalId = Number(goalId)
    if (Number.isInteger(numericGoalId) && numericGoalId > 0) {
      spendingStore.loadSpendingData(numericGoalId)
    }
  },
  { immediate: true }
)
</script>
