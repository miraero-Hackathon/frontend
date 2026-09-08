// goal 관련 MSW 핸들러 샘플 (마이데이터 mock 포함)
import { http, HttpResponse, delay } from 'msw'
import mydata from '@/mocks/fixtures/mydata.json'

// TODO: 실제 마이데이터 연동 전까지 사용하는 mock 월 저축 가능 금액
const MOCK_MONTHLY_SAVING_CAPACITY = 620000
const MOCK_GOAL_UPDATES = new Map()
const MOCK_PULL_CURRENT_AMOUNTS = new Map()
const MOCK_GOAL_LINKED_ACCOUNT_IDS = new Set([1])
// 목표별 기준 금액. 목록·상세가 같은 값에서 파생돼야 달성률이 어긋나지 않는다.
const MOCK_GOAL_BASE_AMOUNTS = {
  1: { goalAmount: 30000000, currentAmount: 11500000 },
  2: { goalAmount: 10000000, currentAmount: 4500000 },
  3: { goalAmount: 25000000, currentAmount: 5000000 },
}
const MOCK_COLLECTIONS = [
  {
    goalId: 12,
    goalName: '유럽 여행',
    goalType: 'SAVE',
    goalAmount: 3000000,
    completedDate: '2026-07-21',
  },
  {
    goalId: 8,
    goalName: '학자금 대출 상환',
    goalType: 'LOAN',
    goalAmount: 5000000,
    completedDate: '2026-06-18',
  },
]

function getGoalMonths(goalDate) {
  if (!goalDate) return 10
  const target = new Date(goalDate)
  const today = new Date()
  return Math.max(
    1,
    (target.getFullYear() - today.getFullYear()) * 12 + target.getMonth() - today.getMonth()
  )
}

function getGoalDateFromMonths(goalMonths) {
  const target = new Date()
  target.setDate(1)
  target.setMonth(target.getMonth() + goalMonths + 1, 0)

  const year = target.getFullYear()
  const month = String(target.getMonth() + 1).padStart(2, '0')
  const day = String(target.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 끌어쓰기(currentAmount)와 목표 수정(goalAmount)이 달성률에 그대로 반영되도록
 * 세 값을 한곳에서 파생시킨다.
 */
function getMockGoalAmounts(goalId) {
  const base = MOCK_GOAL_BASE_AMOUNTS[goalId] ?? MOCK_GOAL_BASE_AMOUNTS[1]
  const goalAmount = MOCK_GOAL_UPDATES.get(goalId)?.goalAmount ?? base.goalAmount
  const currentAmount = MOCK_PULL_CURRENT_AMOUNTS.get(goalId) ?? base.currentAmount

  return {
    goalAmount,
    currentAmount,
    progressRate: goalAmount ? Math.round((currentAmount / goalAmount) * 1000) / 10 : 0,
  }
}

function milestoneResponse(milestones) {
  return HttpResponse.json({
    success: true,
    data: {
      milestones: milestones.map((milestone) => ({
        step: milestone.order,
        percentage: milestone.order * 25,
        milestoneAmount: milestone.targetAmount,
        achieved: milestone.status === 'COMPLETED',
        achievedAt: milestone.status === 'COMPLETED' ? milestone.targetDate + '-01T00:00:00' : null,
        report: milestone.title
          ? {
              milestoneReportId: milestone.milestoneId,
              status: milestone.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
              title: milestone.title,
              content:
                milestone.status === 'COMPLETED'
                  ? (milestone.reportContent ??
                    `이번 마일스톤을 안정적으로 달성했어요. 지금까지 만든 저축 흐름을 유지하면 다음 목표에도 무리 없이 도달할 수 있습니다.\n\n최근의 꾸준한 실행이 가장 큰 강점이에요. 다음 구간에서는 현재 저축 속도를 유지하면서 갑작스러운 지출만 한 번 더 점검해 보세요.`)
                  : null,
            }
          : null,
      })),
    },
    error: null,
  })
}

// TODO: 실제 마이데이터 연동 전까지 사용하는 mock 계좌 목록
const MOCK_ACCOUNTS = [
  {
    accountId: 1,
    institutionName: '연결 은행',
    accountType: 'CHECKING',
    accountName: '주거래 통장',
    maskedAccountNumber: '2012*****6',
    balance: 1250000,
    interestRate: null,
  },
  {
    accountId: 2,
    institutionName: '연결 은행',
    accountType: 'CHECKING',
    accountName: '비상금 통장',
    maskedAccountNumber: '2012*****6',
    balance: 320000,
    interestRate: null,
  },
  {
    accountId: 3,
    institutionName: '연결 은행',
    accountType: 'SAVINGS',
    accountName: '스타 적금',
    maskedAccountNumber: '···3821',
    balance: 640000,
    interestRate: 4.5,
  },
  {
    accountId: 4,
    institutionName: '카카오뱅크',
    accountType: 'SAVINGS',
    accountName: '카카오뱅크 적금',
    maskedAccountNumber: '···0047',
    balance: 1200000,
    interestRate: 3.8,
  },
  {
    accountId: 5,
    institutionName: '토스뱅크',
    accountType: 'SAVINGS',
    accountName: '토스뱅크 저금통',
    maskedAccountNumber: '···7193',
    balance: 320000,
    interestRate: 2.3,
  },
  {
    accountId: 6,
    institutionName: '연결 은행',
    accountType: 'SAVINGS',
    accountName: '독립 적금',
    maskedAccountNumber: '***456',
    balance: 3000000,
    interestRate: 3.5,
  },
  {
    accountId: 7,
    institutionName: '연결 은행',
    accountType: 'DEPOSIT',
    accountName: '스마트 정기예금',
    maskedAccountNumber: '***7890',
    balance: 5000000,
    interestRate: 3.5,
  },
  {
    accountId: 11,
    institutionName: '신한은행',
    accountType: 'SAVINGS',
    accountName: '신한 비상금 저금통',
    maskedAccountNumber: '···3333',
    balance: 250000,
    interestRate: 2.8,
  },
]

export const goalHandlers = [
  // 목표생성 API (GOAL-04 완료 시점) — assets에 저금통이 포함되면 백엔드가 저금통도 함께 생성
  http.post('*/api/goals', async () => {
    await delay(500)
    return HttpResponse.json({ goalId: Math.floor(Math.random() * 100000) }, { status: 201 })
  }),

  // 실현가능성(가능성) 조회 API (GOAL-03) — goalAmount/goalMonths/startAmount 바디로 계산
  http.post('*/api/goals/possibility', async ({ request }) => {
    await delay(500)
    const { goalAmount, goalMonths, startAmount, isStudentLoan } = await request.json()

    let requiredMonthly = 0
    if (isStudentLoan) {
      // 학자금 대출 원리금균등상환 (연 1.7%)
      const monthlyRate = 0.017 / 12
      const compound = Math.pow(1 + monthlyRate, goalMonths)
      requiredMonthly = Math.round((goalAmount * monthlyRate * compound) / (compound - 1)) || 0
    } else {
      requiredMonthly = Math.max(0, Math.round((goalAmount - startAmount) / goalMonths)) || 0
    }

    const availableMonthly = MOCK_MONTHLY_SAVING_CAPACITY || 620000

    return HttpResponse.json({
      success: true,
      data: {
        requiredMonthly,
        availableMonthly,
        possible: requiredMonthly <= availableMonthly,
      },
      error: null,
    })
  }),

  // 계좌 목록 조회 API (GOAL-04: 출금계좌 선택 / 기존 저축계좌 연결)
  http.get('*/api/accounts', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const accountType = url.searchParams.get('accountType')
    const excludeGoalLinked = url.searchParams.get('excludeGoalLinked') === 'true'

    const accounts = MOCK_ACCOUNTS.filter(
      (account) =>
        (!accountType || account.accountType === accountType) &&
        (!excludeGoalLinked || !MOCK_GOAL_LINKED_ACCOUNT_IDS.has(account.accountId))
    )

    return HttpResponse.json({
      success: true,
      data: {
        totalBalance: accounts.reduce((sum, account) => sum + account.balance, 0),
        accounts,
      },
      error: null,
    })
  }),

  // 계좌 상세 조회 API (연결된 계좌/저금통 이름 등 표시용)
  http.get('*/api/accounts/:accountId', async ({ params }) => {
    await delay(200)
    const accountId = Number(params.accountId)
    const account = MOCK_ACCOUNTS.find((item) => item.accountId === accountId)

    if (!account) {
      return HttpResponse.json(
        { success: false, data: null, error: { message: '계좌 정보를 찾을 수 없습니다.' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        ...account,
        maturityAt: null,
        monthlyPaymentLimit: null,
      },
      error: null,
    })
  }),

  http.post('*/api/goals/:goalId/pull-funds', async ({ params, request }) => {
    await delay(350)
    const goalId = Number(params.goalId)
    const { sourceAccountId, amount } = await request.json()
    const sourceAccount = MOCK_ACCOUNTS.find(
      (account) => account.accountId === Number(sourceAccountId)
    )

    if (!sourceAccount || !Number.isFinite(amount) || amount <= 0) {
      return HttpResponse.json(
        { success: false, data: null, error: { message: '끌어쓰기 입력값을 확인해주세요.' } },
        { status: 400 }
      )
    }

    if (amount > sourceAccount.balance) {
      return HttpResponse.json(
        { success: false, data: null, error: { message: '계좌 잔액이 부족합니다.' } },
        { status: 400 }
      )
    }

    sourceAccount.balance -= amount
    const currentAmount = getMockGoalAmounts(goalId).currentAmount + amount
    MOCK_PULL_CURRENT_AMOUNTS.set(goalId, currentAmount)

    return HttpResponse.json({
      success: true,
      data: { pulledAmount: amount, currentAmount },
      error: null,
    })
  }),

  // 저금통 개설 API (GOAL-04)
  http.post('*/api/money-boxes', async ({ request }) => {
    await delay(500)
    const payload = await request.json()

    return HttpResponse.json(
      {
        moneyBoxId: Math.floor(Math.random() * 100000),
        userId: 0,
        moneyBoxType: payload.moneyBoxType,
        balance: 0,
        maskedAccountNumber: '123-****-7890',
        createdAt: new Date().toISOString(),
        assetType: 'MONEY_BOX',
      },
      { status: 201 }
    )
  }),

  http.get('*/api/mydata', async () => {
    return HttpResponse.json(mydata)
  }),

  // 목표 컬렉션 조회 API (GET /api/goals/collection)
  http.get('*/api/goals/collection', async () => {
    return HttpResponse.json({
      collections: MOCK_COLLECTIONS,
    })
  }),

  // 완료 목표를 컬렉션에 담기
  http.patch('*/api/goals/:goalId/collection', async ({ params }) => {
    const goalId = Number(params.goalId)
    if (!MOCK_COLLECTIONS.some((goal) => goal.goalId === goalId)) {
      MOCK_COLLECTIONS.unshift({
        goalId,
        goalName: '독립자금',
        goalType: 'INDEPENDENCE',
        goalAmount: 30000000,
        completedDate: new Date().toISOString().slice(0, 10),
      })
    }
    return HttpResponse.json({ goalId })
  }),

  // 메인 대시보드용 mock 호출 핸들러
  http.get('*/api/goals', async () => {
    return HttpResponse.json({
      goals: [
        {
          goalId: 1,
          goalName: '독립 자금',
          goalType: 'INDEPENDENCE',
          progressRate: getMockGoalAmounts(1).progressRate,
          status: MOCK_GOAL_UPDATES.get(1)?.status ?? 'ACTIVE',
        },
        {
          goalId: 2,
          goalName: '학자금 대출 상환',
          goalType: 'LOAN',
          progressRate: getMockGoalAmounts(2).progressRate,
          status: 'ACTIVE',
        },
        {
          goalId: 3,
          goalName: '결혼 자금',
          goalType: 'WEDDING',
          progressRate: getMockGoalAmounts(3).progressRate,
          status: 'ACTIVE',
        },
      ],
    })
  }),

  http.patch('*/api/goals/:goalId', async ({ params, request }) => {
    await delay(350)
    const goalId = Number(params.goalId)
    const payload = await request.json()

    // 서버 DTO는 필드가 모두 nullable이지만 UPDATE 문이 컬럼을 조건 없이 덮어써서
    // 필드를 빠뜨리면 NULL이 된다. 부분 수정을 허용하지 않도록 일부러 필수로 검증한다.
    if (
      !Number.isFinite(payload.goalAmount) ||
      payload.goalAmount < 10000 ||
      !Number.isInteger(payload.goalMonths) ||
      payload.goalMonths <= 0
    ) {
      return HttpResponse.json({ message: '목표 수정 입력값을 확인해주세요.' }, { status: 400 })
    }

    const currentGoal = MOCK_GOAL_UPDATES.get(goalId) ?? {}
    MOCK_GOAL_UPDATES.set(goalId, {
      ...currentGoal,
      ...payload,
      goalDate: getGoalDateFromMonths(payload.goalMonths),
    })
    return HttpResponse.json({ success: true, data: null, error: null })
  }),

  http.get('*/api/goals/:goalId/linked-assets', async ({ params }) => {
    if (params.goalId === '3') {
      return HttpResponse.json({
        success: true,
        data: {
          goalId: 3,
          totalLinkedBalance: 5000000,
          linkedAssets: [
            {
              assetType: 'ACCOUNT',
              assetId: 7,
              assetName: '스마트 정기예금',
              institutionName: '연결 은행',
              maskedAccountNumber: '***7890',
              balance: 5000000,
              interestRate: 3.5,
            },
          ],
        },
        error: null,
      })
    }

    if (params.goalId === '2') {
      return HttpResponse.json({
        success: true,
        data: {
          goalId: 2,
          totalLinkedBalance: 2500000,
          linkedAssets: [
            {
              assetType: 'MONEY_BOX',
              assetId: 5,
              assetName: '미래로 저금통',
              institutionName: null,
              maskedAccountNumber: null,
              balance: 2500000,
              interestRate: null,
            },
          ],
        },
        error: null,
      })
    }

    return HttpResponse.json({
      success: true,
      data: {
        goalId: Number(params.goalId),
        totalLinkedBalance: 11500000,
        linkedAssets: [
          {
            assetType: 'MONEY_BOX',
            assetId: 5,
            assetName: '미래로 저금통',
            institutionName: null,
            maskedAccountNumber: null,
            balance: 8500000,
            interestRate: null,
          },
          {
            assetType: 'ACCOUNT',
            assetId: 6,
            assetName: '독립 적금',
            institutionName: '연결 은행',
            maskedAccountNumber: '***456',
            balance: 3000000,
            interestRate: 3.5,
          },
        ],
      },
      error: null,
    })
  }),

  http.get('*/api/goals/:goalId', async ({ params }) => {
    if (params.goalId === '2') {
      const { goalAmount, currentAmount, progressRate } = getMockGoalAmounts(2)
      return HttpResponse.json({
        goalId: 2,
        goalType: 'LOAN',
        goalName: '학자금 대출 상환',
        goalAmount,
        startAmount: 0,
        currentAmount,
        progressRate,
        period: {
          goalMonths: 8,
          startDate: '2026-01',
          endDate: '2026-08',
          remainMonths: 1,
        },
        status: 'ACTIVE',
        pace: {
          expectedAmount: 5000000,
          differenceAmount: 500000,
          paceStatus: 'BEHIND',
        },
      })
    }

    if (params.goalId === '3') {
      const { goalAmount, currentAmount, progressRate } = getMockGoalAmounts(3)
      return HttpResponse.json({
        goalId: 3,
        goalType: 'WEDDING',
        goalName: '결혼 자금',
        goalAmount,
        startAmount: 0,
        currentAmount,
        progressRate,
        period: {
          goalMonths: 18,
          startDate: '2026-07',
          endDate: '2027-12',
          remainMonths: 17,
        },
        status: 'ACTIVE',
        pace: {
          expectedAmount: 5000000,
          differenceAmount: 0,
          paceStatus: 'ON_TRACK',
        },
      })
    }

    const goalId = Number(params.goalId)
    const override = MOCK_GOAL_UPDATES.get(goalId)
    const { goalAmount, currentAmount, progressRate } = getMockGoalAmounts(goalId)
    return HttpResponse.json({
      goalId,
      goalType: 'INDEPENDENCE',
      goalName: override?.goalName ?? '독립 자금',
      goalAmount,
      startAmount: 0,
      currentAmount,
      progressRate,
      period: {
        goalMonths: override?.goalMonths ?? getGoalMonths(override?.goalDate),
        startDate: '2026-06',
        endDate: override?.goalDate ?? '2028-03',
        remainMonths: getGoalMonths(override?.goalDate),
      },
      status: override?.status ?? 'ACTIVE',
      pace: {
        expectedAmount: 10810000,
        differenceAmount: 690000,
        paceStatus: 'AHEAD', // 'AHEAD' | 'ON_TRACK' | 'BEHIND'로 바꿔가며 배너 색상 확인 가능
      },
    })
  }),

  http.get('*/api/goals/:goalId/assets', async ({ params }) => {
    if (params.goalId === '3') {
      return HttpResponse.json({
        assets: [
          {
            assetType: 'ACCOUNT',
            assetId: 4,
            assetName: '스마트 정기예금',
            bankName: '연결 은행',
            accountNumberMasked: '***7890',
            balance: 5000000,
            assetDetail: { interestRate: 3.5, maturityDate: '2027-12-31' },
            autoTransfer: {
              amount: 150000,
              transferDay: 15,
              withdrawalAccount: { bankName: '연결 은행', accountNumberMasked: '***789' },
            },
          },
        ],
      })
    }

    if (params.goalId === '2') {
      return HttpResponse.json({
        assets: [
          {
            assetType: 'LOAN',
            assetId: 3,
            assetName: '학자금 대출',
            bankName: '연결 은행',
            accountNumberMasked: '***321',
            balance: null,
            assetDetail: { interestRate: 3.0, maturityDate: '2026-08-25' },
            autoTransfer: {
              amount: 1000000,
              transferDay: 10,
              withdrawalAccount: { bankName: '연결 은행', accountNumberMasked: '***789' },
            },
          },
          {
            assetType: 'MONEY_BOX',
            assetId: 5,
            assetName: '미래로 저금통',
            bankName: '연결 은행',
            accountNumberMasked: '***456',
            balance: 2500000,
            assetDetail: null,
            autoTransfer: {
              amount: 300000,
              transferDay: 10,
              withdrawalAccount: { bankName: '연결 은행', accountNumberMasked: '***789' },
            },
          },
        ],
      })
    }

    return HttpResponse.json({
      assets: [
        {
          assetType: 'MONEY_BOX',
          assetId: 1,
          assetName: '미래로 저금통',
          bankName: '연결 은행',
          accountNumberMasked: '***123',
          balance: 8500000,
          assetDetail: null,
          autoTransfer: {
            amount: 250000,
            transferDay: 10,
            withdrawalAccount: { bankName: '연결 은행', accountNumberMasked: '***789' },
          },
        },
        {
          assetType: 'ACCOUNT',
          assetId: 2,
          assetName: '독립 적금',
          bankName: '연결 은행',
          accountNumberMasked: '***456',
          balance: 3500000,
          assetDetail: { interestRate: 4.5, maturityDate: '2028-03-15' },
          autoTransfer: {
            amount: 100000,
            transferDay: 10,
            withdrawalAccount: { bankName: '연결 은행', accountNumberMasked: '***789' },
          },
        },
      ],
    })
  }),

  http.post('*/api/goals/:goalId/assets', async () => {
    await delay(300)
    return HttpResponse.json({
      success: true,
      data: { success: true },
      error: null,
    })
  }),

  http.get('*/api/goals/:goalId/available-money/monthly', async () => {
    return HttpResponse.json({
      monthlyIncome: 2800000,
      fixedExpense: 900000,
      targetGoalAutoTransfer: 300000,
      otherGoalAutoTransfer: 300000,
      variableExpense: 500000,
      monthlyAvailableMoney: 800000,
      elapsedDays: 12,
      remainingDays: 19,
      periodDays: 31,
    })
  }),

  http.get('*/api/goals/:goalId/available-money/daily', async () => {
    return HttpResponse.json({
      todayAvailableMoney: 26666,
      todayExpense: 16666,
      remainingAvailableMoney: 800000,
    })
  }),

  http.get('*/api/goals/:goalId/milestones', async ({ params }) => {
    if (params.goalId === '2') {
      return milestoneResponse([
        {
          milestoneId: 5,
          order: 1,
          targetAmount: 2500000,
          targetDate: '2026-03',
          title: '대출 1/4 상환 완료',
          tags: ['원금 감축 시작'],
          status: 'COMPLETED',
        },
        {
          milestoneId: 6,
          order: 2,
          targetAmount: 5000000,
          targetDate: '2026-05',
          title: '대출 절반 상환 달성',
          tags: ['상환 속도 유지'],
          status: 'IN_PROGRESS',
        },
        {
          milestoneId: 7,
          order: 3,
          targetAmount: 7500000,
          targetDate: '2026-07',
          title: '대출 3/4 상환 달성',
          tags: ['완제 임박'],
          status: 'UPCOMING',
        },
        {
          milestoneId: 8,
          order: 4,
          targetAmount: 10000000,
          targetDate: '2026-08',
          title: '학자금 대출 완제 🎓',
          tags: ['부채 청산', '완제'],
          status: 'UPCOMING',
        },
      ])
    }

    if (params.goalId === '3') {
      return milestoneResponse([
        {
          milestoneId: 9,
          order: 1,
          targetAmount: 6250000,
          targetDate: '2026-11',
          title: '예식장 계약금 마련',
          tags: ['예식장 예약'],
          status: 'IN_PROGRESS',
        },
        {
          milestoneId: 10,
          order: 2,
          targetAmount: 12500000,
          targetDate: '2027-04',
          title: '혼수 준비금 확보',
          tags: ['혼수 준비'],
          status: 'UPCOMING',
        },
        {
          milestoneId: 11,
          order: 3,
          targetAmount: 18750000,
          targetDate: '2027-09',
          title: '예단·예물 준비금 마련',
          tags: ['예단', '예물'],
          status: 'UPCOMING',
        },
        {
          milestoneId: 12,
          order: 4,
          targetAmount: 25000000,
          targetDate: '2027-12',
          title: '결혼 자금 2,500만원 완성 💍',
          tags: ['결혼 준비 완료'],
          status: 'UPCOMING',
        },
      ])
    }

    return milestoneResponse([
      {
        milestoneId: 1,
        order: 1,
        targetAmount: 7500000,
        targetDate: '2026-06',
        title: '첫 목돈 750만원 달성',
        tags: ['비상금 완성', '목돈 보유'],
        status: 'COMPLETED',
      },
      {
        milestoneId: 2,
        order: 2,
        targetAmount: 15000000,
        targetDate: '2027-01',
        title: '중간 목표 1,500만원 달성',
        tags: ['전세 탐색', '대출 준비'],
        status: 'IN_PROGRESS',
      },
      {
        milestoneId: 3,
        order: 3,
        targetAmount: 22500000,
        targetDate: '2027-09',
        title: '전세 준비금 2,250만원 달성',
        tags: ['대출 최소화', '청약 가점'],
        status: 'UPCOMING',
      },
      {
        milestoneId: 4,
        order: 4,
        targetAmount: 30000000,
        targetDate: '2028-03',
        title: '독립자금 3,000만원 완성 🏠',
        tags: ['독립 가능', '자산 성장'],
        status: 'UPCOMING',
      },
    ])
  }),

  http.patch('*/api/goals/:goalId/status', async ({ params, request }) => {
    const { status } = await request.json()
    if (!['ACTIVE', 'PAUSED'].includes(status)) {
      return HttpResponse.json({ message: '목표 상태 입력값을 확인해주세요.' }, { status: 400 })
    }

    const goalId = Number(params.goalId)
    const currentGoal = MOCK_GOAL_UPDATES.get(goalId) ?? {}
    MOCK_GOAL_UPDATES.set(goalId, { ...currentGoal, status })
    return HttpResponse.json({
      success: true,
      data: null,
      error: null,
    })
  }),
]
