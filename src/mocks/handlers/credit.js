import { http, HttpResponse } from 'msw'

const mockCreditHistory = [
  {
    delta: -100,
    description: "저축목표 '전세보증금' 자동이체 30일 미납",
    occurredAt: '2026-09-09T02:47:59.926Z',
    reasonCode: 'SHORT_TERM_OVERDUE',
    reasonDisplayName: '단기 연체',
    scoreAfter: 565,
  },
  {
    delta: 15,
    description: '신용/체크카드 주 사용실적 지속 반영',
    occurredAt: '2026-08-25T10:15:00.000Z',
    reasonCode: 'CARD_USE_EXCELLENT',
    reasonDisplayName: '카드 이용실적',
    scoreAfter: 665,
  },
  {
    delta: 30,
    description: '1 금융권 대출 원리금 성실 상환',
    occurredAt: '2026-08-10T14:30:22.000Z',
    reasonCode: 'LOAN_REPAYMENT',
    reasonDisplayName: '대출 상환',
    scoreAfter: 650,
  },
  {
    delta: 10,
    description: '마이데이터 자산 정보 지속 연동 유지',
    occurredAt: '2026-07-28T09:00:00.000Z',
    reasonCode: 'MYDATA_SUBMISSION',
    reasonDisplayName: '비금융 정보 제출',
    scoreAfter: 620,
  },
  {
    delta: -25,
    description: '신규 신용대출 조회 및 실행',
    occurredAt: '2026-07-01T16:20:10.000Z',
    reasonCode: 'NEW_LOAN_EXECUTION',
    reasonDisplayName: '신규 대출 발생',
    scoreAfter: 610,
  },
]

// 새로 만든/추가할 신용점수 핸들러
export const creditHandlers = [
  http.get('*/api/credit-score', () => {
    return HttpResponse.json({
      success: true,
      data: {
        currentScore: 750,
        updatedAt: '2026-09-09T10:00:00',
      },
      error: null,
    })
  }),
  http.get('*/api/credit-score/history', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || 1)
    const size = Number(url.searchParams.get('size') || 10)

    const totalElements = mockCreditHistory.length
    const totalPages = Math.ceil(totalElements / size)

    // 요청한 페이지 범위에 맞게 Slice
    const start = (page - 1) * size
    const content = mockCreditHistory.slice(start, start + size)

    return HttpResponse.json({
      success: true,
      data: {
        content,
        page,
        size,
        totalElements,
        totalPages,
        first: page === 1,
        last: page >= totalPages || totalPages === 0,
      },
      error: null,
    })
  }),
]
