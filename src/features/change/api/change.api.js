// change 도메인 API 함수 골격: 목표/상황 변경 대응 (CHG-01~05)

/**
 * @typedef {Object} ChangeRequest
 * @property {string} goalId
 * @property {'INCOME' | 'EXPENSE' | 'PERIOD' | 'TARGET_AMOUNT'} changeType
 * @property {number} newValue
 */

/**
 * @typedef {Object} ChangeImpact
 * @property {number} newPeriodMonths
 * @property {number} newMonthlyAmount
 * @property {string} summary
 */

/**
 * @param {ChangeRequest} payload
 * @returns {Promise<ChangeImpact>}
 */
export async function simulateChangeImpact(payload) {
  // TODO: 실제 API 연동 시 client.post('/goals/change/simulate', payload)로 교체
  return { newPeriodMonths: 0, newMonthlyAmount: 0, summary: '' }
}

/**
 * @param {ChangeRequest} payload
 * @returns {Promise<void>}
 */
export async function requestGoalChange(payload) {
  // TODO: 실제 API 연동 시 client.post('/goals/change', payload)로 교체
}

/**
 * @param {string} goalId
 * @returns {Promise<ChangeRequest[]>}
 */
export async function getChangeHistory(goalId) {
  // TODO: 실제 API 연동 시 client.get(`/goals/${goalId}/change-history`)로 교체
  return []
}
