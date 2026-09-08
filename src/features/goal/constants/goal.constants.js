/**
 * @typedef {Object} GoalPreset
 * @property {string} id - 목표 프리셋 고유 ID
 * @property {string} title - 목표 프리셋 제목
 * @property {string} description - 목표 프리셋 설명
 * @property {string} icon - 목표 프리셋 아이콘 (이모지 또는 아이콘명)
 * @property {boolean} [isRecommended] - 첫 시작 추천 여부
 * @property {string} [badgeText] - 추천 뱃지 문구
 * @property {string[]} [tags] - 목표 특성 태그 목록
 */

/**
 * 4가지 목표 프리셋 고유 ID 정의
 * @type {Readonly<{INDEPENDENCE: string, EMERGENCY: string, MARRIAGE: string, STUDENT_LOAN: string}>}
 */
export const GOAL_PRESET_IDS = Object.freeze({
  INDEPENDENCE: 'INDEPENDENCE',
  EMERGENCY: 'EMERGENCY',
  MARRIAGE: 'MARRIAGE',
  STUDENT_LOAN: 'STUDENT_LOAN',
})

export const GOAL_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
})

/**
 * 4가지 목표 프리셋 데이터 상수
 * @type {ReadonlyArray<GoalPreset>}
 */
export const GOAL_PRESETS = Object.freeze([
  {
    id: GOAL_PRESET_IDS.EMERGENCY,
    title: '비상금',
    description: '든든하게 모으는 첫 목돈',
    icon: '💰',
    isRecommended: false,
    badgeText: null,
    tags: ['첫 목돈 마련', '자유로운 저축', '종잣돈 첫걸음'],
    guideInfo: '아직 구체적인 목적이 없어도 괜찮아요. 언제든 든든하게 힘이 되어줄 나만의 첫 목돈을 만들어보세요.',
  },
  {
    id: GOAL_PRESET_IDS.INDEPENDENCE,
    title: '독립자금',
    description: '첫 보증금과 자취 준비',
    icon: '🏠',
    isRecommended: false,
    badgeText: null,
    tags: ['보증금 마련', '1인가구 독립', '중기 목표'],
    guideInfo: '첫 자취 독립이나 전세 보증금 등 나만의 보금자리를 준비하는 분께 추천해요.',
  },
  {
    id: GOAL_PRESET_IDS.STUDENT_LOAN,
    title: '학자금 대출 상환',
    description: '이자 줄이는 부채 상환',
    icon: '🎓',
    isRecommended: false,
    badgeText: null,
    tags: ['이자 절감', '신용점수 관리', '부채 제로'],
    guideInfo: '대출 이자 부담을 줄이고 원금을 계획적으로 빠르게 갚고 싶은 분께 추천해요.',
  },
  {
    id: GOAL_PRESET_IDS.MARRIAGE,
    title: '결혼자금',
    description: '행복한 새 출발 준비',
    icon: '💍',
    isRecommended: false,
    badgeText: null,
    tags: ['미래 자산', '안정형 저축', '중장기 목표'],
    guideInfo: '결혼식과 신혼 준비를 위해 안정적으로 자금을 마련하고 싶은 분께 추천해요.',
  },
])
