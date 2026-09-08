import { GOAL_PRESETS } from '@/features/goal/constants/goal.constants.js'
import { client } from '@/shared/api/client'
import { unwrapApiData } from '@/shared/api/unwrapApiData'

/**
 * @typedef {import('@/features/goal/constants/goal.constants.js').GoalPreset} GoalPreset
 */

/**
 * 백엔드 LocalDate가 "YYYY-MM-DD" 문자열 또는 [year, month, day] 배열로 내려오는
 * 두 형태를 모두 "YYYY-MM-DD" 문자열로 정규화한다.
 * @param {string | number[] | null | undefined} value
 * @returns {string | null}
 */
function normalizeLocalDate(value) {
  if (!value) return null

  if (Array.isArray(value)) {
    const [year, month, day] = value
    if (!year || !month || !day) return null
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  if (typeof value === 'string') return value

  return null
}

/**
 * 목표 프리셋 데이터를 조회하는 Mock API 함수
 * @returns {Promise<GoalPreset[]>}
 */
export async function getGoalPresets() {
  // TODO: 실제 API 연동 시 client.get('/goals/presets') 등으로 교체
  return Promise.resolve([...GOAL_PRESETS])
}

/**
 * @typedef {Object} GoalAssetInput
 * @property {number} [assetId] 연결할 자산 ID (새로 만드는 저금통처럼 아직 없는 자산은 생략)
 * @property {'MONEY_BOX' | 'MONEYBOX' | 'ACCOUNT' | 'LOAN'} assetType
 */

/**
 * @typedef {Object} CreateGoalPayload
 * @property {string} [goalName] 목표명
 * @property {'INDEPENDENCE' | 'EMERGENCY' | 'WEDDING' | 'LOAN'} goalType
 * @property {number} goalAmount 목표 금액
 * @property {number} goalMonths 목표 기간(개월)
 * @property {number} startAmount 목표 시작 금액
 * @property {GoalAssetInput[]} assets 연결할 자산 목록 (저금통 타입이면 서버가 저금통도 함께 생성)
 */

/**
 * @param {CreateGoalPayload} payload
 * @returns {Promise<{ goalId: number }>}
 */
export async function createGoal(payload) {
  const { data: responseBody } = await client.post('/goals', payload)
  return unwrapApiData(responseBody)
}

/**
 * @typedef {Object} FeasibilityParams
 * @property {number} goalAmount 목표금액
 * @property {number} goalMonths 목표 개월수
 * @property {number} startAmount 이미 모아둔 금액
 * @property {boolean} [isStudentLoan] 학자금 대출 여부
 */

/**
 * @typedef {Object} FeasibilityResponse
 * @property {number} requiredMonthly 월 저축·상환 여력에 필요한 금액
 * @property {number} availableMonthly 월 저축·상환 가능 금액
 * @property {boolean} possible 실현 가능 여부
 */

/**
 * @param {FeasibilityParams} params
 * @returns {Promise<FeasibilityResponse>}
 */
export async function getFeasibility(params) {
  const { data: responseBody } = await client.post('/goals/possibility', params)
  return unwrapApiData(responseBody)
}

// 계좌 목록 조회 API (GOAL-04: 출금계좌 선택 / 기존 저축계좌 연결)
/**
 * 서버 account 테이블의 ck_account_type 제약과 같은 값 집합.
 * 적금 계좌는 SAVINGS로 내려온다(SAVING이 아니다).
 * @typedef {'CHECKING' | 'SAVINGS' | 'DEPOSIT' | 'INSTALLMENT' | 'ISA' | 'CMA'} AccountType
 */

/**
 * @typedef {Object} AccountItem
 * @property {number} accountId
 * @property {string} institutionName
 * @property {AccountType} accountType
 * @property {string} accountName
 * @property {string} maskedAccountNumber
 * @property {number} balance
 * @property {number | null} interestRate
 */

/**
 * accountType에 위 집합 밖의 값을 넘기면 서버가 INVALID_ACCOUNT_TYPE 에러를 반환한다.
 * @param {{
 *   accountType?: AccountType,
 *   excludeGoalLinked?: boolean
 * }} [params]
 * @returns {Promise<{ totalBalance: number, accounts: AccountItem[] }>}
 */
export async function getAccounts(params) {
  const { data: responseBody } = await client.get('/accounts', { params })
  return unwrapApiData(responseBody)
}

// 저금통 개설 API (GOAL-04)
/**
 * @typedef {Object} MoneyBoxPayload
 * @property {'GOAL' | 'SAVING'} type
 * @property {number} accountId
 * @property {number} amount 자동이체 금액
 * @property {number} transferDay 자동이체 날짜
 */

/**
 * @typedef {Object} MoneyBoxResponse
 * @property {number} moneyBoxId
 * @property {number} accountId
 * @property {'GOAL' | 'SAVING'} moneyBoxType
 */

/**
 * @param {MoneyBoxPayload} payload
 * @returns {Promise<MoneyBoxResponse>}
 */
export async function createMoneyBox(payload) {
  const { data: responseBody } = await client.post('/money-boxes', {
    accountId: payload.accountId,
    moneyBoxType: payload.type,
    autoTransfer: {
      amount: payload.amount,
      transferDay: payload.transferDay,
    },
  })
  return unwrapApiData(responseBody)
}

// 목표 목록 조회 API
/**
 * @typedef {Object} GoalListItem
 * @property {number} goalId
 * @property {string} goalName
 * @property {string} goalType
 * @property {number} progressRate
 * @property {string} status
 */

/**
 * @returns {Promise<GoalListItem[]>}
 */
export async function getGoals() {
  const { data: responseBody } = await client.get('/goals')
  const data = unwrapApiData(responseBody)
  return data?.goals ?? data
}

// 목표 상세 조회 API
/**
 * @typedef {Object} GoalDetail
 * @property {number} goalId
 * @property {string} goalType
 * @property {string} goalName
 * @property {number} goalAmount
 * @property {number} currentAmount
 * @property {number} startAmount
 * @property {number} progressRate
 * @property {{ goalMonths: number, startDate: string, endDate: string, remainMonths: number }} period
 * @property {'ACTIVE' | 'PAUSED' | 'COMPLETED'} status
 * @property {{ expectedAmount: number, differenceAmount: number, paceStatus: 'AHEAD' | 'ON_TRACK' | 'BEHIND' }} pace
 */

/**
 * @param {number} goalId
 * @returns {Promise<GoalDetail>}
 */
export async function getGoalDetail(goalId) {
  const { data: responseBody } = await client.get(`/goals/${goalId}`)
  const goal = unwrapApiData(responseBody)

  return {
    ...goal,
    goalAmount: Number(goal.goalAmount ?? 0),
    currentAmount: Number(goal.currentAmount ?? 0),
    startAmount: Number(goal.startAmount ?? 0),
    progressRate: Number(goal.progressRate ?? 0),
    period: {
      goalMonths: Number(goal.period?.goalMonths ?? 0),
      startDate: goal.period?.startDate ?? '',
      endDate: goal.period?.endDate ?? '',
      remainMonths: Number(goal.period?.remainMonths ?? 0),
    },
    pace: {
      expectedAmount: Number(goal.pace?.expectedAmount ?? 0),
      differenceAmount: Number(goal.pace?.differenceAmount ?? 0),
      paceStatus: goal.pace?.paceStatus ?? 'ON_TRACK',
    },
  }
}

/**
 * 세 필드를 항상 함께 보낸다. 화면에서 수정하지 않는 필드도 현재 값을 실어야 한다.
 *
 * 서버 DTO(GoalUpdateRequest)는 String/Long/Integer라 필드를 빼도 역직렬화는 통과하지만,
 * UPDATE 문이 전달된 값으로 컬럼을 조건 없이 덮어쓰기 때문에 빠뜨린 필드가 NULL이 된다.
 * 즉 타입상으로만 부분 수정이 가능하고 실제로는 안전하지 않다.
 * @typedef {Object} UpdateGoalPayload
 * @property {string} goalName 목표명
 * @property {number} goalAmount 목표 금액
 * @property {number} goalMonths 현재 월부터 목표 월까지의 개월 수
 */

/**
 * 목표명·목표 금액·목표 기간을 수정한다.
 * @param {number} goalId
 * @param {UpdateGoalPayload} payload
 * @returns {Promise<null>}
 */
export async function updateGoal(goalId, payload) {
  const { data: responseBody } = await client.patch(`/goals/${goalId}`, payload)
  return unwrapApiData(responseBody)
}

/**
 * @typedef {Object} PullGoalFundsPayload
 * @property {number} sourceAccountId 끌어올 입출금 계좌 ID
 * @property {number} amount 끌어올 금액
 */

/**
 * @typedef {Object} PullGoalFundsResponse
 * @property {number} pulledAmount 끌어온 금액
 * @property {number} currentAmount 끌어온 뒤 목표 자산의 현재 금액
 */

/**
 * 뒤처진 목표에 다른 입출금 계좌의 자금을 채운다.
 * @param {number} goalId
 * @param {PullGoalFundsPayload} payload
 * @returns {Promise<PullGoalFundsResponse>}
 */
export async function pullGoalFunds(goalId, payload) {
  const { data: responseBody } = await client.post(`/goals/${goalId}/pull-funds`, payload)
  const data = unwrapApiData(responseBody)

  return {
    pulledAmount: Number(data?.pulledAmount ?? 0),
    currentAmount: Number(data?.currentAmount ?? 0),
  }
}

/**
 * 자산 연결 API (POST /goals/{goalId}/assets)
 * @param {number} goalId
 * @param {GoalAssetInput[]} assets
 * @returns {Promise<{ success: boolean }>}
 */
export async function linkAssetsToGoal(goalId, assets) {
  const { data: responseBody } = await client.post(`/goals/${goalId}/assets`, { assets })
  return unwrapApiData(responseBody)
}

// 연결 자산 조회 API
/**
 * @typedef {Object} GoalAsset
 * @property {'MONEY_BOX' | 'ACCOUNT' | 'LOAN'} assetType
 * @property {number} assetId
 * @property {string} assetName
 * @property {string} bankName
 * @property {string} accountNumberMasked
 * @property {number | null} balance
 * @property {{ interestRate: number, maturityDate: string } | null} assetDetail
 * @property {{ amount: number, transferDay: number, withdrawalAccount: { bankName: string, accountNumberMasked: string } | null }} autoTransfer
 */

/**
 * @param {number} goalId
 * @returns {Promise<GoalAsset[]>}
 */
export async function getGoalAssets(goalId) {
  const { data: responseBody } = await client.get(`/goals/${goalId}/assets`)
  const unwrapped = unwrapApiData(responseBody)
  const assets = unwrapped?.assets ?? (Array.isArray(unwrapped) ? unwrapped : [])

  return assets.map((asset) => {
    const fallbackName =
      asset.assetType === 'MONEY_BOX'
        ? '미래로 저금통'
        : asset.assetType === 'LOAN'
          ? '대출 계좌'
          : '연결 계좌'

    return {
      ...asset,
      assetName: asset.assetName?.trim() || fallbackName,
      bankName: asset.bankName?.trim() || '',
      accountNumberMasked: asset.accountNumberMasked?.trim() || '',
      balance: Number(asset.balance ?? 0),
      // 객체 자체뿐 아니라 내부 필드까지 채워야 화면에서 별도 방어 없이 그대로 쓸 수 있다.
      assetDetail: asset.assetDetail
        ? {
            ...asset.assetDetail,
            interestRate: Number(asset.assetDetail.interestRate ?? 0),
            maturityDate: normalizeLocalDate(asset.assetDetail.maturityDate),
          }
        : null,
      autoTransfer: {
        amount: Number(asset.autoTransfer?.amount ?? 0),
        transferDay: asset.autoTransfer?.transferDay ?? null,
        withdrawalAccount: asset.autoTransfer?.withdrawalAccount ?? null,
      },
    }
  })
}

/**
 * @typedef {Object} LinkedGoalAsset
 * @property {'MONEY_BOX' | 'ACCOUNT'} assetType
 * @property {number} assetId
 * @property {string} assetName
 * @property {string | null} institutionName
 * @property {string | null} maskedAccountNumber
 * @property {number} balance
 * @property {number | null} interestRate
 */

/**
 * @typedef {Object} LinkedGoalAssets
 * @property {number} goalId
 * @property {number} totalLinkedBalance
 * @property {LinkedGoalAsset[]} linkedAssets
 */

/**
 * 상품 추천 화면용 목표 연결 자산 조회
 *
 * @param {number} goalId
 * @returns {Promise<LinkedGoalAssets>}
 */
export async function getGoalLinkedAssets(goalId) {
  const { data: responseBody } = await client.get(`/goals/${goalId}/assets`)
  const data = unwrapApiData(responseBody)

  const assets = data?.assets ?? []
  const linkedAssets = assets.map((asset) => ({
    assetType: asset.assetType,
    assetId: asset.assetId,
    assetName: asset.assetName,
    institutionName: asset.bankName ?? null,
    maskedAccountNumber: asset.accountNumberMasked ?? null,
    balance: asset.balance ?? 0,
    interestRate: asset.assetDetail?.interestRate ?? null,
  }))

  return {
    goalId,
    totalLinkedBalance: linkedAssets.reduce((sum, a) => sum + (a.balance ?? 0), 0),
    linkedAssets,
  }
}

/**
 * @typedef {Object} MonthlyAvailableMoneyView
 * @property {number} income
 * @property {number} fixedExpense
 * @property {number} targetGoalAutoTransfer
 * @property {number} otherGoalAutoTransfer
 * @property {number} variableExpense
 * @property {number} availableMoney
 * @property {number} elapsedDays
 * @property {number} remainingDays
 * @property {number} periodDays
 */

// 월 여유자금 조회 API
/**
 * @param {number} goalId
 * @returns {Promise<MonthlyAvailableMoneyView>}
 */
export async function getMonthlyAvailableMoney(goalId) {
  const { data: responseBody } = await client.get(`/goals/${goalId}/available-money/monthly`)
  const data = unwrapApiData(responseBody)

  return {
    income: Number(data.monthlyIncome ?? 0),
    fixedExpense: Number(data.fixedExpense ?? 0),
    variableExpense: Number(data.variableExpense ?? 0),
    targetGoalAutoTransfer: Number(data.targetGoalAutoTransfer ?? 0),
    otherGoalAutoTransfer: Number(data.otherGoalAutoTransfer ?? 0),
    availableMoney: Number(data.monthlyAvailableMoney ?? 0),
    elapsedDays: Number(data.elapsedDays ?? 0),
    remainingDays: Number(data.remainingDays ?? 0),
    periodDays: Number(data.periodDays ?? 0),
  }
}

// 일 여유자금 조회 API
/**
 * @param {number} goalId
 * @returns {Promise<{ todayAvailableMoney: number, todayExpense: number, remainingAvailableMoney: number }>}
 */
export async function getDailyAvailableMoney(goalId) {
  const { data: responseBody } = await client.get(`/goals/${goalId}/available-money/daily`)
  const data = unwrapApiData(responseBody)

  return {
    todayAvailableMoney: Number(data.todayAvailableMoney ?? 0),
    todayExpense: Number(data.todayExpense ?? 0),
    remainingAvailableMoney: Number(data.remainingAvailableMoney ?? 0),
  }
}

/**
 * @param {number} goalId
 * @param {'ACTIVE' | 'PAUSED'} status
 * @returns {Promise<void>}
 */
export async function updateGoalStatus(goalId, status) {
  const { data: responseBody } = await client.patch(`/goals/${goalId}/status`, { status })
  return unwrapApiData(responseBody)
}
