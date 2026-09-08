// 페이스메이커 API 최신 예시 응답 기반 MSW 핸들러
import { http, HttpResponse } from 'msw'
import { getLocalDateKey } from '@/shared/lib/date'

// 오늘 기준 며칠 전 날짜를 구한다. 히스토리 목데이터가 특정 달에 고정되지 않고
// 항상 "오늘"을 기준으로 최신처럼 보이도록 상대 날짜로 생성한다.
function daysAgo(offset) {
  const date = new Date()
  date.setDate(date.getDate() - offset)
  return getLocalDateKey(date)
}

// 대시보드(monthlySuccessCount)와 내역 목록이 같은 데이터를 보고 있어야 숫자가 어긋나지 않는다.
const HISTORY_PATTERN = [
  { status: 'SAVED', amount: 10000, description: '오늘의 여유자금 자동 저축' },
  { status: 'SAVED', amount: 20000, description: null },
  { status: 'SAVED', amount: 15000, description: null },
  { status: 'SAVED', amount: 12000, description: null },
  { status: 'SAVED', amount: 18000, description: null },
  { status: 'SAVED', amount: 9000, description: null },
  { status: 'SAVED', amount: 13000, description: null },
  { status: 'SAVED', amount: 11000, description: null },
  { status: 'SAVED', amount: 16000, description: null },
  { status: 'SAVED', amount: 7000, description: null },
  { status: 'SAVED', amount: 14000, description: null },
  { status: 'SAVED', amount: 8000, description: null },
  { status: 'SKIPPED', amount: null, description: '여유자금 없음' },
  { status: 'SAVED', amount: 6000, description: null },
  { status: 'SKIPPED', amount: null, description: '지출 초과' },
  { status: 'SAVED', amount: 5000, description: null },
  { status: 'SKIPPED', amount: null, description: '여유자금 없음' },
  { status: 'SAVED', amount: 12000, description: null },
  { status: 'SAVED', amount: 4000, description: null },
  { status: 'SKIPPED', amount: null, description: '지출 초과' },
  { status: 'SAVED', amount: 10000, description: null },
  { status: 'SAVED', amount: 3000, description: null },
]

function getMockHistories() {
  return HISTORY_PATTERN.map((item, offset) => ({ date: daysAgo(offset), ...item }))
}

function getMockMonthlySuccessCount() {
  const currentMonth = getLocalDateKey(new Date()).slice(0, 7)
  return getMockHistories().filter(
    (item) => item.status === 'SAVED' && item.date.startsWith(currentMonth)
  ).length
}

let mockRegistered = false
let mockPacemakerStatus = null // 'ACTIVE' | 'PAUSED' | null
let mockBalance = 520000
let mockMaxAmount = 10000
const mockGoals = [
  {
    goalId: 1,
    goalName: '유럽 여행',
    goalType: 'WEDDING',
    goalAmount: 3000000,
    totalSavedAmount: 1200000,
    depositAssets: [
      {
        assetType: 'ACCOUNT',
        assetId: 3,
        financialInstitutionName: '연결 은행',
        maskedAccountNumber: '123-***-789',
        balance: 700000,
      },
      {
        assetType: 'MONEY_BOX',
        assetId: 5,
        financialInstitutionName: null,
        maskedAccountNumber: '456-***-111',
        balance: 500000,
      },
    ],
    withdrawalAccounts: [
      {
        accountId: 8,
        financialInstitutionName: '연결 은행',
        maskedAccountNumber: '987-***-123',
        balance: 1000000,
      },
      {
        accountId: 9,
        financialInstitutionName: '우리은행',
        maskedAccountNumber: '111-***-222',
        balance: 2300000,
      },
    ],
  },
  {
    goalId: 2,
    goalName: '비상금',
    goalType: 'EMERGENCY',
    goalAmount: 1000000,
    totalSavedAmount: 250000,
    depositAssets: [
      {
        assetType: 'ACCOUNT',
        assetId: 11,
        financialInstitutionName: '신한은행',
        maskedAccountNumber: '222-***-333',
        balance: 250000,
      },
    ],
    withdrawalAccounts: [
      {
        accountId: 12,
        financialInstitutionName: '신한은행',
        maskedAccountNumber: '999-***-000',
        balance: 500000,
      },
    ],
  },
]

export const pacemakerHandlers = [
  http.get('*/api/pace-maker', () => {
    return HttpResponse.json({
      autoSavingId: mockRegistered ? 21 : null,
      registered: mockRegistered,
      status: mockRegistered ? mockPacemakerStatus : null,
      enabled: mockRegistered && mockPacemakerStatus === 'ACTIVE',
    })
  }),

  http.get('*/api/pace-maker/dashboard', () => {
    return HttpResponse.json({
      autoSavingId: 21,
      status: mockPacemakerStatus ?? 'ACTIVE',
      maxAmount: mockMaxAmount,
      moneyBox: {
        moneyBoxId: 31,
        balance: mockBalance,
        maskedAccountNumber: '123-****-7890',
      },
      todaySaving: {
        amount: 10000,
        saved: true,
      },
      currentStreak: 12,
      // 요일로 고정하면 실행하는 요일에 따라 히스토리(날짜 기준)와 어긋난다.
      // null로 둬서 프런트의 히스토리 기반 폴백(computeWeeklyStreakFromHistories)이
      // 항상 실행 시점 기준으로 계산하게 한다 — 폴백 자체도 같이 검증된다.
      weeklyStreak: null,
      monthlySuccessCount: getMockMonthlySuccessCount(),
    })
  }),

  http.get('*/api/pace-maker/goals', () => {
    return HttpResponse.json({ goals: mockGoals })
  }),

  http.post('*/api/pace-maker', async ({ request }) => {
    const { accountId, maxAmount } = await request.json()

    if (!accountId || !maxAmount) {
      return HttpResponse.json(
        { success: false, data: null, error: { message: '연동 계좌와 상한선을 확인해 주세요.' } },
        { status: 400 }
      )
    }

    mockRegistered = true
    mockPacemakerStatus = 'ACTIVE'
    mockMaxAmount = maxAmount

    return HttpResponse.json({
      success: true,
      data: {
        autoSavingId: 21,
        moneyBoxId: 31,
        accountId,
        maxAmount,
        autoSavingStatus: 'ACTIVE',
      },
      error: null,
    })
  }),

  http.patch('*/api/pace-maker/:autoSavingId/status', async ({ request }) => {
    const { status } = await request.json()
    mockRegistered = true
    mockPacemakerStatus = status

    return HttpResponse.json({
      success: true,
      data: {
        autoSavingId: 21,
        registered: true,
        status,
        enabled: status === 'ACTIVE',
      },
      error: null,
    })
  }),

  http.patch('*/api/pace-maker/:autoSavingId/max-amount', async ({ request, params }) => {
    const { maxAmount } = await request.json()
    mockMaxAmount = maxAmount

    return HttpResponse.json({
      autoSavingId: Number(params.autoSavingId),
      maxAmount,
    })
  }),

  http.post('*/api/pace-maker/deposits', async ({ request }) => {
    const { assetId, assetType, amount, moneyBoxId } = await request.json()
    const targetAsset = mockGoals
      .flatMap((goal) => goal.depositAssets)
      .find((asset) => asset.assetId === assetId && asset.assetType === assetType)

    if (!targetAsset || moneyBoxId !== 31 || amount <= 0 || amount > mockBalance) {
      return HttpResponse.json({ message: '입금 요청 정보를 확인해 주세요.' }, { status: 400 })
    }

    mockBalance -= amount
    targetAsset.balance += amount

    return HttpResponse.json({
      assetId,
      assetType,
      depositedAmount: amount,
      remainingBalance: mockBalance,
    })
  }),

  http.get('*/api/pace-maker/histories', () => {
    const content = getMockHistories()

    return HttpResponse.json({
      content,
      page: 0,
      size: content.length,
      totalElements: content.length,
      totalPages: 1,
      first: true,
      last: true,
    })
  }),
]
