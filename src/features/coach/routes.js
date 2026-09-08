// coach 도메인 라우트 (COACH-01)
import { ROUTE_NAMES } from '@/shared/constants/routes'

export const coachRoutes = [
  {
    path: '/coach',
    name: ROUTE_NAMES.COACH,
    component: () => import('@/pages/coach/CoachPage.vue'),
    meta: {
      title: 'AI 목표 코치',
      fixedHeight: true,
      hideFooter: true,
      hideBottomNav: true,
      showClose: true,
      pageTransition: 'fade-smooth',
    },
  },
]
