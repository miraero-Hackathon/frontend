// 페이스메이커 API 함수와 최신 응답 모델
import { client } from '@/shared/api/client'

/** @typedef {'ACTIVE' | 'PAUSED' | null} PacemakerStatusValue */

/**
 * @typedef {Object} PacemakerStatus
 * @property {number | null} autoSavingId
 * @property {boolean} registered
 * @property {PacemakerStatusValue} status
 * @property {boolean} enabled
 */

/**
 * @typedef {Object} PacemakerMoneyBox
 * @property {number} moneyBoxId
 * @property {number} balance
 * @property {string} maskedAccountNumber
 */

/**
 * @typedef {Object} PacemakerTodaySaving
 * @property {number | null} amount saved가 false면 null로 온다
 * @property {boolean} saved
 */

/**
 * @typedef {Object} PacemakerWeeklyStreakItem
 * @property {'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'} dayOfWeek
 * @property {number} amount
 * @property {boolean} saved
 */

/**
 * @typedef {Object} PacemakerDashboard
 * @property {number} autoSavingId
 * @property {'ACTIVE' | 'PAUSED'} status
 * @property {number} maxAmount 하루 최대 자동 저축 금액
 * @property {PacemakerMoneyBox | null} moneyBox
 * @property {PacemakerTodaySaving | null} todaySaving
 * @property {number | null} currentStreak 서버가 아직 집계를 못 채운 계정은 null로 온다
 * @property {PacemakerWeeklyStreakItem[] | null} weeklyStreak 서버가 아직 집계를 못 채운 계정은 null로 온다
 * @property {number | null} monthlySuccessCount 서버가 아직 집계를 못 채운 계정은 null로 온다
 */

/**
 * @typedef {Object} PacemakerHistoryItem
 * @property {string} date 'yyyy-MM-dd'
 * @property {'SAVED' | 'SKIPPED'} status
 * @property {number | null} amount
 * @property {string | null} description
 */

/**
 * @typedef {Object} PacemakerHistoryPage
 * @property {PacemakerHistoryItem[]} content
 * @property {number} page
 * @property {number} size
 * @property {number} totalElements
 * @property {number} totalPages
 * @property {boolean} first
 * @property {boolean} last
 */

/**
 * 페이스메이커 입금 대상 목표 목록을 조회합니다.
 * @returns {Promise<{ goals: Array<Object> }>}
 */
export async function getPacemakerGoals() {
  const { data } = await client.get('/pace-maker/goals')
  return unwrapApiResponse(data)
}

/**
 * @typedef {Object} AccountDetail
 * @property {number} accountId
 * @property {string} institutionName
 * @property {string} accountType
 * @property {string} accountName
 * @property {string} maskedAccountNumber
 * @property {number} balance
 * @property {string | null} maturityAt
 * @property {number | null} interestRate
 * @property {number | null} monthlyPaymentLimit
 */

/**
 * 계좌/저금통 상세 정보를 조회합니다. (계좌명 표시용)
 * @param {number} accountId
 * @returns {Promise<AccountDetail>}
 */
export async function getAccountDetail(accountId) {
  const { data } = await client.get(`/accounts/${accountId}`)
  return unwrapApiResponse(data)
}

function unwrapApiResponse(payload) {
  if (payload && typeof payload === 'object' && Object.hasOwn(payload, 'success')) {
    if (payload.success !== true) {
      throw new Error(payload.error?.message ?? payload.message ?? 'API 요청에 실패했습니다.')
    }

    return payload.data
  }

  return payload
}

/** @returns {Promise<PacemakerStatus>} */
export async function getPacemakerStatus() {
  const { data } = await client.get('/pace-maker')
  return unwrapApiResponse(data)
}

/** @returns {Promise<PacemakerDashboard>} */
export async function getPacemakerDashboard() {
  const { data } = await client.get('/pace-maker/dashboard')
  return unwrapApiResponse(data)
}

/**
 * @typedef {Object} PacemakerCreateResult
 * @property {number} autoSavingId
 * @property {number} moneyBoxId
 * @property {number} accountId
 * @property {number} maxAmount
 * @property {'ACTIVE' | 'PAUSED'} autoSavingStatus
 */

/**
 * 페이스메이커 전용 저금통을 개설합니다. (연동 계좌·상한선 설정과 활성화까지 함께 처리됩니다)
 * @param {{ accountId: number, maxAmount: number }} payload
 * @returns {Promise<PacemakerCreateResult>}
 */
export async function createPacemaker({ accountId, maxAmount }) {
  const { data } = await client.post('/pace-maker', { accountId, maxAmount })
  return unwrapApiResponse(data)
}

/**
 * @param {number} autoSavingId
 * @param {'ACTIVE' | 'PAUSED'} status
 * @returns {Promise<PacemakerStatus>}
 */
export async function updatePacemakerStatus(autoSavingId, status) {
  const { data } = await client.patch(`/pace-maker/${autoSavingId}/status`, { status })
  return unwrapApiResponse(data)
}

/**
 * @param {number} autoSavingId
 * @param {number} maxAmount
 * @returns {Promise<{ autoSavingId: number, maxAmount: number }>}
 */
export async function updatePacemakerMaxAmount(autoSavingId, maxAmount) {
  const { data } = await client.patch(`/pace-maker/${autoSavingId}/max-amount`, { maxAmount })
  return unwrapApiResponse(data)
}

/**
 * 목표에 연결된 자산(예적금 계좌 또는 저금통)에 직접 입금합니다.
 * @param {{ assetId: number, assetType: 'ACCOUNT' | 'MONEY_BOX' | 'LOAN', amount: number, moneyBoxId: number }} payload
 * @returns {Promise<{ assetId: number, assetType: string, depositedAmount: number, remainingBalance: number }>}
 */
export async function depositToGoalAsset({ assetId, assetType, amount, moneyBoxId }) {
  const { data } = await client.post('/pace-maker/deposits', {
    assetId,
    assetType,
    amount,
    moneyBoxId,
  })
  return unwrapApiResponse(data)
}

/**
 * @param {{ page?: number, size?: number }} [params]
 * @returns {Promise<PacemakerHistoryPage>}
 */
export async function getPacemakerHistories({ page = 0, size = 20 } = {}) {
  const { data } = await client.get('/pace-maker/histories', { params: { page, size } })
  return unwrapApiResponse(data)
}
