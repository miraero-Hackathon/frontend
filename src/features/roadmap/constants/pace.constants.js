// 목표 진행 페이스(AHEAD/ON_TRACK/BEHIND)에 따른 배너 색상, 아이콘, 문구 단일 소스
import paceAheadIcon from '@/assets/icons/pace-status-ahead.svg'
import paceBehindIcon from '@/assets/icons/pace-status-behind.svg'
import ctaAheadIcon from '@/assets/icons/pace-cta-ahead.svg'
import ctaBehindIcon from '@/assets/icons/pace-cta-behind.svg'

const AHEAD_THEME = {
  icon: paceAheadIcon,
  ctaIcon: ctaAheadIcon,
  title: '현재 페이스가 순조로워요 · 이대로 유지해 주세요',
  subtitle: (pace) => `예정보다 ${formatManwon(pace.differenceAmount)}원 앞서고 있어요`,
  ctaLines: ['페이스메이커가', '알아서 모아줄게요'],
  ctaAction: '다음달 자금마련 →',
  cardBorder: '#c5dcff',
  cardGradient: 'linear-gradient(167deg, rgb(234,242,255) 7.7%, rgb(244,248,255) 92.3%)',
  iconBg: '#0066FF',
  badgeBg: 'rgba(0,102,255,0.07)',
  badgeBorder: 'rgba(0,102,255,0.16)',
  badgeText: '#0066FF',
  ctaGradient: 'linear-gradient(135deg, rgb(0,102,255) 0%, rgb(102,178,255) 100%)',
  ctaShadow: 'rgba(0,102,255,0.3)',
}

const BEHIND_THEME = {
  icon: paceBehindIcon,
  ctaIcon: ctaBehindIcon,
  title: '이번 달 지출이 늘어 페이스 조정이 필요해요',
  subtitle: () => '이번 달 지출이 평소보다 증가했어요. 잠시 페이스를 점검해 보세요.',
  ctaLines: ['페이스메이커가', '도와줄게요'],
  ctaAction: '대응전략 보기 →',
  cardBorder: '#fbcfe8',
  cardGradient: 'linear-gradient(167deg, rgb(255,240,249) 7.7%, rgb(253,242,248) 92.3%)',
  iconBg: '#f472b6',
  badgeBg: '#fff0f9',
  badgeBorder: '#fbcfe8',
  badgeText: '#be185d',
  ctaGradient: 'linear-gradient(145deg, rgb(244,114,182) 0%, rgb(251,207,232) 100%)',
  ctaShadow: 'rgba(244,114,182,0.35)',
}

// TODO: Figma에 ON_TRACK 목업이 아직 없어 AHEAD 테마를 임시로 재사용 — 디자인 확정되면 교체
const ON_TRACK_THEME = {
  ...AHEAD_THEME,
  title: '현재 페이스가 예정과 딱 맞아요 · 이대로 진행해요',
  subtitle: () => '예정된 페이스대로 잘 진행되고 있어요',
}

export const PACE_THEME = {
  AHEAD: AHEAD_THEME,
  ON_TRACK: ON_TRACK_THEME,
  BEHIND: BEHIND_THEME,
}

function formatManwon(amount) {
  return Math.round(Math.abs(amount) / 10000).toLocaleString()
}
