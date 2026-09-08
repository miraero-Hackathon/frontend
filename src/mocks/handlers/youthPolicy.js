import { http, HttpResponse } from 'msw'

function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const mockToday = new Date()
const mockClosingSoon = new Date()
mockClosingSoon.setDate(mockClosingSoon.getDate() + 5)
const mockTodayText = formatLocalDate(mockToday)
const mockClosingSoonText = formatLocalDate(mockClosingSoon)

// region · recommended는 API 스펙엔 없는 mock 전용 내부 메타데이터(필터링용)라 응답에는 포함하지 않는다.
const youthPolicies = [
  {
    youthPolicyId: 1,
    policyName: '청년도약계좌',
    policyKeyword: '금융,저축',
    region: '전체',
    providerInstitutionName: '서민금융진흥원',
    applicationPeriod: `${mockTodayText}까지`,
    applicationStartDate: null,
    applicationEndDate: mockTodayText,
    minAge: 19,
    maxAge: 34,
    minIncome: 0,
    maxIncome: 75000000,
    incomeConditionText: '개인소득 7,500만원 이하, 가구소득 중위 180% 이하',
    policyDescription: '청년의 중장기 자산형성을 지원하는 정부 지원 저축 상품입니다.',
    supportContent: '월 최대 70만원 납입, 만기 시 최대 5,000만원 + 정부기여금 및 이자 지원',
    qualification: '만 19~34세, 개인소득 및 가구소득 조건을 충족하는 청년',
    applicationMethod: '은행 앱 비대면 신청',
    applicationUrl: 'https://example.com/apply/1',
    referenceUrl: 'https://example.com/policy/1',
    recommended: true,
  },
  {
    youthPolicyId: 2,
    policyName: '청년주택드림 청약통장',
    policyKeyword: '주거지원,금융',
    region: '전체',
    providerInstitutionName: '국토교통부',
    applicationPeriod: `${mockClosingSoonText}까지`,
    applicationStartDate: null,
    applicationEndDate: mockClosingSoonText,
    minAge: 19,
    maxAge: 34,
    minIncome: 0,
    maxIncome: 50000000,
    incomeConditionText: '연소득 5,000만원 이하 무주택 청년',
    policyDescription: '내 집 마련을 위한 청약 자금 마련 정책입니다.',
    supportContent: '우대금리 제공 및 이자소득 비과세, 청약 당첨 시 저리 대출 연계',
    qualification: '무주택 세대주인 만 19~34세 청년',
    applicationMethod: '은행 영업점 또는 앱 신청',
    applicationUrl: 'https://example.com/apply/2',
    referenceUrl: 'https://example.com/policy/2',
    recommended: true,
  },
  {
    youthPolicyId: 3,
    policyName: '청년내일저축계좌',
    policyKeyword: '일자리,저축',
    region: '전체',
    providerInstitutionName: '보건복지부',
    applicationPeriod: '2026-03-01 ~ 2026-12-31',
    applicationStartDate: '2026-03-01',
    applicationEndDate: '2026-12-31',
    minAge: 19,
    maxAge: 34,
    minIncome: 0,
    maxIncome: 24000000,
    incomeConditionText: '기준 중위소득 100% 이하 근로 청년',
    policyDescription: '일하는 청년의 자산형성을 지원하는 정책입니다.',
    supportContent: '본인 저축액에 정부가 1:1~3 매칭 지원, 만기 시 최대 3,600만원 + 이자 지원',
    qualification: '근로·사업 활동 중인 만 19~34세 청년',
    applicationMethod: '주민센터 방문 신청',
    applicationUrl: 'https://example.com/apply/3',
    referenceUrl: 'https://example.com/policy/3',
    recommended: true,
  },
  {
    youthPolicyId: 4,
    policyName: '청년내일채움공제',
    policyKeyword: '일자리',
    region: '전체',
    providerInstitutionName: '고용노동부',
    applicationPeriod: '상시',
    applicationStartDate: null,
    applicationEndDate: null,
    minAge: 15,
    maxAge: 34,
    minIncome: 0,
    maxIncome: null,
    incomeConditionText: '소득기준 있음',
    policyDescription: '중소기업 취업 청년의 장기근속과 목돈 마련을 지원합니다.',
    supportContent: '2년형: 본인 400만원 납입 시 정부·기업 지원금 포함 최대 1,200만원 이상 수령',
    qualification: '중소·중견기업에 정규직으로 취업한 만 15~34세 청년',
    applicationMethod: '워크넷 온라인 신청',
    applicationUrl: 'https://example.com/apply/4',
    referenceUrl: 'https://example.com/policy/4',
    recommended: true,
  },
  {
    youthPolicyId: 5,
    policyName: '청년월세 특별지원',
    policyKeyword: '주거지원',
    region: '서울특별시',
    providerInstitutionName: '국토교통부',
    applicationPeriod: '2026-01-01 ~ 2026-12-31',
    applicationStartDate: '2026-01-01',
    applicationEndDate: '2026-12-31',
    minAge: 19,
    maxAge: 34,
    minIncome: 0,
    maxIncome: 30000000,
    incomeConditionText: '소득기준 있음',
    policyDescription: '경제적 어려움을 겪는 청년의 월세 부담 완화를 지원합니다.',
    supportContent: '월 최대 20만원, 최대 12개월 월세 지원',
    qualification: '만 19~34세 무주택 독립거주 청년',
    applicationMethod: '복지로 온라인 신청',
    applicationUrl: 'https://example.com/apply/5',
    referenceUrl: 'https://example.com/policy/5',
    recommended: false,
  },
  {
    youthPolicyId: 6,
    policyName: '청년 희망적금',
    policyKeyword: '금융,저축',
    region: '전체',
    providerInstitutionName: '서민금융진흥원',
    applicationPeriod: '상시',
    applicationStartDate: null,
    applicationEndDate: null,
    minAge: 19,
    maxAge: 34,
    minIncome: 0,
    maxIncome: 36000000,
    incomeConditionText: '소득기준 있음',
    policyDescription: '저축을 통해 청년의 자산형성을 지원합니다.',
    supportContent: '2년 만기, 저축장려금 및 비과세 혜택 지원',
    qualification: '만 19~34세, 총급여 3,600만원 이하 청년',
    applicationMethod: '은행 앱 비대면 신청',
    applicationUrl: 'https://example.com/apply/6',
    referenceUrl: 'https://example.com/policy/6',
    recommended: true,
  },
  {
    youthPolicyId: 7,
    policyName: '청년 마음건강 바우처',
    policyKeyword: '복지',
    region: '전체',
    providerInstitutionName: '보건복지부',
    applicationPeriod: '상시',
    applicationStartDate: null,
    applicationEndDate: null,
    minAge: 19,
    maxAge: 34,
    minIncome: null,
    maxIncome: null,
    incomeConditionText: null,
    policyDescription: '청년의 정신건강 관리를 위한 상담 지원 사업입니다.',
    supportContent: '전문 심리상담 최대 10회, 회당 비용의 일부 지원',
    qualification: '만 19~34세 청년 누구나',
    applicationMethod: '정신건강복지센터 신청',
    applicationUrl: 'https://example.com/apply/7',
    referenceUrl: 'https://example.com/policy/7',
    recommended: false,
  },
  {
    youthPolicyId: 8,
    policyName: '국가장학금 (구간형)',
    policyKeyword: '교육',
    region: '전체',
    providerInstitutionName: '한국장학재단',
    applicationPeriod: '2026-02-01 ~ 2026-03-31',
    applicationStartDate: '2026-02-01',
    applicationEndDate: '2026-03-31',
    minAge: null,
    maxAge: null,
    minIncome: 0,
    maxIncome: null,
    incomeConditionText: '소득 8구간 이하',
    policyDescription: '대학생의 등록금 부담 경감을 위한 국가장학금입니다.',
    supportContent: '소득분위별 차등 지원, 최대 등록금 전액 지원',
    qualification: '국내 대학 재학 중인 대한민국 국적 학생',
    applicationMethod: '한국장학재단 홈페이지 신청',
    applicationUrl: 'https://example.com/apply/8',
    referenceUrl: 'https://example.com/policy/8',
    recommended: false,
  },
  {
    youthPolicyId: 9,
    policyName: '청년문화예술패스',
    policyKeyword: '문화',
    region: '전체',
    providerInstitutionName: '문화체육관광부',
    applicationPeriod: '상시',
    applicationStartDate: null,
    applicationEndDate: null,
    minAge: 19,
    maxAge: 19,
    minIncome: null,
    maxIncome: null,
    incomeConditionText: null,
    policyDescription: '청년의 공연·전시 관람을 지원하는 문화 바우처입니다.',
    supportContent: '1인당 연 최대 15만원 관람 지원금 지급',
    qualification: '만 19세가 되는 해의 청년',
    applicationMethod: '청년문화예술패스 홈페이지 신청',
    applicationUrl: 'https://example.com/apply/9',
    referenceUrl: 'https://example.com/policy/9',
    recommended: false,
  },
  {
    youthPolicyId: 10,
    policyName: '청년 전세대출 이자 지원',
    policyKeyword: '대출,금리혜택,주거지원',
    region: '서울특별시',
    providerInstitutionName: '서울특별시',
    applicationPeriod: '상시',
    applicationStartDate: null,
    applicationEndDate: null,
    minAge: 19,
    maxAge: 39,
    minIncome: 0,
    maxIncome: 50000000,
    incomeConditionText: '기준 중위소득 150% 이하',
    policyDescription: '청년 전세자금대출 이자 부담을 완화해주는 지원 정책입니다.',
    supportContent: '전세대출 이자의 일부를 최대 2년간 지원',
    qualification: '서울시에 거주하는 만 19~39세 청년',
    applicationMethod: '온라인 신청',
    applicationUrl: 'https://example.com/apply/10',
    referenceUrl: 'https://example.com/policy/10',
    recommended: false,
  },
  {
    youthPolicyId: 11,
    policyName: '청년 구직활동지원금',
    policyKeyword: '일자리,취업지원',
    region: '전체',
    providerInstitutionName: '고용노동부',
    applicationPeriod: '상시',
    applicationStartDate: null,
    applicationEndDate: null,
    minAge: 18,
    maxAge: 34,
    minIncome: null,
    maxIncome: null,
    incomeConditionText: '소득기준 있음',
    policyDescription: '미취업 청년의 구직활동을 지원하는 정책입니다.',
    supportContent: '월 50만원씩 최대 6개월 구직활동 지원금 지급',
    qualification: '만 18~34세 미취업 청년',
    applicationMethod: '고용24 온라인 신청',
    applicationUrl: 'https://example.com/apply/11',
    referenceUrl: 'https://example.com/policy/11',
    recommended: true,
  },
  {
    youthPolicyId: 12,
    policyName: '청년 부동산 중개보수 및 이사비 지원사업',
    policyKeyword: '보조금,주거지원',
    region: '서울특별시',
    providerInstitutionName: '서울특별시',
    applicationPeriod: '2026-07-01 ~ 2026-08-31',
    applicationStartDate: '2026-07-01',
    applicationEndDate: '2026-08-31',
    minAge: 19,
    maxAge: 39,
    minIncome: 0,
    maxIncome: 50000000,
    incomeConditionText: '기준 중위소득 150% 이하',
    policyDescription: '주거비 부담이 높은 청년의 주거 안전망 강화를 위한 지원 사업입니다.',
    supportContent: '부동산 중개보수 및 이사비를 지원합니다.',
    qualification: '신청일 기준 서울시에 거주하는 만 19~39세 청년',
    applicationMethod: '온라인 신청',
    applicationUrl: 'https://example.com/apply/12',
    referenceUrl: 'https://example.com/policy/12',
    recommended: false,
  },
]

// API.md 스펙의 목록 응답 필드만 그대로 노출한다.
function toListItem({
  youthPolicyId,
  policyName,
  policyKeyword,
  providerInstitutionName,
  applicationPeriod,
}) {
  return { youthPolicyId, policyName, policyKeyword, providerInstitutionName, applicationPeriod }
}

export const youthPolicyHandlers = [
  // 페이지네이션과 무관하게 "내게 맞는 추천 정책" 하이라이트만 별도로 조회하는 mock 전용 엔드포인트
  // (반드시 /:youthPolicyId 동적 라우트보다 위에 있어야 "recommended"가 id로 잘못 매칭되지 않음)
  http.get('*/api/youth-policies/recommended', ({ request }) => {
    const url = new URL(request.url)
    const region = url.searchParams.get('region')?.trim()

    const content = youthPolicies
      .filter((policy) => policy.recommended)
      .filter(
        (policy) =>
          !region || region === '전체' || policy.region === '전체' || policy.region === region
      )
      .map(toListItem)

    return HttpResponse.json({ success: true, data: { content }, error: null })
  }),

  http.get('*/api/youth-policies', ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword')?.trim()
    const region = url.searchParams.get('region')?.trim()
    const search = url.searchParams.get('search')?.trim()
    const page = Number(url.searchParams.get('page') ?? 1)
    const size = Number(url.searchParams.get('size') ?? 10)

    const filtered = youthPolicies.filter((policy) => {
      const matchesKeyword = !keyword || policy.policyKeyword?.includes(keyword)
      const matchesRegion = !region || region === '전체' || policy.region === region
      const matchesSearch = !search || policy.policyName.includes(search)
      return matchesKeyword && matchesRegion && matchesSearch
    })

    const totalElements = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalElements / size))
    const start = (page - 1) * size
    const content = filtered.slice(start, start + size).map(toListItem)

    return HttpResponse.json({
      success: true,
      data: {
        content,
        page: page - 1,
        size,
        totalElements,
        totalPages,
        first: page <= 1,
        last: page >= totalPages,
      },
      error: null,
    })
  }),

  http.get('*/api/youth-policies/:youthPolicyId', ({ params }) => {
    const policy = youthPolicies.find((item) => item.youthPolicyId === Number(params.youthPolicyId))

    if (!policy) {
      return HttpResponse.json(
        { success: false, data: null, error: { message: '정책을 찾을 수 없습니다.' } },
        { status: 400 }
      )
    }

    // region · recommended는 mock 전용 내부 필드라 상세 응답에서도 제외한다.
    const detail = { ...policy }
    delete detail.region
    delete detail.recommended
    return HttpResponse.json({ success: true, data: detail, error: null })
  }),
]
