// goalType(백엔드 enum)별 표시 이모지
export const GOAL_TYPE_ICON = {
  INDEPENDENCE: '🏠',
  EMERGENCY: '☂️',
  WEDDING: '💍',
  LOAN: '🎓',
}

// 서버가 currentStreak/weeklyStreak/monthlySuccessCount를 null로 줄 때 저축 내역(histories)으로
// 클라이언트가 대신 계산하는 폴백이 있다. 실제로 있을 법한 긴 연속 기록까지 커버하도록
// 달력 한 달치보다 넉넉하게 잡는다. 이 값을 쓰는 모든 곳이 같은 크기를 요청해야
// (페이지를 옮겨다녀도) history 목록이 줄어들었다 늘었다 하지 않는다.
export const PACEMAKER_HISTORY_PAGE_SIZE = 100
