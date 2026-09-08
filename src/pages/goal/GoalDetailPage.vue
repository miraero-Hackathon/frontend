<!-- 목표 구체화 페이지 (GOAL-02) -->
<template>
  <HeroBackground class="font-['Noto_Sans_KR',sans-serif]">
    <StepHeader @back="handleBack" />

    <div
      class="relative z-10 mx-auto w-full max-w-[660px] animate-fade-in-up px-4 pt-3 sm:pt-6 pb-36 md:pb-8"
    >
      <ProgressBar :current-step="2" :total-steps="4" />

      <!-- 메인 헤드라인 & 서브 설명 -->
      <h1
        class="mt-4 sm:mt-6 whitespace-pre-line sm:whitespace-normal text-2xl sm:text-[28px] font-black tracking-tight leading-snug text-gray-900 break-keep"
      >
        {{ config.title }}
      </h1>
      <p class="mt-2 sm:mt-2.5 text-[13px] sm:text-sm font-medium text-slate-500">금액과 기간을 설정해 주세요.</p>

      <!-- 1. 학자금 대출 상환 전용 UI -->
      <template v-if="isStudentLoan">
        <div class="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
          <!-- 카드 1: 남은 대출 잔액 (원금) -->
          <div
            class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(15,35,70,0.03)]"
          >
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-gray-900">남은 대출 잔액 (원금)</label>
              <span
                class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[13px] font-bold text-emerald-600"
              >
                <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                마이데이터 자동 연동
              </span>
            </div>
            <div
              class="mt-3 flex items-center rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 transition-all focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20"
            >
              <input
                :value="formatInputNumber(amount)"
                type="text"
                inputmode="numeric"
                class="w-full bg-transparent text-xl font-bold text-gray-900 outline-none"
                @input="handleAmountInput"
              />
              <span class="shrink-0 text-sm font-bold text-slate-400">원</span>
            </div>
            <div class="mt-2 flex items-center justify-between text-[13px] font-semibold">
              <span class="text-primary">{{ amountCaption }}</span>
              <span class="text-slate-400">연 1.7% 고정금리 (정부 학자금)</span>
            </div>
          </div>

          <!-- 카드 2: 완납 기간 슬라이더 & 월 납입액 -->
          <PeriodSliderCard
            v-model="months"
            label="완납 기간"
            caption="슬라이더를 조절하면 이자 포함 상환 계획이 자동으로 계산돼요."
            result-label="월 납입액 (이자 포함)"
            :result-value="`${loanResult.monthlyPayment.toLocaleString()}원`"
            result-caption="원리금균등상환 기준 · 연 1.7% 적용"
            :min="config.periodMin"
            :max="config.periodMax"
            :presets="config.periodPresets"
          />

          <!-- 카드 3: 이자 포함 상환 계획 카드 -->
          <div
            class="rounded-3xl border border-primary/20 bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(15,35,70,0.03)]"
          >
            <div class="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 class="text-base font-bold text-gray-900">이자 포함 상환 계획</h3>
              <span class="rounded-full bg-blue-50 px-3 py-1 text-[13px] font-bold text-primary">
                연 1.7% 고정
              </span>
            </div>

            <!-- 비율 프로그레스 바 -->
            <div class="mt-4">
              <div
                class="mb-1.5 flex items-center justify-between text-[13px] font-bold text-slate-500"
              >
                <span>원금 {{ loanResult.principalRatio }}%</span>
                <span>이자 {{ loanResult.interestRatio }}%</span>
              </div>
              <div class="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  class="h-full bg-primary transition-all duration-300"
                  :style="{ width: `${loanResult.principalRatio}%` }"
                ></div>
                <div
                  class="h-full bg-amber-400 transition-all duration-300"
                  :style="{ width: `${loanResult.interestRatio}%` }"
                ></div>
              </div>
            </div>

            <!-- 하단 총 갚아야 할 금액 박스 -->
            <div
              class="mt-4 rounded-2xl bg-blue-50/70 border border-blue-100 p-4 flex items-center justify-between"
            >
              <div>
                <p class="text-[13px] font-bold text-gray-900">총 갚아야 할 금액</p>
                <p class="mt-0.5 text-[13px] text-slate-400">원금 + 이자 합계</p>
              </div>
              <div class="text-right">
                <p class="text-lg sm:text-xl font-bold text-primary">
                  약 {{ formatKRWCompact(loanResult.totalPayment) }}
                </p>
                <p class="mt-0.5 text-[13px] text-slate-400">
                  월 {{ loanResult.monthlyPayment.toLocaleString() }}원 × {{ months }}개월
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 2. 일반 목표 UI (비상금 / 독립자금 / 결혼자금) -->
      <template v-else>
        <div class="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
          <!-- 카드 1: [목표 금액 & 기간 설정 스마트 카드] -->
          <div
            class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(15,35,70,0.03)]"
          >
            <!-- 1) 목표 금액 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-bold text-gray-900">
                  {{ config.amountLabel }}
                </label>
              </div>

              <!-- 프리셋 카드 형태인 경우 (결혼자금 등) -->
              <div v-if="config.amountFieldType === 'presetCard'" class="space-y-3">
                <div
                  class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 transition-all focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20"
                >
                  <input
                    :value="formatInputNumber(amount)"
                    type="text"
                    inputmode="numeric"
                    placeholder="0"
                    class="w-full bg-transparent text-xl font-bold text-gray-900 outline-none"
                    @input="handleAmountInput"
                  />
                  <span class="shrink-0 text-sm font-bold text-slate-400">원</span>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="preset in config.amountPresets"
                    :key="preset.key"
                    type="button"
                    class="flex min-h-12 flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition-all"
                    :class="
                      amount === preset.value
                        ? 'border-[#0066FF] bg-[#EBF3FF] text-[#0066FF] font-bold ring-1 ring-[#0066FF]/20'
                        : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                    "
                    @click="amount = preset.value"
                  >
                    <span
                      class="text-[13px] font-medium"
                      :class="amount === preset.value ? 'text-[#0066FF]/80' : 'text-slate-500'"
                    >
                      {{ preset.title }}
                    </span>
                    <span class="text-sm font-bold mt-0.5">
                      {{ formatKRWCompact(preset.value) }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- 일반 금액 입력창 (비상금, 독립자금) -->
              <div v-else class="space-y-3">
                <div
                  class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 transition-all focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20"
                >
                  <input
                    :value="formatInputNumber(amount)"
                    type="text"
                    inputmode="numeric"
                    placeholder="0"
                    class="w-full bg-transparent text-xl font-bold text-gray-900 outline-none"
                    @input="handleAmountInput"
                  />
                  <span class="shrink-0 text-sm font-bold text-slate-400">원</span>
                </div>

                <!-- 금액 프리셋 큼직한 그리드 버튼 -->
                <div
                  v-if="config.amountPresets && config.amountPresets.length"
                  class="grid gap-2"
                  :class="
                    config.amountPresets.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
                  "
                >
                  <button
                    v-for="preset in config.amountPresets"
                    :key="preset.label"
                    type="button"
                    class="flex min-h-11 items-center justify-center rounded-2xl border py-2.5 text-[13px] font-bold transition-all sm:text-sm"
                    :class="
                      amount === preset.value
                        ? 'border-[#0066FF] bg-[#EBF3FF] text-[#0066FF] ring-1 ring-[#0066FF]/20'
                        : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                    "
                    @click="amount = preset.value"
                  >
                    {{ preset.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 구분선 -->
            <div class="my-4 border-t border-slate-100"></div>

            <!-- 2) 모으는 기간 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-bold text-gray-900">
                  {{ config.periodLabel }}
                </label>
                <span class="text-sm font-bold text-gray-900">
                  {{ formatPeriodHuman(months) }}
                </span>
              </div>

              <!-- 기간 슬라이더 -->
              <div class="py-1">
                <input
                  v-model.number="months"
                  type="range"
                  :min="config.periodMin"
                  :max="config.periodMax"
                  step="1"
                  class="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-primary border border-slate-300/80 shadow-inner transition-all"
                  :style="{
                    background: `linear-gradient(to right, #0066FF 0%, #0066FF ${((months - config.periodMin) / (config.periodMax - config.periodMin)) * 100}%, #E2E8F0 ${((months - config.periodMin) / (config.periodMax - config.periodMin)) * 100}%, #E2E8F0 100%)`
                  }"
                />
                <div class="mt-1.5 flex justify-between text-[13px] font-bold text-slate-500">
                  <span>{{ config.periodMin }}개월</span>
                  <span>{{ config.periodMax }}개월</span>
                </div>
              </div>

              <!-- 기간 퀵 프리셋 큼직한 그리드 버튼 -->
              <div
                v-if="config.periodPresets && config.periodPresets.length"
                class="grid gap-2 mt-3"
                :class="config.periodPresets.length === 4 ? 'grid-cols-4' : 'grid-cols-3'"
              >
                <button
                  v-for="preset in config.periodPresets"
                  :key="preset.label"
                  type="button"
                  class="flex min-h-10 items-center justify-center rounded-2xl border py-2 text-[13px] font-bold transition-all sm:text-sm"
                  :class="
                    months === preset.value
                      ? 'border-[#0066FF] bg-[#EBF3FF] text-[#0066FF] ring-1 ring-[#0066FF]/20'
                      : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  "
                  @click="months = preset.value"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <!-- 3) 이미 모아둔 돈: 결과 계산 전에 입력 -->
            <div class="mt-4 border-t border-slate-100 pt-4">
              <div
                v-if="!isSeedMoneyOpen && startAmount === 0"
                class="flex cursor-pointer items-center justify-between text-[13px] font-bold text-gray-500 transition-colors hover:text-primary"
                @click="openSeedMoney"
              >
                <span>이미 모아둔 돈이 있나요? (선택)</span>
                <span class="font-bold text-primary hover:underline">+ 입력하기</span>
              </div>

              <div v-else class="space-y-2 animate-fade-in">
                <div class="flex items-center justify-between text-[13px]">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-gray-900">이미 모아둔 돈</span>
                    <span v-if="startAmount > 0" class="font-bold text-primary">
                      = {{ formatKRWReadable(startAmount) }}
                    </span>
                  </div>
                  <button
                    type="button"
                    class="shrink-0 text-[13px] font-semibold text-gray-400 hover:text-primary transition-colors"
                    @click="closeSeedMoney"
                  >
                    닫기
                  </button>
                </div>
                <div
                  class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 transition-all focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20"
                >
                  <input
                    :value="formatInputNumber(startAmount)"
                    type="text"
                    inputmode="numeric"
                    placeholder="0"
                    class="w-full bg-transparent text-sm font-bold text-gray-900 outline-none sm:text-base"
                    @input="handleStartAmountInput"
                  />
                  <span class="shrink-0 text-[13px] font-bold text-slate-400">원</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 카드 2: [매달 모을 돈 & 시뮬레이션 결과 카드] -->
          <div
            class="rounded-3xl border border-primary/25 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/40 p-5 shadow-[0_4px_24px_rgba(15,35,70,0.04)]"
          >
            <div>
              <p class="text-[13px] font-semibold text-slate-500">월 예상 저축액</p>
              <p class="mt-1 text-2xl font-bold text-primary sm:text-[26px]">
                매달 약 {{ monthlyAmountLabel }}
              </p>
              <p class="mt-1 text-[13px] font-medium text-slate-400">
                {{ formatPeriodHuman(months) }} 동안 모을 때의 예상 금액이에요.
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- 하단 안내 문구 -->
      <p class="mt-4 flex items-start gap-1.5 text-[13px] leading-relaxed text-slate-400 font-medium">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mt-0.5 size-3.5 shrink-0"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 8h.01" />
        </svg>
        <span>연결된 정보를 반영해 예상 금액을 계산해요.</span>
      </p>
    </div>

    <BottomCTA
      label="실현 가능성 확인"
      :disabled="ctaDisabled"
      desktop-static
      @click="handleNext"
    />
  </HeroBackground>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import HeroBackground from '@/shared/ui/HeroBackground.vue'
import StepHeader from '@/shared/ui/StepHeader.vue'
import ProgressBar from '@/shared/ui/ProgressBar.vue'
import BottomCTA from '@/shared/ui/BottomCTA.vue'
import PeriodSliderCard from '@/shared/ui/PeriodSliderCard.vue'
import { useGoalStore } from '@/features/goal'
import { GOAL_PRESET_IDS } from '@/features/goal/constants/goal.constants.js'
import {
  GOAL_DETAIL_CONFIG,
  DEFAULT_GOAL_DETAIL_CONFIG,
} from '@/features/goal/constants/goalDetailConfig.js'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { formatKRWCompact, formatKRWReadable } from '@/shared/lib/money'
import { calculateStudentLoan, calculateExtraLoanRepayment } from '@/features/goal/lib/loan.js'

const router = useRouter()
const goalStore = useGoalStore()
const { selectedGoalPresetId, goalParams } = storeToRefs(goalStore)

const isStudentLoan = computed(() => selectedGoalPresetId.value === GOAL_PRESET_IDS.STUDENT_LOAN)

const config = computed(
  () => GOAL_DETAIL_CONFIG[selectedGoalPresetId.value] ?? DEFAULT_GOAL_DETAIL_CONFIG
)

// goalParams에 이전에 입력했던 저장값이 있다면 복원, 없으면 기본값 적용
const amount = ref(goalParams.value?.amount ?? config.value.defaultAmount)
const initialMonths = goalParams.value?.months ?? config.value.periodDefault
const months = ref(
  Math.min(config.value.periodMax, Math.max(config.value.periodMin, initialMonths))
)
const startAmount = ref(goalParams.value?.startAmount ?? 0)
const isSeedMoneyOpen = ref((goalParams.value?.startAmount ?? 0) > 0)
const extraPayment = ref(goalParams.value?.extraPayment ?? 0) // 학자금 대출용 추가 상환 여력

function openSeedMoney() {
  isSeedMoneyOpen.value = true
}

function closeSeedMoney() {
  isSeedMoneyOpen.value = false
  startAmount.value = 0
}

function parseNumericInput(value) {
  const digits = String(value).replace(/[^0-9]/g, '')
  return digits ? Number(digits) : 0
}

function formatInputNumber(value) {
  return value ? Number(value).toLocaleString('ko-KR') : ''
}

function handleAmountInput(event) {
  amount.value = parseNumericInput(event.target.value)
  event.target.value = formatInputNumber(amount.value)
}

function handleStartAmountInput(event) {
  startAmount.value = parseNumericInput(event.target.value)
  event.target.value = formatInputNumber(startAmount.value)
}

onMounted(() => {
  if (goalParams.value) {
    if (typeof goalParams.value.amount === 'number') amount.value = goalParams.value.amount
    if (typeof goalParams.value.months === 'number') {
      months.value = Math.min(
        config.value.periodMax,
        Math.max(config.value.periodMin, goalParams.value.months)
      )
    }
    if (typeof goalParams.value.startAmount === 'number')
      startAmount.value = goalParams.value.startAmount
    if (typeof goalParams.value.extraPayment === 'number')
      extraPayment.value = goalParams.value.extraPayment
  }
})

const loanResult = computed(() =>
  calculateStudentLoan({
    amount: amount.value,
    months: months.value,
    annualRate: 0.017,
  })
)

const extraLoanResult = computed(() =>
  calculateExtraLoanRepayment({
    amount: amount.value,
    months: months.value,
    extraPayment: extraPayment.value,
    annualRate: 0.017,
  })
)

const amountCaption = computed(() =>
  amount.value > 0 ? `= ${formatKRWReadable(amount.value)}` : ''
)
const monthlyAmountLabel = computed(() => {
  const netAmount = Math.max(0, (amount.value || 0) - (startAmount.value || 0))
  return formatKRWCompact(netAmount / (months.value || 1))
})

function formatPeriodHuman(m) {
  if (!m) return ''
  if (m % 12 === 0) return `${m / 12}년`
  if (m > 12) return `${Math.floor(m / 12)}년 ${m % 12}개월`
  return `${m}개월`
}

const ctaDisabled = computed(
  () => !amount.value || amount.value <= 0 || startAmount.value > amount.value
)

function handleBack() {
  router.push({ name: ROUTE_NAMES.GOAL_SELECT })
}

function handleNext() {
  // 상세 화면에서 값을 다시 확정하면 이전 실현가능성 페이지의 조정 초안은 더 이상 유효하지 않다.
  goalStore.feasibilityAdjustment = null
  goalStore.recalculatedFeasibility = null

  goalStore.goalParams = {
    amount: amount.value,
    months: months.value,
    startAmount: startAmount.value,
    extraPayment: extraPayment.value,
    loanResult: isStudentLoan.value
      ? {
          ...loanResult.value,
          monthlyPayment: extraLoanResult.value.newMonthlyPayment, // 추가 상환액 포함 월 납입액(725,866원)
          originalMonthly: loanResult.value.monthlyPayment,
          savedInterest: extraLoanResult.value.savedInterest,
          reducedMonths: extraLoanResult.value.reducedMonths,
          newMonths: extraLoanResult.value.newMonths,
        }
      : null,
  }
  router.push({ name: ROUTE_NAMES.GOAL_FEASIBILITY })
}
</script>
