export const MYPAGE_NOTIFICATION_STORAGE_KEY = 'miraero:mypage-notifications'

export const MYPAGE_NOTIFICATION_ITEMS = Object.freeze([
  {
    id: 'monthlySave',
    label: '월 저축 달성 알림',
    description: '목표 저축액 달성 시 알림',
    defaultEnabled: true,
  },
  {
    id: 'milestone',
    label: '마일스톤 도달 알림',
    description: '로드맵 단계 완료 시 알림',
    defaultEnabled: true,
  },
])

export const DEFAULT_NOTIFICATION_SETTINGS = Object.freeze(
  Object.fromEntries(MYPAGE_NOTIFICATION_ITEMS.map((item) => [item.id, item.defaultEnabled]))
)

export const MYPAGE_POLICIES = Object.freeze({
  terms: {
    title: '서비스 이용약관',
    text: `1. 목적
본 약관은 미래로가 제공하는 목표 기반 자산관리 서비스의 이용 조건과 절차를 정합니다.

2. 서비스 제공
미래로는 마이데이터를 활용한 자산 현황, 목표 로드맵, 지출 분석 및 금융생활 참고 정보를 제공합니다.

3. 이용자의 책임
이용자는 정확한 정보를 제공하고 계정과 인증 정보를 안전하게 관리해야 합니다.

4. 정보의 성격
서비스에서 제공하는 정보는 자산관리 참고 자료이며, 금융상품의 가입이나 투자 성과를 보장하지 않습니다.

5. 이용 중단
점검, 장애 또는 관련 법령에 따라 서비스가 일시적으로 제한될 수 있습니다.`,
  },
  privacy: {
    title: '개인정보 처리방침',
    text: `1. 수집 항목
이메일 주소, 비밀번호(암호화 저장), 서비스 이용 기록, 접속 로그 및 기기 정보를 수집합니다.

2. 수집 목적
회원가입과 본인 확인, 로드맵 설계 서비스 제공, 서비스 개선과 통계 분석에 사용합니다.

3. 보유·이용 기간
회원 탈퇴 시까지 보유하며, 관련 법령에서 정한 기간이 지난 뒤 안전하게 파기합니다.

4. 마이데이터
연동된 자산·소득·지출 정보는 맞춤 로드맵과 지출 분석을 위해서만 사용합니다. 연동은 언제든 해제할 수 있습니다.

5. 이용자의 권리
이용자는 개인정보의 열람, 수정, 삭제 및 처리 정지를 요청할 수 있습니다.`,
  },
})
