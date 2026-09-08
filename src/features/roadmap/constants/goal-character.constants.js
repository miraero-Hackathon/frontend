// 목표 타입별 로드맵 주인공 캐릭터 + 페이스메이커(콜리) 캐릭터 단일 소스
import rabbitImage from '@/assets/images/rabbit_3d.png'
import lamaImage from '@/assets/images/lama_new.png'
import bearImage from '@/assets/images/bear_new.png'
import duckImage from '@/assets/images/duck_new.png'
import coliImage from '@/assets/images/coli_new.png'

export const GOAL_TYPE_CHARACTER = {
  INDEPENDENCE: duckImage,
  WEDDING: lamaImage,
  EMERGENCY: bearImage,
  LOAN: rabbitImage,
}

export const PACEMAKER_CHARACTER_IMAGE = coliImage

export function getGoalCharacterImage(goalType) {
  return GOAL_TYPE_CHARACTER[goalType] ?? rabbitImage
}
