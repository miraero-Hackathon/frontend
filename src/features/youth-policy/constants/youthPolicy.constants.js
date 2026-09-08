/**
 * @typedef {Object} PolicyCategory
 * @property {string} id
 * @property {string} label
 * @property {string} keyword 목록 조회 API에 keyword 파라미터로 그대로 넘기는 값 (전체는 빈 문자열)
 */

export const POLICY_CATEGORY_IDS = Object.freeze({
  ALL: 'ALL',
  LOAN: 'LOAN',
  SUBSIDY: 'SUBSIDY',
  VOUCHER: 'VOUCHER',
  INTEREST_BENEFIT: 'INTEREST_BENEFIT',
  CREDIT_RECOVERY: 'CREDIT_RECOVERY',
  PUBLIC_RENTAL_HOUSING: 'PUBLIC_RENTAL_HOUSING',
  HOUSING_SUPPORT: 'HOUSING_SUPPORT',
})

/** @type {ReadonlyArray<PolicyCategory>} */
export const POLICY_CATEGORIES = Object.freeze([
  { id: POLICY_CATEGORY_IDS.ALL, label: '전체', keyword: '' },
  { id: POLICY_CATEGORY_IDS.HOUSING_SUPPORT, label: '월세지원', keyword: '주거지원' },
  {
    id: POLICY_CATEGORY_IDS.PUBLIC_RENTAL_HOUSING,
    label: '청년주택',
    keyword: '공공임대주택',
  },
  { id: POLICY_CATEGORY_IDS.LOAN, label: '대출', keyword: '대출' },
  { id: POLICY_CATEGORY_IDS.SUBSIDY, label: '지원금', keyword: '보조금' },
  { id: POLICY_CATEGORY_IDS.VOUCHER, label: '바우처', keyword: '바우처' },
  { id: POLICY_CATEGORY_IDS.INTEREST_BENEFIT, label: '이자지원', keyword: '금리혜택' },
  { id: POLICY_CATEGORY_IDS.CREDIT_RECOVERY, label: '신용관리', keyword: '신용회복' },
])

export const DEFAULT_PAGE_SIZE = 10

// 조건 일치 정책은 첫 화면에서 3개만 미리 보고, 전체보기에서는 6개씩 탐색한다.
export const RECOMMENDED_PREVIEW_SIZE = 3
export const RECOMMENDED_PAGE_SIZE = 6

/** @type {ReadonlyArray<string>} */
export const POLICY_REGIONS = Object.freeze([
  '전체',
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
])
