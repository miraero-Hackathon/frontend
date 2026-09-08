// useCreditSimulator.js
import { computed, ref } from 'vue'
import {
  CREDIT_BENEFIT_RANGES,
  CREDIT_NEGATIVE_ITEMS,
  CREDIT_POSITIVE_ITEMS,
  CREDIT_TABS,
  DEFAULT_CREDIT_TAB,
} from '../constants/credit.constants'
import { formatKoreanNumber } from '@/shared/lib/money'

export function useCreditSummary(creditInfo) {
  const currentScore = computed(() => creditInfo.value?.score ?? 0)
  const scoreChange = computed(() => creditInfo.value?.monthlyChange ?? 0)

  // 점수 변동 방향
  const scoreChangeDirection = computed(() => {
    if (scoreChange.value > 0) return 'increase'
    if (scoreChange.value < 0) return 'decrease'
    return 'default'
  })

  // 강조 텍스트
  const scoreChangeHighlightText = computed(() => {
    const absChange = Math.abs(scoreChange.value)
    if (scoreChangeDirection.value === 'increase') return `${absChange}점 상승`
    if (scoreChangeDirection.value === 'decrease') return `${absChange}점 하락`
    return '변동 없음'
  })

  // 카드 2번용 설명 텍스트
  const scoreChangeDescription = computed(() => {
    return `전월 대비 ${scoreChangeHighlightText.value}`
  })

  // 색상 톤 지정
  const scoreChangeTone = computed(() => {
    if (scoreChangeDirection.value === 'increase') return 'positive'
    if (scoreChangeDirection.value === 'decrease') return 'coral'
    return 'default'
  })

  return {
    currentScore,
    scoreChange,
    scoreChangeDirection,
    scoreChangeHighlightText,
    scoreChangeDescription,
    scoreChangeTone,
  }
}

export function useCreditSimulator(userCreditScore) {
  const activeTab = ref(DEFAULT_CREDIT_TAB)

  // 현재 사용자의 점수 구간 계산
  const currentBenefitRange = computed(() => {
    const score = userCreditScore.value
    return CREDIT_BENEFIT_RANGES.find((range) => score >= range.minScore && score <= range.maxScore)
  })

  // 점수대별 혜택 목록 (현재 내 구간 여부 플래그 추가)
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
