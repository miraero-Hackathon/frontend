import { computed, ref } from 'vue'
import {
  CREDIT_BENEFIT_RANGES,
  CREDIT_NEGATIVE_ITEMS,
  CREDIT_POSITIVE_ITEMS,
  CREDIT_TABS,
  DEFAULT_CREDIT_TAB,
} from '../constants/credit.constants'

export function useCreditSummary(currentScore, historyList) {
  // 가장 최근 변동 내역의 delta값을 이번 달 점수 변동량으로 사용
  const monthlyChange = computed(() => {
    if (!historyList.value || historyList.value.length === 0) return 0
    return historyList.value[0].delta ?? 0
  })

  const scoreChangeDirection = computed(() => {
    if (monthlyChange.value > 0) return 'increase'
    if (monthlyChange.value < 0) return 'decrease'
    return 'default'
  })

  const scoreChangeHighlightText = computed(() => {
    const absChange = Math.abs(monthlyChange.value)
    if (scoreChangeDirection.value === 'increase') return `+${absChange}`
    if (scoreChangeDirection.value === 'decrease') return `-${absChange}`
    return '0'
  })

  const scoreChangeDescription = computed(() => {
    if (scoreChangeDirection.value === 'increase') return '전월 대비 상승'
    if (scoreChangeDirection.value === 'decrease') return '전월 대비 하락'
    return '전월 대비 변동 없음'
  })

  const scoreChangeTone = computed(() => {
    if (scoreChangeDirection.value === 'increase') return 'positive'
    if (scoreChangeDirection.value === 'decrease') return 'coral'
    return 'default'
  })

  return {
    monthlyChange,
    scoreChangeDirection,
    scoreChangeHighlightText,
    scoreChangeDescription,
    scoreChangeTone,
  }
}

export function useCreditSimulator(currentScore) {
  const activeTab = ref(DEFAULT_CREDIT_TAB)

  const currentBenefitRange = computed(() => {
    const score = currentScore.value
    return CREDIT_BENEFIT_RANGES.find((range) => score >= range.minScore && score <= range.maxScore)
  })

  const benefitRanges = computed(() => {
    return CREDIT_BENEFIT_RANGES.map((range) => ({
      ...range,
      isUserRange: range.id === currentBenefitRange.value?.id,
    }))
  })

  return {
    activeTab,
    tabs: CREDIT_TABS,
    benefitRanges,
    positiveItems: CREDIT_POSITIVE_ITEMS,
    negativeItems: CREDIT_NEGATIVE_ITEMS,
  }
}
