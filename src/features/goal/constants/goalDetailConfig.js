// GOAL-02(목표 구체화) 화면을 목표 프리셋별로 다르게 그리기 위한 설정
import { GOAL_PRESET_IDS } from '@/features/goal/constants/goal.constants.js'

/**
 * @typedef {Object} GoalDetailInfoText
 * @property {string} prefix
 * @property {string} highlight 강조 표시할 부분 (없으면 빈 문자열)
 * @property {string} suffix
 */

/**
 * @typedef {Object} GoalDetailConfig
 * @property {string} title 화면 타이틀 (줄바꿈은 \n)
 * @property {'input' | 'presetCard'} amountFieldType 금액 입력 UI 종류
 * @property {string} amountLabel 목표금액 입력 카드 라벨
 * @property {Array} amountPresets amountFieldType이 'input'이면 {label,value}[], 'presetCard'면 {key,title,value}[]
 * @property {number} defaultAmount 금액 기본값
 * @property {string} periodLabel 기간 카드 라벨
 * @property {number} periodMin
 * @property {number} periodMax
 * @property {number} periodDefault
 * @property {{label: string, value: number}[]} periodPresets 기간 프리셋 칩 (빈 배열이면 슬라이더만)
 * @property {boolean} showTargetDate 기간 카드에 목표 달성 예정일 캡션 표시 여부
 * @property {boolean} showPeriodFormula 결과 박스에 "금액 ÷ 기간" 수식 캡션 표시 여부
 * @property {GoalDetailInfoText} infoText 하단 안내 문구
 */

/** @type {Record<string, GoalDetailConfig>} */
export const GOAL_DETAIL_CONFIG = {
  [GOAL_PRESET_IDS.INDEPENDENCE]: {
    title: '얼마를, 언제까지\n모을까요?',
    amountFieldType: 'input',
    amountLabel: '독립자금 마련 목표금액',
    amountPresets: [
      { label: '1,000만원', value: 10000000 },
      { label: '2,000만원', value: 20000000 },
      { label: '3,000만원', value: 30000000 },
      { label: '5,000만원', value: 50000000 },
    ],
    defaultAmount: 30000000,
    periodLabel: '목표 기간',
    periodMin: 6,
    periodMax: 60,
    periodDefault: 24,
    periodPresets: [
      { label: '6개월', value: 6 },
      { label: '1년', value: 12 },
      { label: '2년', value: 24 },
      { label: '3년', value: 36 },
    ],
    showTargetDate: true,
    showPeriodFormula: false,
    infoText: {
      prefix:
        '소득·지출은 마이데이터에서 자동으로 계산해요. 입력한 금액과 실제 저축 여력을 함께 고려해 로드맵을 만들어 드려요.',
      highlight: '',
      suffix: '',
    },
  },
  [GOAL_PRESET_IDS.EMERGENCY]: {
    title: '비상금, 몇 개월치\n모을까요?',
    amountFieldType: 'input',
    amountLabel: '목표금액',
    amountPresets: [
      { label: '300만원', value: 3000000 },
      { label: '500만원', value: 5000000 },
      { label: '1,000만원', value: 10000000 },
    ],
    defaultAmount: 5000000,
    periodLabel: '모으는 기간',
    periodMin: 1,
    periodMax: 36,
    periodDefault: 12,
    periodPresets: [
      { label: '3개월', value: 3 },
      { label: '6개월', value: 6 },
      { label: '1년', value: 12 },
      { label: '2년', value: 24 },
    ],
    showTargetDate: false,
    showPeriodFormula: true,
    infoText: {
      prefix:
        '소득·지출은 마이데이터에서 자동으로 계산해요. 입력한 금액과 실제 저축 여력을 함께 고려해 로드맵을 만들어 드려요.',
      highlight: '',
      suffix: '',
    },
  },
  [GOAL_PRESET_IDS.MARRIAGE]: {
    title: '결혼 자금, 함께\n준비해봐요',
    amountFieldType: 'presetCard',
    amountLabel: '예상 결혼 비용',
    amountPresets: [
      { key: 'small', title: '스몰 웨딩', value: 20000000 },
      { key: 'general', title: '일반', value: 50000000 },
    ],
    defaultAmount: 50000000,
    periodLabel: '예식 예정 시점',
    periodMin: 6,
    periodMax: 60,
    periodDefault: 24,
    periodPresets: [
      { label: '6개월', value: 6 },
      { label: '1년', value: 12 },
      { label: '2년', value: 24 },
      { label: '3년', value: 36 },
    ],
    showTargetDate: false,
    showPeriodFormula: false,
    infoText: {
      prefix: '결혼 준비 기간은 짧아 변동성을 최소화하는 ',
      highlight: '안정형 상품(적금·예금)',
      suffix: '을 기본으로 추천해드려요.',
    },
  },
  [GOAL_PRESET_IDS.STUDENT_LOAN]: {
    title: '빚 없는 출발,\n언제까지 완납할까요?',
    amountFieldType: 'input',
    amountLabel: '남은 대출 잔액 (원금)',
    defaultAmount: 0,
    periodLabel: '완납 기간',
    periodMin: 6,
    periodMax: 60,
    periodDefault: 24,
    periodPresets: [
      { label: '6개월', value: 6 },
      { label: '1년', value: 12 },
      { label: '2년', value: 24 },
      { label: '3년', value: 36 },
    ],
    showTargetDate: false,
    showPeriodFormula: false,
    infoText: {
      prefix:
        '이자는 원리금균등상환(등록금대출상환) 방식으로 계산됩니다. 실제 상환액은 상환 방식·중도상환 여부에 따라 달라질 수 있어요.',
      highlight: '',
      suffix: '',
    },
  },
}

export const DEFAULT_GOAL_DETAIL_CONFIG = GOAL_DETAIL_CONFIG[GOAL_PRESET_IDS.INDEPENDENCE]
