<!-- 목표 실현가능성 확인 페이지 (GOAL-03) -->
<template>
  <HeroBackground class="font-['Noto_Sans_KR',sans-serif]">
    <StepHeader @back="handleBack" />

    <!-- 본문 콘텐츠 -->
    <div
      v-if="goalParams && feasibility"
      class="relative z-10 mx-auto w-full max-w-[660px] animate-fade-in-up px-4 pt-3 sm:pt-6 pb-28 md:pb-6"
    >
      <ProgressBar :current-step="3" :total-steps="4" />

      <!-- 메인 헤드라인 & 서브 설명 -->
      <h1
        class="mt-4 sm:mt-6 whitespace-pre-line sm:whitespace-normal text-2xl sm:text-[28px] font-black tracking-tight leading-snug text-gray-900 break-keep"
      >
        {{ initialStatusContent.pageTitle }}
      </h1>
      <p class="mt-2 sm:mt-2.5 text-[13px] sm:text-sm font-medium text-slate-500">
        현재 소득과 지출을 기준으로 분석했어요.
      </p>

      <div class="mt-6 sm:mt-8">
        <FeasibilityResult
          v-model:selected-alternative="selectedAlternative"
          available-label="월 가능 저축액"
          :available-amount="displayAvailableMonthly"
          required-label="월 필요 저축액"
          :required-amount="displayRequiredMonthly"
          :status="displayStatus"
          :monthly-label="formatKRWCompact(displayRequiredMonthly)"
          :period-label="formatPeriodLabel(displayMonths)"
          :goal-label="selectedGoal?.title"
          :stats="stats"
          :adjust-title="initialStatusContent.adjustTitle"
          :adjust-message="initialStatusContent.adjustMessage"
          :alternatives="ALTERNATIVES"
          :recalculated="recalculated"
          :recalculated-status="displayStatus"
          :is-recalculating="isRecalculating"
          :show-adjustment="isAdjustmentVisible"
          :can-adjust="effectiveStatus === 'warning'"
          :can-close-adjustment="effectiveStatus === 'warning'"
          :period-extension="periodExtension"
          :amount-reduction="amountReduction"
          :adjusted-amount="adjustedAmount"
          :adjusted-months="adjustedMonths"
          @update:period-extension="periodExtension = $event"
          @update:amount-reduction="amountReduction = $event"
          @update:adjusted-amount="adjustedAmount = $event"
          @update:adjusted-months="adjustedMonths = $event"
          @request-adjustment="isOptionalAdjustmentOpen = true"
          @close-adjustment="closeOptionalAdjustment"
        />
      </div>
    </div>

    <LoadingSpinner v-else-if="isFeasibilityLoading" message="실현 가능성을 계산하고 있어요" />

    <div
      v-else-if="fetchError"
      class="relative z-10 mx-auto flex w-full max-w-[660px] flex-col items-center px-4 py-24 text-center"
    >
      <div class="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-xl">!</div>
      <h1 class="mt-4 text-xl font-bold text-gray-900">분석 결과를 불러오지 못했어요</h1>
      <p class="mt-2 text-sm text-gray-500">잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        class="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
        @click="fetchFeasibilityResult"
      >
        다시 시도
      </button>
    </div>

    <!-- 하단 CTA 버튼 -->
    <BottomCTA
      v-if="goalParams && feasibility"
      :label="ctaLabel"
      :disabled="ctaDisabled"
      desktop-static
      @click="handleNext"
    />
  </HeroBackground>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import HeroBackground from '@/shared/ui/HeroBackground.vue'
import StepHeader from '@/shared/ui/StepHeader.vue'
import ProgressBar from '@/shared/ui/ProgressBar.vue'
import BottomCTA from '@/shared/ui/BottomCTA.vue'
import LoadingSpinner from '@/shared/ui/LoadingSpinner.vue'
import FeasibilityResult from '@/shared/ui/FeasibilityResult.vue'
import { useGoalStore } from '@/features/goal'
import { GOAL_PRESETS, GOAL_PRESET_IDS } from '@/features/goal/constants/goal.constants.js'
import {
  GOAL_DETAIL_CONFIG,
  DEFAULT_GOAL_DETAIL_CONFIG,
} from '@/features/goal/constants/goalDetailConfig.js'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { formatKRWCompact } from '@/shared/lib/money'
import { calculateStudentLoan } from '@/features/goal/lib/loan.js'

const ALTERNATIVES = computed(() => {
  const minMonths = config.value.periodMin ?? 6
  const maxMonths = config.value.periodMax ?? 60
  const maxAmount = currentAmount.value || 10000000
  const stepAmount = maxAmount >= 1000000 ? 100000 : 10000

  if (isStudentLoan.value) {
    return [
      {
        key: 'period',
        label: '기간 늘리기',
        min: minMonths,
        max: maxMonths,
        step: 1,
        minLabel: formatPeriodLabel(minMonths),
        maxLabel: formatPeriodLabel(maxMonths),
      },
      {
        key: 'extra_capacity',
        label: '추가 상환 여력 늘리기',
        min: 5,
        max: 30,
        step: 5,
        minLabel: '+5만원',
        maxLabel: '+30만원',
      },
    ]
  }

  return [
    {
      key: 'period',
      label: '기간 늘리기',
      min: minMonths,
      max: maxMonths,
      step: 1,
      minLabel: formatPeriodLabel(minMonths),
      maxLabel: formatPeriodLabel(maxMonths),
    },
    {
      key: 'amount',
      label: '목표 금액 낮추기',
      min: 0,
      max: maxAmount,
      step: stepAmount,
      minLabel: '0원',
      maxLabel: formatKRWCompact(maxAmount),
    },
  ]
})

const STATUS_CONTENT = {
  success: {
    pageTitle: '충분히 달성할 수 있는\n목표예요',
    title: '현실적이에요',
    message: '충분히 가능한 목표예요',
  },
  danger: {
    pageTitle: '현재 계획은\n월 여력보다 부담이 커요',
    title: '지금은 무리예요',
    message: '현재 여력에 맞는 계획을 추천해요',
    adjustTitle: '현재 여력보다 부담이 커요',
    adjustMessage: '아래 대안 중 하나를 선택하면 다시 계산해 드려요.',
  },
}

const router = useRouter()
const goalStore = useGoalStore()
const {
  selectedGoalPresetId,
  goalParams,
  feasibility,
  isFeasibilityLoading,
  recalculatedFeasibility,
} = storeToRefs(goalStore)

const selectedGoal = computed(() =>
  GOAL_PRESETS.find((preset) => preset.id === selectedGoalPresetId.value)
)
const isStudentLoan = computed(() => selectedGoalPresetId.value === GOAL_PRESET_IDS.STUDENT_LOAN)
const config = computed(
  () => GOAL_DETAIL_CONFIG[selectedGoalPresetId.value] ?? DEFAULT_GOAL_DETAIL_CONFIG
)

const selectedAlternative = ref('')
const periodExtension = ref(12)
const amountReduction = ref(20)
const adjustedAmount = ref(0)
const adjustedMonths = ref(24)
const isOptionalAdjustmentOpen = ref(false)
const isRecalculating = ref(false)
const fetchError = ref(false)
const isAdjustmentVisible = computed(
  () => effectiveStatus.value === 'danger' || isOptionalAdjustmentOpen.value
)

// 안전한 현재 파라미터 (새로고침 등 기본값 제공)
const currentAmount = computed(
  () => Number(goalParams.value?.amount) || (isStudentLoan.value ? 12400000 : 10000000)
)

watch(
  currentAmount,
  (newAmount) => {
    if (newAmount > 0) {
      adjustedAmount.value = newAmount
    }
  },
  { immediate: true }
)
const currentMonths = computed(() => Number(goalParams.value?.months) || 24)

watch(
  currentMonths,
  (newMonths) => {
    if (newMonths > 0) {
      adjustedMonths.value = newMonths
    }
  },
  { immediate: true }
)
const currentStartAmount = computed(() => Number(goalParams.value?.startAmount) || 0)

// 학자금 대출인 경우 원리금 균등상환 월 상환액, 일반인 경우 API requiredMonthly 사용
const effectiveRequiredMonthly = computed(() => {
  if (isStudentLoan.value) {
    if (goalParams.value?.loanResult?.monthlyPayment) {
      return goalParams.value.loanResult.monthlyPayment
    }
    const loanCalc = calculateStudentLoan({
      amount: currentAmount.value,
      months: currentMonths.value,
    })
    return loanCalc.monthlyPayment
  }
  return Number(feasibility.value?.requiredMonthly) || 0
})

const effectiveStatus = computed(() => {
  const req = effectiveRequiredMonthly.value
  const avail = Number(feasibility.value?.availableMonthly) || 620000
  if (avail <= 0) return 'danger'
  const rate = req <= 0 ? 100 : Math.min(100, Math.round((avail / req) * 100))
  return rate >= 80 ? 'success' : 'danger'
})

async function fetchFeasibilityResult() {
  fetchError.value = false
  try {
    await goalStore.fetchFeasibility({
      goalAmount: currentAmount.value,
      goalMonths: currentMonths.value,
      startAmount: currentStartAmount.value,
      isStudentLoan: isStudentLoan.value,
    })
  } catch (err) {
    fetchError.value = true
    console.error('Failed to fetch feasibility:', err)
  }
}

onMounted(async () => {
  if (!selectedGoalPresetId.value) {
    selectedGoalPresetId.value = GOAL_PRESET_IDS.EMERGENCY
  }

  if (!goalParams.value) {
    goalParams.value = {
      amount: currentAmount.value,
      months: currentMonths.value,
      startAmount: currentStartAmount.value,
    }
  }

  await fetchFeasibilityResult()
})

/**
 * 선택한 대안을 반영한 목표 파라미터를 계산한다.
 * @param {string} key
 */
function getAdjustedGoalParams(key) {
  const baseAmount = currentAmount.value
  const baseMonths = currentMonths.value
  const baseStart = currentStartAmount.value

  if (!key) {
    return { amount: baseAmount, months: baseMonths, startAmount: baseStart }
  }

  if (key === 'period') {
    return {
      amount: baseAmount,
      months: adjustedMonths.value,
      startAmount: baseStart,
    }
  }
  if (key === 'extra_capacity') {
    return { amount: baseAmount, months: baseMonths, startAmount: baseStart }
  }
  if (key === 'amount') {
    return { amount: adjustedAmount.value, months: baseMonths, startAmount: baseStart }
  }

  return { amount: baseAmount, months: baseMonths, startAmount: baseStart }
}

const recalculatedReqMonthly = computed(() => {
  if (!selectedAlternative.value) return 0
  const adjusted = getAdjustedGoalParams(selectedAlternative.value)
  if (isStudentLoan.value) {
    const loanCalc = calculateStudentLoan({ amount: adjusted.amount, months: adjusted.months })
    return loanCalc.monthlyPayment
  }
  if (recalculatedFeasibility.value?.requiredMonthly) {
    return Number(recalculatedFeasibility.value.requiredMonthly)
  }
  return Math.max(0, Math.round((adjusted.amount - adjusted.startAmount) / adjusted.months)) || 0
})

// 대안 선택 시 동적으로 반영되는 월 필요 저축/상환액
const displayRequiredMonthly = computed(() => {
  if (selectedAlternative.value && recalculatedReqMonthly.value > 0) {
    return recalculatedReqMonthly.value
  }
  return effectiveRequiredMonthly.value
})

// 대안 선택 시 동적으로 반영되는 월 가능 여력
const baseAvailableMonthly = computed(() => Number(feasibility.value?.availableMonthly) || 620000)

const displayAvailableMonthly = computed(() => {
  const baseAvail = baseAvailableMonthly.value
  if (selectedAlternative.value === 'extra_capacity') {
    return baseAvail + amountReduction.value * 10000
  }
  return baseAvail
})

// 대안 반영 시 실시간 상태 (success / danger)
const displayStatus = computed(() => {
  const req = displayRequiredMonthly.value
  const avail = displayAvailableMonthly.value
  if (avail <= 0) return 'danger'
  const rate = req <= 0 ? 100 : Math.min(100, Math.round((avail / req) * 100))
  return rate >= 80 ? 'success' : 'danger'
})

const displayMonths = computed(() => {
  const adjusted = getAdjustedGoalParams(selectedAlternative.value)
  return adjusted.months
})

const recalculatedPossible = computed(() => {
  return displayStatus.value === 'success'
})

const initialStatusContent = computed(() => STATUS_CONTENT[effectiveStatus.value ?? 'danger'])

const stats = computed(() => {
  const adjusted = getAdjustedGoalParams(selectedAlternative.value)
  return [
    {
      label: isStudentLoan.value ? '대출 원금' : '목표 금액',
      value: formatKRWCompact(adjusted.amount),
    },
    { label: '목표 기간', value: formatPeriodLabel(adjusted.months) },
    {
      label: isStudentLoan.value ? '월 상환액' : '월 저축액',
      value: formatKRWCompact(displayRequiredMonthly.value),
    },
  ]
})

const recalculated = computed(() => {
  if (!selectedAlternative.value) return null

  const adjusted = getAdjustedGoalParams(selectedAlternative.value)
  const reqMonthly = recalculatedReqMonthly.value

  if (selectedAlternative.value === 'period') {
    return {
      label: isStudentLoan.value ? '조정 후 월 상환액' : '조정 후 월 저축액',
      value: formatKRWCompact(reqMonthly),
      sublabel: '조정 기간',
      subvalue: formatPeriodLabel(adjusted.months),
    }
  }

  if (selectedAlternative.value === 'extra_capacity') {
    return {
      label: '조정 후 월 상환 여력',
      value: formatKRWCompact(displayAvailableMonthly.value),
      sublabel: '월 추가 상환 여력',
      subvalue: `+${amountReduction.value}만원 절약`,
    }
  }

  return {
    label: isStudentLoan.value ? '조정 후 월 상환액' : '조정 후 월 저축액',
    value: formatKRWCompact(reqMonthly),
    sublabel: '조정 목표 금액',
    subvalue: formatKRWCompact(adjusted.amount),
  }
})

watch(
  [selectedAlternative, periodExtension, amountReduction, adjustedAmount, adjustedMonths],
  async ([key]) => {
    if (!key) {
      recalculatedFeasibility.value = null
      return
    }

    isRecalculating.value = true
    try {
      const adjusted = getAdjustedGoalParams(key)
      await goalStore.fetchRecalculatedFeasibility({
        goalAmount: adjusted.amount,
        goalMonths: adjusted.months,
        startAmount: adjusted.startAmount,
        isStudentLoan: isStudentLoan.value,
      })
    } finally {
      isRecalculating.value = false
    }
  }
)

const ctaLabel = computed(() => {
  if (selectedAlternative.value) {
    if (!recalculatedPossible.value) {
      return '대안을 더 조정해 주세요'
    }
    return '조정된 계획으로 시작하기'
  }
  return effectiveStatus.value === 'success' ? '계좌 연결하기' : '대안을 선택해 주세요'
})

const ctaDisabled = computed(() => {
  if (isRecalculating.value) return true
  if (effectiveStatus.value === 'danger') {
    if (!selectedAlternative.value) return true
    if (!recalculatedPossible.value) return true
  }
  return false
})

function formatPeriodLabel(months) {
  const m = Number(months) || 0
  const years = Math.floor(m / 12)
  const remainMonths = m % 12
  if (years === 0) return `${m}개월`
  if (remainMonths === 0) return `${years}년`
  return `${years}년 ${remainMonths}개월`
}

function handleBack() {
  router.push({ name: ROUTE_NAMES.GOAL_DETAIL })
}

function closeOptionalAdjustment() {
  isOptionalAdjustmentOpen.value = false
  selectedAlternative.value = ''
  recalculatedFeasibility.value = null
  adjustedAmount.value = currentAmount.value
  adjustedMonths.value = currentMonths.value
}

function handleNext() {
  if (ctaDisabled.value) return

  if (selectedAlternative.value) {
    const adjusted = getAdjustedGoalParams(selectedAlternative.value)
    goalParams.value = {
      ...goalParams.value,
      amount: adjusted.amount,
      months: adjusted.months,
      startAmount: adjusted.startAmount,
    }
  }
  goalStore.applyRecalculatedFeasibility()
  if (goalParams.value?.loanResult) {
    goalParams.value.loanResult.monthlyPayment = feasibility.value?.requiredMonthly
  }
  router.push({ name: ROUTE_NAMES.GOAL_ACCOUNT })
}
</script>
