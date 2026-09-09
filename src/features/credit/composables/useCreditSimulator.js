import { computed, ref } from 'vue'
import {
  CREDIT_BENEFIT_RANGES,
  CREDIT_NEGATIVE_ITEMS,
  CREDIT_POSITIVE_ITEMS,
  CREDIT_TABS,
  DEFAULT_CREDIT_TAB,
} from '../constants/credit.constants'

/**
 * 1. 기준 날짜 구하기 (작년으로 넘어가는 연도 이월 처리 포함)
 */
function getCutoffDate(today = new Date(), mode = '6MONTHS') {
  const year = today.getFullYear()
  const month = today.getMonth() // 0 = 1월, 1 = 2월, ..., 11 = 12월

  if (mode === 'HALF_YEAR') {
    if (month >= 8) {
      return new Date(year, 2, 1, 0, 0, 0)
    } else if (month >= 2) {
      return new Date(year - 1, 8, 1, 0, 0, 0)
    } else {
      return new Date(year - 1, 2, 1, 0, 0, 0)
    }
  }

  // 기본값 '6MONTHS': 현재 달 기준 정확히 6개월 전 1일 00:00:00
  return new Date(year, month - 6, 1, 0, 0, 0)
}

/**
 * 2. 기준일(cutoffDate) 이후에 발생한 모든 delta 값을 누적 합산하는 함수
 */
function calculateTotalDelta(historyList, cutoffDate) {
  if (!Array.isArray(historyList) || historyList.length === 0) {
    return 0
  }

  return historyList.reduce((sum, item) => {
    if (!item?.occurredAt) return sum

    const eventDate = new Date(item.occurredAt)

    // 기준일 이후(>=)에 발생한 항목(동일 날짜/시간 중복 포함)의 delta를 모두 합산
    if (eventDate >= cutoffDate) {
      return sum + (Number(item.delta) || 0)
    }

    return sum
  }, 0)
}

/**
 * 3. Vue Composable / Custom Hook
 */
export function useCreditSummary(currentScoreRef, historyListRef) {
  // 기준일 구하기 (6개월 전 1일 00:00:00)
  const cutoffDate = computed(() => getCutoffDate(new Date(), '6MONTHS'))

  // 최근 6개월 이내 점수 변동 합계
  const last6MonthsScoreChange = computed(() => {
    const historyList = historyListRef.value ?? []
    return calculateTotalDelta(historyList, cutoffDate.value)
  })

  // 화면 출력용 강조 텍스트 (+25, -10, 0)
  const scoreChangeHighlightText = computed(() => {
    const change = last6MonthsScoreChange.value
    if (change > 0) return `+${change}`
    return `${change}`
  })

  // 텍스트 색상 톤 (양수: positive, 음수: coral, 동일: default)
  const scoreChangeTone = computed(() => {
    const change = last6MonthsScoreChange.value
    if (change > 0) return 'positive'
    if (change < 0) return 'coral'
    return 'default'
  })

  // 설명문 텍스트 (예: "2026.03.01 이후 변동")
  const scoreChangeDescription = computed(() => {
    const date = cutoffDate.value
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')

    return `${yyyy}.${mm}.${dd} 이후 변동`
  })

  return {
    last6MonthsScoreChange,
    scoreChangeHighlightText,
    scoreChangeTone,
    scoreChangeDescription,
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
