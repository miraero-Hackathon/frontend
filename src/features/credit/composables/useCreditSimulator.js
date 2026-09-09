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
 *
 * @param {Date} today 기준 날짜 (기본값: 오늘)
 * @param {'6MONTHS' | 'HALF_YEAR'} mode 계산 방식 선택
 *   - '6MONTHS': 오늘 기준 정확히 6개월 전 1일 (예: 2026년 2월 15일 -> 2025년 8월 1일)
 *   - 'HALF_YEAR': 반기(3월/9월) 주기 기준 (예: 2026년 2월 15일 -> 2025년 3월 1일)
 */
function getCutoffDate(today = new Date(), mode = '6MONTHS') {
  const year = today.getFullYear()
  const month = today.getMonth() // 0 = 1월, 1 = 2월, ..., 11 = 12월

  if (mode === 'HALF_YEAR') {
    // 반기(3월/9월) 기준 롤링
    if (month >= 8) {
      // 9월 ~ 12월 -> 올해 3월 1일
      return new Date(year, 2, 1, 0, 0, 0)
    } else if (month >= 2) {
      // 3월 ~ 8월 -> 작년 9월 1일 (연도 이월)
      return new Date(year - 1, 8, 1, 0, 0, 0)
    } else {
      // 1월 ~ 2월 -> 작년 3월 1일 (연도 이월)
      return new Date(year - 1, 2, 1, 0, 0, 0)
    }
  }

  // 기본값 '6MONTHS': 현재 달 기준 정확히 6개월 전 1일 00:00:00
  // JS Date 객체 특성: month에 음수가 들어가면 연도가 자동으로 차감됨
  // 예: 2026년 2월(month=1) - 6 = -5 -> 2025년 8월 1일로 자동 전환
  return new Date(year, month - 6, 1, 0, 0, 0)
}

/**
 * 2. 특정 기준일(cutoffDate) 시점의 신용 점수를 이력에서 탐색/역산
 *
 * @param {Array} historyList 신용점수 변동 이력 배열 (occurredAt 내림차순 정렬 상태)
 * @param {number} currentScore 현재 신용 점수
 * @param {Date} cutoffDate 기준 날짜
 */
function findScoreAsOf(historyList, currentScore, cutoffDate) {
  const scoreNum = Number(currentScore) || 0

  if (!Array.isArray(historyList) || historyList.length === 0) {
    return scoreNum // 변동 이력이 없으면 현재 점수 그대로 반환
  }

  // historyList는 최신순(내림차순) 정렬되어 있음
  // cutoffDate(기준일) 이전(<)에 발생한 이력 중 가장 최신 항목 찾기
  const priorEvent = historyList.find((item) => {
    if (!item?.occurredAt) return false
    return new Date(item.occurredAt) < cutoffDate
  })

  // 기준일 이전 항목이 존재하면 해당 시점의 점수(scoreAfter) 반환
  if (priorEvent) {
    return Number(priorEvent.scoreAfter) ?? scoreNum
  }

  // 기준일 이전 이력이 없는 경우 (조회된 가장 오래된 이력보다 기준일이 더 과거인 경우)
  // 가장 오래된 이력(배열의 마지막)의 '변동 전 점수'를 역산: scoreAfter - delta
  const oldestEvent = historyList[historyList.length - 1]
  if (oldestEvent) {
    const scoreAfter = Number(oldestEvent.scoreAfter) ?? scoreNum
    const delta = Number(oldestEvent.delta) ?? 0
    return scoreAfter - delta
  }

  return scoreNum
}

/**
 * 3. Vue Composable / Custom Hook 형태
 */
export function useCreditSummary(currentScoreRef, historyListRef) {
  // 기준일 구하기 (6개월 전 1일)
  const cutoffDate = computed(() => getCutoffDate(new Date(), '6MONTHS'))

  // 기준 시점 점수 대비 변동치 계산
  const last6MonthsScoreChange = computed(() => {
    const currentScore = currentScoreRef.value ?? 0
    const historyList = historyListRef.value ?? []

    const baselineScore = findScoreAsOf(historyList, currentScore, cutoffDate.value)
    return currentScore - baselineScore
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

  // 설명문 텍스트 (예: "2025.08.01 이후 변동 합계")
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
