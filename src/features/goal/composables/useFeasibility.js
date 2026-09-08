// 목표 실현가능성(GOAL-03) 상태 판정: API가 계산한 필요/가능 저축액으로 '현실적/빠듯/무리' 등급만 매김
// 필요 저축액(requiredMonthly) 자체의 계산은 백엔드(실현가능성 조회 API)가 담당한다.

/**
 * @typedef {Object} FeasibilityStatusInput
 * @property {number} requiredMonthly API가 계산한 월 필요 저축액
 * @property {number} availableMonthly API가 계산한 월 가능 저축액
 */

/**
 * @typedef {Object} FeasibilityStatus
 * @property {number} ratio requiredMonthly / availableMonthly
 * @property {number} rate (availableMonthly / requiredMonthly) * 100 (실현가능성 퍼센티지)
 * @property {'success' | 'warning' | 'danger'} status
 */


/**
 * @param {FeasibilityStatusInput} params
 * @returns {FeasibilityStatus}
 */
export function resolveFeasibilityStatus({ requiredMonthly, availableMonthly }) {
  const req = Number(requiredMonthly) || 0
  const avail = Number(availableMonthly) || 0
  const ratio = avail > 0 ? req / avail : Infinity
  const rate =
    req <= 0 ? 100 : avail <= 0 ? 0 : Math.min(100, Math.max(0, Math.round((avail / req) * 100)))

  const status = rate >= 80 ? 'success' : 'danger'

  return { ratio, rate, status }
}
