// credit.constants.js

export const CREDIT_TABS = [
  { id: 'BENEFITS', label: '점수대별 금융 혜택' },
  { id: 'POSITIVE', label: '신용 가점 항목' },
  { id: 'NEGATIVE', label: '신용 감점 유의사항' },
]

export const DEFAULT_CREDIT_TAB = 'BENEFITS'

// 1. 점수대별 금융 혜택 데이터 (PDF 1-3 반영)
export const CREDIT_BENEFIT_RANGES = [
  {
    id: '900-1000',
    minScore: 900,
    maxScore: 1000,
    label: '900 ~ 1000점',
    avgRate: '연 4.87% ~ 5.32%',
    dsrLimit: '최상위 우대 적용',
    cardIssuance: '발급 및 한도 최대 승인',
  },
  {
    id: '800-899',
    minScore: 800,
    maxScore: 899,
    label: '800 ~ 899점',
    avgRate: '연 5.3% ~ 6.0%',
    dsrLimit: '일반 우대 조건 적용',
    cardIssuance: '우대 한도 승인',
  },
  {
    id: '700-799',
    minScore: 700,
    maxScore: 799,
    label: '700 ~ 799점',
    avgRate: '연 6.5% ~ 8.2%',
    dsrLimit: '기본 규제 비율 준수',
    cardIssuance: '정상 발급',
  },
  {
    id: 'under-700',
    minScore: 0,
    maxScore: 699,
    label: '600 ~ 699점 이하',
    avgRate: '연 8.5% ~ 12.0%',
    dsrLimit: '추가 심사 필요',
    cardIssuance: '조건부 발급 가능',
  },
]

// 2. 가점 항목 평가 요소 (PDF 2-1 반영: NICE & KCB 평가 비중)
export const CREDIT_POSITIVE_ITEMS = [
  {
    id: 'repayment_history',
    name: '상환이력',
    niceWeight: '28.4%',
    kcbWeight: '21%',
    impactStars: '★★★★★',
    actionText: '정상상환 유지',
    description: '카드대금·대출 원리금 등을 약속된 날짜에 정상 상환하고 연체를 피하는 습관',
  },
  {
    id: 'credit_form',
    name: '신용거래형태',
    niceWeight: '27.5%',
    kcbWeight: '38%',
    impactStars: '★★★★☆',
    actionText: '이용형태 관리',
    description: '신용카드·체크카드 적정 비율 이용 및 단기카드대출 자제',
  },
  {
    id: 'debt_level',
    name: '부채수준',
    niceWeight: '24.5%',
    kcbWeight: '24%',
    impactStars: '★★★★☆',
    actionText: '부채관리',
    description: '기존 대출 원금 상환, 과도한 신규대출 자제 및 채무 부담 관리',
  },
  {
    id: 'credit_length',
    name: '신용거래기간',
    niceWeight: '12.3%',
    kcbWeight: '9%',
    impactStars: '★★★☆☆',
    actionText: '장기간 정상거래',
    description: '연체 없이 정상적인 금융거래를 장기간 유지하는 평가 요소',
  },
  {
    id: 'non_financial',
    name: '비금융·마이데이터',
    niceWeight: '7.3%',
    kcbWeight: '8%',
    impactStars: '★★☆☆☆',
    actionText: '성실납부 정보',
    description: '통신비·건강보험·국민연금 등 6개월 이상 성실납부 정보 제출',
  },
]

// 3. 감점 항목 (PDF 3-1~3-4 반영)
export const CREDIT_NEGATIVE_ITEMS = [
  {
    id: 'delinquency',
    name: '단기/장기 연체 발생',
    riskLevel: '★★★★★',
    description: '10만원 이상, 5영업일 이상의 단기 연체 발생 시 신용 점수가 하락합니다.',
    tip: '소액이라도 결제일 자동이체를 등록해 연체를 사전에 방지하세요.',
  },
  {
    id: 'cash_service',
    name: '과도한 현금서비스/카드론',
    riskLevel: '★★★★☆',
    description: '단기카드대출(현금서비스)을 빈번하게 이용할 경우 유동성 위험으로 판단됩니다.',
    tip: '제1금융권 비상금 대출 등 정식 대출 상품을 우선 검토하세요.',
  },
  {
    id: 'high_card_usage',
    name: '신용카드 한도 대비 과다 사용',
    riskLevel: '★★★☆☆',
    description: '카드 한도의 80~90% 이상을 지속적으로 사용할 경우 부채 위험도가 높게 평가됩니다.',
    tip: '한도를 증액하거나 이용 금액을 30~50% 이하로 조정하세요.',
  },
]
