<template>
  <div class="mx-auto max-w-md space-y-3 px-4 pb-32 sm:space-y-6">
    <!-- <div class="space-y-6 pb-32"> -->
    <!-- 상단 텍스트 -->
    <header class="space-y-2">
      <!-- 공통 StepHeader 적용 -->
      <StepHeader
        :current-step="2"
        :total-steps="3"
        goal-label="🎓 학자금 대출 상환"
        step-label="STEP 2 — 목표 구체화"
        @back="router.back()"
      />

      <!-- 메인 타이틀 (헤더 바로 아래 배치) -->
      <h1 class="mt-2 mb-6 break-keep whitespace-pre-line text-xl font-bold text-gray-900 sm:text-2xl">
        빚 없는 출발, 언제까지 완납할까요?
      </h1>
    </header>

    <!-- 1. 남은 대출 잔액 -->
    <BaseCard>
      <div class="flex items-center justify-between mb-4">
        <label class="block text-sm font-bold text-gray-700">남은 대출 잔액</label>
        <span class="rounded-full bg-green-100 px-2 py-0.5 text-[13px] font-bold text-green-700"
          >마이데이터 자동 연동</span
        >
      </div>
      <AmountInput v-model="loanBalance" />

      <div class="mt-3 flex items-center space-x-3 text-[13px] font-medium text-blue-500">
        <span>= {{ Math.floor(loanBalance / 10000).toLocaleString() }}만원</span>
        <span>연 1.7% 고정금리 (정부 학자금)</span>
      </div>
    </BaseCard>

    <!-- 2. 완납 기간 -->
    <BaseCard>
      <!-- 타이틀 및 우측 상단 개월 수 표시 -->
      <div class="flex justify-between items-start mb-1">
        <label class="block text-sm font-bold text-gray-700">완납 기간</label>
        <span class="text-sm font-bold text-blue-600">{{ repaymentPeriod }}개월</span>
      </div>
      <p class="mb-6 text-[13px] text-gray-500">
        슬라이더를 조절하면 이자 포함 상환 계획이 자동으로 계산돼요
      </p>

      <!-- 심플한 네이티브 슬라이더 적용 (인풋 박스 제거) -->
      <input
        v-model="repaymentPeriod"
        type="range"
        min="6"
        max="60"
        class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />

      <!-- 양 끝단 개월 수 표시 -->
      <div class="mt-2 flex justify-between text-[13px] text-gray-400">
        <span>6개월</span>
        <span>60개월</span>
      </div>

      <!-- 월 납입액 안내 박스 -->
      <div class="mt-6 p-4 rounded-lg bg-gray-50">
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm font-medium text-gray-600">월 납입액(이자 포함)</span>
          <span class="text-xl font-bold text-blue-600">{{ formattedMonthlyPayment }}원</span>
        </div>
        <p class="text-[13px] text-gray-400">원리금균등상환 기준 · 연 1.7% 적용</p>
      </div>
    </BaseCard>

    <!-- 3. 이자 포함 상환 계획 -->
    <BaseCard>
      <label class="block text-sm font-bold text-gray-700 mb-4">이자 포함 상환 계획</label>
      <div class="flex h-4 w-full rounded-full overflow-hidden mb-3">
        <div class="h-full bg-blue-600" :style="{ width: principalRatio + '%' }"></div>
        <div class="h-full bg-yellow-400" :style="{ width: interestRatio + '%' }"></div>
      </div>
      <!-- 범례 (파란점, 노란점) 추가 -->
      <div class="mb-6 flex items-center space-x-4 text-[13px] text-gray-500">
        <div class="flex items-center">
          <span class="w-2 h-2 rounded-full bg-blue-600 mr-1"></span>원금 {{ formattedPrincipal }}원
        </div>
        <div class="flex items-center">
          <span class="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>이자
          {{ formattedInterest }}원
        </div>
      </div>
      <div class="space-y-2 text-sm text-gray-600">
        <div class="flex justify-between">
          <span>원금</span>
          <span class="font-semibold text-gray-900">{{ formattedPrincipal }}원</span>
        </div>
        <div class="flex justify-between">
          <span>이자 총액</span>
          <span class="font-semibold text-gray-900">{{ formattedInterest }}원</span>
        </div>
        <div class="flex justify-between pt-2 border-t border-gray-100">
          <span class="font-bold text-gray-900">총 갚아야 할 금액</span>
          <span class="font-bold text-blue-600">{{ formattedTotal }}원</span>
        </div>
      </div>
    </BaseCard>

    <!-- 4. 추가 상환 여력 -->
    <BaseCard>
      <label class="block text-sm font-bold text-gray-700">추가 상환 여력</label>
      <p class="mt-1 mb-4 text-[13px] text-gray-500">선택 사항 — 매달 더 갚으면 이자도 줄어들어요</p>
      <AmountInput v-model="extraPayment" />
    </BaseCard>

    <!-- 하단 영역 -->
    <p class="text-center text-[13px] text-gray-400">
      이자는 원리금균등상환 방식으로 계산됩니다. 정확한 이자율은 금융기관별로 상이할 수 있습니다.
    </p>

    <!-- 하단 고정 버튼 -->
    <BottomFixedButton :disabled="!isFormValid" @click="handleCheckFeasibility">
      실현 가능성 확인 >
    </BottomFixedButton>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/shared/ui/BaseCard.vue'
import AmountInput from '@/shared/ui/AmountInput.vue'
import BottomFixedButton from '@/shared/ui/BottomFixedButton.vue'
import { useGoalStore } from '@/features/goal/store/goal.store'

import StepHeader from '@/shared/ui/StepHeader.vue'

const router = useRouter()
const goalStore = useGoalStore()

const loanBalance = ref(10000000)
const repaymentPeriod = ref(24)
const extraPayment = ref(0)

const isFormValid = computed(() => {
  return loanBalance.value > 0 && repaymentPeriod.value > 0
})

// 계산 로직 예시 (단순화된 시뮬레이션)
const principal = computed(() => loanBalance.value)

const interest = computed(() => total.value - principal.value)
const total = computed(() => monthlyPayment.value * repaymentPeriod.value)

// 연 1.7% 원리금균등상환 공식 적용
const monthlyPayment = computed(() => {
  if (repaymentPeriod.value === 0 || loanBalance.value === 0) return 0
  const monthlyRate = 0.017 / 12 // 연 1.7%를 12개월로 나눈 월 이율
  const n = repaymentPeriod.value
  const p = loanBalance.value

  //원리금균등상환 월 납입금 공식
  return Math.round(
    (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
  )
})

const principalRatio = computed(() => (principal.value / total.value) * 100)
const interestRatio = computed(() => (interest.value / total.value) * 100)

const format = (val) => val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const formattedMonthlyPayment = computed(() => format(monthlyPayment.value))
const formattedPrincipal = computed(() => format(principal.value))
const formattedInterest = computed(() => format(interest.value))
const formattedTotal = computed(() => format(total.value))

/**
 * 실현 가능성 확인 버튼 클릭 핸들러
 */
async function handleCheckFeasibility() {
  // TODO: 현재 컴포넌트의 상태를 Pinia 스토어에 저장할 예정
  goalStore.goalParams = {
    amount: loanBalance.value,
    period: repaymentPeriod.value,
    seedMoney: extraPayment.value,
  }

  // TODO: 향후 'POST /api/goals/possible' API를 호출할 예정
  console.log('API 호출 준비:', goalStore.goalParams)

  router.push('/goal/feasibility')
}
</script>
