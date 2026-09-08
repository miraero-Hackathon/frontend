export const DEFAULT_SELECTED_GOAL = '유럽 여행자금'

export const MONTHS_SHORTENED_PER_SAVING_UNIT = 0.04

export const SPENDING_CATEGORY_TYPES = {
  FIXED: 'FIXED',
  VARIABLE: 'VARIABLE',
}

export const SPENDING_COMPARISON_BASES = [
  { id: 'AGE', label: '연령대 기준' },
  { id: 'INCOME', label: '월소득 기준' },
]

export const SPENDING_AGE_GROUPS = [
  { id: '20-24', label: '20~24세', minAge: 20, maxAge: 24 },
  { id: '25-29', label: '25~29세', minAge: 25, maxAge: 29 },
  { id: '30-34', label: '30~34세', minAge: 30, maxAge: 34 },
]

export const SPENDING_INCOME_GROUPS = [
  { id: 'under-250', label: '250만원 미만' },
  { id: '250-350', label: '250~350만원' },
  { id: '350-500', label: '350~500만원' },
  { id: 'over-500', label: '500만원 이상' },
]

export const DEFAULT_SPENDING_AGE_GROUP_ID = '25-29'
export const DEFAULT_SPENDING_INCOME_GROUP_ID = '250-350'

// 카테고리와 타입, 표시 순서, 스타일을 하나의 메타데이터로 관리한다.
export const SPENDING_CATEGORIES = [
  {
    id: 'housing',
    code: 'HOUSING',
    name: '주거',
    type: 'FIXED',
    icon: '🏠',
    current: 38,
    accent: '#3D8BFF',
    softColor: '#F2F4F6',
    borderColor: '#B9D4FF',
  },
  {
    id: 'telecommunication',
    code: 'TELECOMMUNICATION',
    name: '통신',
    type: 'FIXED',
    icon: '📱',
    current: 7,
    accent: '#0EA5E9',
    softColor: '#F2F4F6',
    borderColor: '#BAE6FD',
  },
  {
    id: 'insurance',
    code: 'INSURANCE',
    name: '보험',
    type: 'FIXED',
    icon: '🛡️',
    current: 12,
    accent: '#6366F1',
    softColor: '#F2F4F6',
    borderColor: '#C7D2FE',
  },
  {
    id: 'subscription',
    code: 'SUBSCRIPTION',
    name: '구독',
    type: 'FIXED',
    icon: '📺',
    current: 8,
    accent: '#8B5CF6',
    softColor: '#F2F4F6',
    borderColor: '#DDD6FE',
  },
  {
    id: 'loanRepayment',
    code: 'LOAN_REPAYMENT',
    name: '대출상환',
    type: 'FIXED',
    icon: '🏦',
    current: 15,
    accent: '#64748B',
    softColor: '#F2F4F6',
    borderColor: '#CBD5E1',
  },
  {
    id: 'savings',
    code: 'SAVINGS',
    name: '저축',
    type: 'FIXED',
    icon: '🐷',
    current: 20,
    accent: '#10B981',
    softColor: '#F2F4F6',
    borderColor: '#A7F3D0',
  },
  {
    id: 'investment',
    code: 'INVESTMENT',
    name: '투자',
    type: 'FIXED',
    icon: '📈',
    current: 10,
    accent: '#14B8A6',
    softColor: '#F2F4F6',
    borderColor: '#99F6E4',
  },
  {
    id: 'food',
    code: 'FOOD',
    name: '식비',
    type: 'VARIABLE',
    icon: '🍴',
    current: 32,
    min: 0,
    step: 1,
    accent: '#FF6B6B',
    softColor: '#F2F4F6',
    borderColor: '#FFCDD2',
  },
  {
    id: 'cafe',
    code: 'CAFE',
    name: '카페',
    type: 'VARIABLE',
    icon: '☕',
    current: 14,
    min: 0,
    step: 1,
    accent: '#F59E0B',
    softColor: '#F2F4F6',
    borderColor: '#FDD99A',
  },
  {
    id: 'transportation',
    code: 'TRANSPORTATION',
    name: '교통',
    type: 'VARIABLE',
    icon: '🚌',
    current: 9,
    accent: '#10B981',
    softColor: '#F2F4F6',
    borderColor: '#A7F3D0',
  },
  {
    id: 'shopping',
    code: 'SHOPPING',
    name: '쇼핑',
    type: 'VARIABLE',
    icon: '🛍️',
    current: 22,
    min: 0,
    step: 1,
    accent: '#A855F7',
    softColor: '#F2F4F6',
    borderColor: '#DDB9FF',
  },
  {
    id: 'culture',
    code: 'CULTURE',
    name: '문화',
    type: 'VARIABLE',
    icon: '🎬',
    current: 7,
    min: 0,
    step: 1,
    accent: '#EC4899',
    softColor: '#F2F4F6',
    borderColor: '#FBCFE8',
  },
  {
    id: 'medical',
    code: 'MEDICAL',
    name: '의료',
    type: 'VARIABLE',
    icon: '🩺',
    current: 5,
    min: 0,
    step: 1,
    accent: '#06B6D4',
    softColor: '#F2F4F6',
    borderColor: '#A5F3FC',
  },
  {
    id: 'other',
    code: 'OTHER',
    name: '기타',
    type: 'VARIABLE',
    icon: '💳',
    current: 3,
    min: 0,
    step: 1,
    accent: '#64748B',
    softColor: '#F2F4F6',
    borderColor: '#CBD5E1',
  },
]

// [맞춤 지출 비교] 비교군별 카테고리 지출 평균(만원). 백엔드가 연령대/소득구간별 조회를 지원하지 않아
// MVP 범위에서는 25~29세(=25-29) 평균을 기준값으로 두고 비교군별 배율을 곱해 하드코딩한다.
const BASELINE_PEER_SPENDING = {
  housing: 40,
  telecommunication: 6,
  insurance: 11,
  subscription: 7,
  loanRepayment: 12,
  savings: 18,
  investment: 8,
  food: 30,
  cafe: 12,
  transportation: 10,
  shopping: 20,
  culture: 6,
  medical: 4,
  other: 4,
}

const scaleSpending = (spending, factor) =>
  Object.fromEntries(
    Object.entries(spending).map(([categoryId, amount]) => [
      categoryId,
      Math.round(amount * factor),
    ])
  )

export const PEER_SPENDING_BY_BASIS = {
  AGE: {
    '20-24': scaleSpending(BASELINE_PEER_SPENDING, 0.86),
    '25-29': BASELINE_PEER_SPENDING,
    '30-34': scaleSpending(BASELINE_PEER_SPENDING, 1.12),
  },
  INCOME: {
    'under-250': scaleSpending(BASELINE_PEER_SPENDING, 0.78),
    '250-350': scaleSpending(BASELINE_PEER_SPENDING, 0.98),
    '350-500': scaleSpending(BASELINE_PEER_SPENDING, 1.18),
    'over-500': scaleSpending(BASELINE_PEER_SPENDING, 1.42),
  },
}
