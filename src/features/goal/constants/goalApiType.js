// 목표 프리셋 ID(GOAL_PRESET_IDS) → 목표생성 API의 goalType enum 매핑
import { GOAL_PRESET_IDS } from '@/features/goal/constants/goal.constants.js'

/** @type {Record<string, 'INDEPENDENCE' | 'EMERGENCY' | 'WEDDING' | 'LOAN'>} */
export const GOAL_API_TYPE_BY_PRESET_ID = {
  [GOAL_PRESET_IDS.INDEPENDENCE]: 'INDEPENDENCE',
  [GOAL_PRESET_IDS.EMERGENCY]: 'EMERGENCY',
  [GOAL_PRESET_IDS.MARRIAGE]: 'WEDDING',
  [GOAL_PRESET_IDS.STUDENT_LOAN]: 'LOAN',
}
