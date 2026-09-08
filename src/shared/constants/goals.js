// 목표 4종 메타 정보
/**
 * @typedef {Object} GoalTypeMeta
 * @property {string} id
 * @property {string} label
 * @property {string} description
 * @property {string} icon
 * @property {'INDEPENDENCE' | 'EMERGENCY' | 'WEDDING' | 'LOAN'} apiType 목표생성 API의 goalType 값
 */

/** @type {GoalTypeMeta[]} */
export const GOAL_TYPES = [
  {
    id: 'house',
    label: '독립자금',
    description: '전세/매매 자금을 위한 목표',
    icon: 'home',
    apiType: 'INDEPENDENCE',
  },
  {
    id: 'emergency',
    label: '비상금/목돈',
    description: '예기치 못한 지출 대비 목표',
    icon: 'umbrella',
    apiType: 'EMERGENCY',
  },
  {
    id: 'wedding',
    label: '결혼자금',
    description: '결혼 준비를 위한 목표',
    icon: 'ring',
    apiType: 'WEDDING',
  },
  {
    id: 'loan',
    label: '학자금 대출',
    description: '학자금 상환을 위한 목표',
    icon: 'cap',
    apiType: 'LOAN',
  },
]
