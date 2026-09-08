<template>
  <MypageModal
    v-model="isOpen"
    title-id="goal-reset-modal-title"
    max-width-class="max-w-[500px]"
    :close-disabled="saving || isCheckingFeasibility"
  >
    <template #heading>
      <div>
        <p class="text-xs font-semibold text-slate-400">{{ goal?.goalName }} 목표</p>
        <h2 id="goal-reset-modal-title" class="mt-0.5 text-base font-bold text-[#0a192f]">
          {{ step === 'form' ? '목표 재설정' : '실현 가능성 확인' }}
        </h2>
      </div>
    </template>

    <!-- STEP 1. 목표 금액·기간·상태 입력 -->
    <form v-if="step === 'form'" class="flex flex-col gap-5 px-6 py-6" @submit.prevent="handleCheckFeasibility">
      <label class="block">
        <span class="mb-2 block text-sm font-bold text-[#0a192f]">목표 금액</span>
        <div class="relative">
          <input
            v-model.number="form.goalAmount"
            type="number"
            min="10000"
            step="10000"
            class="mypage-goal-input pr-14 tabular-nums"
            autofocus
            aria-describedby="goal-amount-caption"
          />
          <span
            class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none text-sm font-semibold text-slate-500"
            >원</span
          >
        </div>
        <p id="goal-amount-caption" class="mt-1.5 text-xs text-slate-400">
          현재 모은 금액 {{ formatKRW(goal?.currentAmount ?? 0) }} 이상으로 설정해주세요.
        </p>
      </label>

      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="amount in amountPresets"
          :key="amount"
          type="button"
          class="rounded-full border px-2 py-2 text-xs font-bold transition-colors"
          :aria-pressed="form.goalAmount === amount"
          :class="
            form.goalAmount === amount
              ? 'border-primary bg-primary text-white'
              : 'border-[#c5dcff] bg-[#eaf2ff] text-primary'
          "
          @click="form.goalAmount = amount"
        >
          {{ formatKRWCompact(amount) }}
        </button>
      </div>

      <label class="block">
        <span class="mb-2 block text-sm font-bold text-[#0a192f]">목표 월</span>
        <input
          v-model="form.goalMonth"
          type="month"
          :min="minimumGoalMonth"
          class="mypage-goal-input"
        />
        <p class="mt-1.5 text-xs text-slate-400">목표일은 선택한 월의 마지막 날로 저장됩니다.</p>
      </label>

      <fieldset>
        <legend class="mb-2 text-sm font-bold text-[#0a192f]">목표 상태</legend>
        <div class="grid grid-cols-2 gap-2 rounded-2xl bg-[#f4f8ff] p-1.5">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            type="button"
            class="rounded-xl px-4 py-2.5 text-sm font-bold transition-all"
            :aria-pressed="form.status === option.value"
            :class="
              form.status === option.value
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-[#0a192f]'
            "
            @click="form.status = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </fieldset>

      <div class="rounded-2xl border border-slate-200 bg-[#f4f8ff] px-5 py-4 text-sm">
        <p class="flex justify-between gap-4">
          <span class="text-slate-500">변경 목표</span>
          <strong class="text-right text-primary">{{ formatKRW(form.goalAmount || 0) }}</strong>
        </p>
        <p class="mt-2 flex justify-between gap-4">
          <span class="text-slate-500">달성 예정</span>
          <strong class="text-right text-[#0a192f]">{{ goalMonthLabel }}</strong>
        </p>
      </div>

      <p v-if="validationError || feasibilityCheckError || error" class="text-sm text-red-700" role="alert">
        {{ validationError || feasibilityCheckError || error }}
      </p>

      <div class="mypage-modal-actions -mx-6 -mb-6 mt-1">
        <button
          type="button"
          class="mypage-modal-secondary"
          :disabled="saving"
          @click="isOpen = false"
        >
          취소
        </button>
        <button type="submit" class="mypage-modal-primary" :disabled="isCheckingFeasibility">
          <span v-if="isCheckingFeasibility" class="mypage-spinner text-white" aria-hidden="true" />
          {{ isCheckingFeasibility ? '확인 중' : '실현 가능성 확인' }}
        </button>
      </div>
    </form>

    <!-- STEP 2. 실현 가능성 결과 -->
    <div v-else class="flex flex-col">
      <div class="max-h-[65vh] overflow-y-auto px-6 py-6">
        <div
          class="rounded-2xl border px-4 py-3.5"
          :class="
            headline.tone === 'success'
              ? 'border-emerald-100 bg-emerald-50/80'
              : 'border-rose-100 bg-rose-50/80'
          "
        >
          <p
            class="text-sm font-bold"
            :class="headline.tone === 'success' ? 'text-emerald-700' : 'text-rose-700'"
          >
            {{ headline.title }}
          </p>
          <p v-if="headline.sub" class="mt-1 text-xs leading-relaxed text-slate-600">
            {{ headline.sub }}
          </p>
        </div>

        <div class="mt-4">
          <FeasibilityResult
            v-model:selected-alternative="selectedAlternative"
            available-label="현재 월 저축 페이스"
            :available-amount="displayAvailableMonthly"
            required-label="필요 월 저축액"
            :required-amount="displayRequiredMonthly"
            :status="displayStatus"
            :monthly-label="formatKRWCompact(displayRequiredMonthly)"
            :period-label="formatPeriodLabel(displayMonths)"
            :goal-label="goal?.goalName || '목표'"
            :stats="stats"
            adjust-title="현재 여력보다 부담이 커요"
            adjust-message="아래 대안 중 하나를 선택하면 다시 계산해 드려요."
            :alternatives="ALTERNATIVES"
            :recalculated="recalculated"
            :recalculated-status="displayStatus"
            :is-recalculating="isRecalculating"
            :show-adjustment="isAdjustmentVisible"
            :can-adjust="false"
            :can-close-adjustment="false"
            :adjusted-amount="adjustedAmount"
            :adjusted-months="adjustedMonths"
            :amount-reduction="amountReduction"
            @update:adjusted-amount="adjustedAmount = $event"
            @update:adjusted-months="adjustedMonths = $event"
            @update:amount-reduction="amountReduction = $event"
          />
        </div>

        <p v-if="feasibilityCheckError || error" class="mt-3 text-sm text-red-700" role="alert">
          {{ feasibilityCheckError || error }}
        </p>
      </div>

      <div class="mypage-modal-actions px-6 pb-6 pt-1">
        <button
          type="button"
          class="mypage-modal-secondary"
          :disabled="saving"
          @click="step = 'form'"
        >
          이전
        </button>
        <button type="button" class="mypage-modal-primary" :disabled="saveDisabled" @click="handleFinalSave">
          <span v-if="saving" class="mypage-spinner text-white" aria-hidden="true" />
          {{ saveButtonLabel }}
        </button>
      </div>
    </div>
  </MypageModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  calculateGoalMonths,
  clampGoalMonth,
  getMinimumGoalMonth,
  goalApi,
  normalizeGoalMonth,
} from '@/features/goal'
import { resolveFeasibilityStatus } from '@/features/goal/composables/useFeasibility'
import { calculateStudentLoan } from '@/features/goal/lib/loan.js'
import { formatKRW, formatKRWCompact } from '@/shared/lib/money'
import MypageModal from '@/features/mypage/components/MypageModal.vue'
import FeasibilityResult from '@/shared/ui/FeasibilityResult.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  goal: { type: Object, default: null },
  saving: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const form = reactive({ goalAmount: 0, goalMonth: '', status: 'ACTIVE' })
const validationError = ref('')
const amountPresets = [10000000, 30000000, 50000000]
const statusOptions = [
  { value: 'ACTIVE', label: '진행 중' },
  { value: 'PAUSE', label: '일시 정지' },
]

const step = ref('form')
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
// 반응형 의존성이 없어 computed로 두면 자정을 넘겨도 갱신되지 않으므로 열릴 때마다 계산한다.
const minimumGoalMonth = ref('')
const goalMonthLabel = computed(() => {
  const normalized = normalizeGoalMonth(form.goalMonth)
  if (!normalized) return '-'
  const [year, month] = normalized.split('-')
  return `${year}년 ${Number(month)}월`
})

// 학자금 대출 상환 목표는 실현가능성 계산 방식(원리금 균등상환)이 다른 목표와 다르다.
// 기존 목표 생성 플로우(FeasibilityPage)와 동일한 기준을 따른다.
const isStudentLoan = computed(() => props.goal?.goalType === 'LOAN')
const currentAmount = computed(() => Number(props.goal?.currentAmount ?? 0))

function resetForm() {
  minimumGoalMonth.value = getMinimumGoalMonth()
  form.goalAmount = props.goal?.goalAmount ?? 0
  form.goalMonth = clampGoalMonth(props.goal?.period?.endDate, minimumGoalMonth.value)
  form.status = ['PAUSE', 'PAUSED'].includes(props.goal?.status) ? 'PAUSE' : 'ACTIVE'
  validationError.value = ''
  step.value = 'form'
  feasibilityCheckError.value = ''
  feasibility.value = null
  selectedAlternative.value = ''
  recalculatedFeasibility.value = null
}

function validateForm() {
  if (!Number.isFinite(form.goalAmount) || form.goalAmount < 10000) {
    validationError.value = '목표 금액을 1만원 이상 입력해주세요.'
    return false
  }
  if (form.goalAmount < currentAmount.value) {
    validationError.value = '목표 금액은 현재 모은 금액보다 작을 수 없습니다.'
    return false
  }
  if (!normalizeGoalMonth(form.goalMonth) || calculateGoalMonths(form.goalMonth) <= 0) {
    validationError.value = '목표 월은 다음 달 이후로 설정해주세요.'
    return false
  }
  return true
}

function formatPeriodLabel(months) {
  const m = Number(months) || 0
  const years = Math.floor(m / 12)
  const remainMonths = m % 12
  if (years === 0) return `${m}개월`
  if (remainMonths === 0) return `${years}년`
  return `${years}년 ${remainMonths}개월`
}

// ── 실현 가능성 체크 (목표 생성 플로우와 동일한 API/util 재사용) ──────────────
// 필요 저축액 계산 자체는 프론트에서 하지 않고, 목표 생성 때와 같은 백엔드
// 실현가능성 조회 API(POST /goals/possibility)를 그대로 호출한다. 목표 재설정은
// 이미 모은 금액(goal.currentAmount)이 존재하므로 이를 startAmount로 함께 보내
// "남은 필요 금액 = 목표 금액 - 현재 달성 금액" 기준으로 계산되게 한다.
const isCheckingFeasibility = ref(false)
const feasibilityCheckError = ref('')
const feasibility = ref(null)
const pendingGoalAmount = ref(0)
const pendingGoalMonths = ref(0)

async function handleCheckFeasibility() {
  validationError.value = ''
  if (!validateForm()) return

  pendingGoalAmount.value = form.goalAmount
  pendingGoalMonths.value = calculateGoalMonths(form.goalMonth)
  selectedAlternative.value = ''
  recalculatedFeasibility.value = null
  adjustedAmount.value = pendingGoalAmount.value
  adjustedMonths.value = pendingGoalMonths.value

  feasibilityCheckError.value = ''
  isCheckingFeasibility.value = true
  try {
    const response = await goalApi.getFeasibility({
      goalAmount: pendingGoalAmount.value,
      goalMonths: pendingGoalMonths.value,
      startAmount: currentAmount.value,
      isStudentLoan: isStudentLoan.value,
    })
    feasibility.value = { ...response, ...resolveFeasibilityStatus(response) }
    step.value = 'result'
  } catch (err) {
    feasibilityCheckError.value = err.message ?? '실현 가능성을 확인하지 못했습니다.'
  } finally {
    isCheckingFeasibility.value = false
  }
}

// 학자금 대출은 원리금 균등상환액을, 그 외 목표는 API가 계산한 필요 저축액을 사용한다.
const effectiveRequiredMonthly = computed(() => {
  if (isStudentLoan.value) {
    const loanCalc = calculateStudentLoan({
      amount: Math.max(0, pendingGoalAmount.value - currentAmount.value),
      months: pendingGoalMonths.value,
    })
    return loanCalc.monthlyPayment
  }
  return Number(feasibility.value?.requiredMonthly) || 0
})
const effectiveAvailableMonthly = computed(() => Number(feasibility.value?.availableMonthly) || 0)
const effectiveStatus = computed(() => {
  const req = effectiveRequiredMonthly.value
  const avail = effectiveAvailableMonthly.value
  if (avail <= 0) return 'danger'
  if (req <= 0) return 'success'
  const rate = Math.min(100, Math.round((avail / req) * 100))
  return rate >= 80 ? 'success' : 'danger'
})

// CASE 3: 현재 페이스로 계속 모았을 때, 기존 목표보다 예상 달성이 얼마나 빨라지는지
const remainAmountNew = computed(() => Math.max(0, pendingGoalAmount.value - currentAmount.value))
const remainAmountOld = computed(() =>
  Math.max(0, Number(props.goal?.goalAmount ?? 0) - currentAmount.value)
)
function monthsNeededAtCurrentPace(remainAmount) {
  if (effectiveAvailableMonthly.value <= 0) return Infinity
  return Math.ceil(remainAmount / effectiveAvailableMonthly.value)
}
const shortenedMonths = computed(() => {
  const oldMonths = monthsNeededAtCurrentPace(remainAmountOld.value)
  const newMonths = monthsNeededAtCurrentPace(remainAmountNew.value)
  if (!Number.isFinite(oldMonths) || !Number.isFinite(newMonths)) return 0
  return Math.max(0, oldMonths - newMonths)
})
const isImproved = computed(() => effectiveStatus.value === 'success' && shortenedMonths.value > 0)

const headline = computed(() => {
  if (effectiveStatus.value !== 'success') {
    const shortfall = Math.max(
      0,
      effectiveRequiredMonthly.value - effectiveAvailableMonthly.value
    )
    return {
      tone: 'danger',
      title: '현재 페이스로는 목표일까지 달성이 어려워요',
      sub: `월 ${formatKRWCompact(shortfall)} 더 필요해요. 아래에서 계획을 조정해보세요.`,
    }
  }
  if (isImproved.value) {
    return {
      tone: 'success',
      title: '이전 목표보다 더 빠르게 달성할 수 있어요',
      sub: `현재 페이스라면 예상보다 약 ${shortenedMonths.value}개월 더 빨리 달성할 수 있어요.`,
    }
  }
  return {
    tone: 'success',
    title: '현재 페이스로 목표 달성이 가능해요',
    sub: '',
  }
})

// ── 조정 제안 (CASE 2, 목표 생성 플로우와 동일한 구조) ──────────────────────
const selectedAlternative = ref('')
const adjustedAmount = ref(0)
const adjustedMonths = ref(0)
const amountReduction = ref(20)
const isRecalculating = ref(false)
const recalculatedFeasibility = ref(null)

const ALTERNATIVES = computed(() => {
  const minMonths = 1
  const maxMonths = Math.max(pendingGoalMonths.value * 3, 24)
  const maxAmount = pendingGoalAmount.value || 10000000
  const minAmount = currentAmount.value
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
      min: minAmount,
      max: maxAmount,
      step: stepAmount,
      minLabel: formatKRWCompact(minAmount),
      maxLabel: formatKRWCompact(maxAmount),
    },
  ]
})

function getAdjustedGoalParams(key) {
  const baseAmount = pendingGoalAmount.value
  const baseMonths = pendingGoalMonths.value
  const baseStart = currentAmount.value

  if (!key) return { amount: baseAmount, months: baseMonths, startAmount: baseStart }
  if (key === 'period') return { amount: baseAmount, months: adjustedMonths.value, startAmount: baseStart }
  if (key === 'extra_capacity') return { amount: baseAmount, months: baseMonths, startAmount: baseStart }
  if (key === 'amount') return { amount: adjustedAmount.value, months: baseMonths, startAmount: baseStart }
  return { amount: baseAmount, months: baseMonths, startAmount: baseStart }
}

const recalculatedReqMonthly = computed(() => {
  if (!selectedAlternative.value) return 0
  const adjusted = getAdjustedGoalParams(selectedAlternative.value)
  if (isStudentLoan.value) {
    const loanCalc = calculateStudentLoan({
      amount: Math.max(0, adjusted.amount - adjusted.startAmount),
      months: adjusted.months,
    })
    return loanCalc.monthlyPayment
  }
  if (recalculatedFeasibility.value?.requiredMonthly !== undefined) {
    return Number(recalculatedFeasibility.value.requiredMonthly)
  }
  return (
    Math.max(0, Math.round((adjusted.amount - adjusted.startAmount) / adjusted.months)) || 0
  )
})

const displayRequiredMonthly = computed(() => {
  if (selectedAlternative.value && recalculatedReqMonthly.value > 0) {
    return recalculatedReqMonthly.value
  }
  return effectiveRequiredMonthly.value
})

const displayAvailableMonthly = computed(() => {
  if (selectedAlternative.value === 'extra_capacity') {
    return effectiveAvailableMonthly.value + amountReduction.value * 10000
  }
  return effectiveAvailableMonthly.value
})

const displayStatus = computed(() => {
  const req = displayRequiredMonthly.value
  const avail = displayAvailableMonthly.value
  if (avail <= 0) return 'danger'
  if (req <= 0) return 'success'
  const rate = Math.min(100, Math.round((avail / req) * 100))
  return rate >= 80 ? 'success' : 'danger'
})

const displayMonths = computed(() => getAdjustedGoalParams(selectedAlternative.value).months)

const stats = computed(() => {
  const adjusted = getAdjustedGoalParams(selectedAlternative.value)
  return [
    {
      label: isStudentLoan.value ? '대출 목표' : '목표 금액',
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

const isAdjustmentVisible = computed(() => effectiveStatus.value === 'danger')
const recalculatedPossible = computed(() => displayStatus.value === 'success')

watch([selectedAlternative, amountReduction, adjustedAmount, adjustedMonths], async ([key]) => {
  if (!key) {
    recalculatedFeasibility.value = null
    return
  }

  isRecalculating.value = true
  try {
    const adjusted = getAdjustedGoalParams(key)
    const response = await goalApi.getFeasibility({
      goalAmount: adjusted.amount,
      goalMonths: adjusted.months,
      startAmount: adjusted.startAmount,
      isStudentLoan: isStudentLoan.value,
    })
    recalculatedFeasibility.value = { ...response, ...resolveFeasibilityStatus(response) }
  } catch {
    // 재계산 실패는 조용히 무시한다. 사용자는 다른 대안을 다시 시도할 수 있다.
  } finally {
    isRecalculating.value = false
  }
})

const saveDisabled = computed(() => {
  if (props.saving) return true
  if (effectiveStatus.value === 'danger') {
    if (!selectedAlternative.value) return true
    if (!recalculatedPossible.value) return true
  }
  return false
})

const saveButtonLabel = computed(() => {
  if (props.saving) return '저장 중'
  if (effectiveStatus.value === 'danger') {
    if (!selectedAlternative.value) return '대안을 선택해 주세요'
    if (!recalculatedPossible.value) return '대안을 더 조정해 주세요'
    return '조정된 계획으로 저장하기'
  }
  return '재설정 저장하기'
})

function handleFinalSave() {
  if (saveDisabled.value) return
  const adjusted = getAdjustedGoalParams(selectedAlternative.value)
  emit('submit', {
    goalAmount: adjusted.amount,
    goalMonths: adjusted.months,
    status: form.status,
  })
}

watch(
  () => props.modelValue,
  (opened) => {
    if (opened) resetForm()
  }
)
</script>

<style scoped>
/* 이 모달의 CTA 문구(예: "조정된 계획으로 저장하기")가 길어 두 줄로 깨지는 걸 막기 위해
   공용 .mypage-modal-primary/-secondary보다 살짝 작게 스코프 안에서만 덮어쓴다. */
.mypage-modal-actions .mypage-modal-primary,
.mypage-modal-actions .mypage-modal-secondary {
  padding: 12px 10px;
  font-size: 13px;
}

@media (min-width: 400px) and (max-width: 480px) {
  .mypage-modal-actions .mypage-modal-primary,
  .mypage-modal-actions .mypage-modal-secondary {
    font-size: 15px;
  }
}
</style>
