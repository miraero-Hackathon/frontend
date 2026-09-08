// pacemaker 도메인 라우트
import { ROUTE_NAMES } from '@/shared/constants/routes'

export const pacemakerRoutes = [
  {
    path: '/pacemaker',
    name: ROUTE_NAMES.PACEMAKER,
    component: () => import('@/pages/pacemaker/PacemakerPage.vue'),
  },
  {
    path: '/pacemaker/setup',
    name: ROUTE_NAMES.PACEMAKER_SETUP,
    component: () => import('@/pages/pacemaker/PacemakerSetupPage.vue'),
    meta: {
      navRouteName: ROUTE_NAMES.PACEMAKER,
      pageTitle: '페이스메이커 설정',
      hideHeader: true,
      hideBottomNav: true,
      hideFooter: true,
      fixedHeight: true,
    },
  },
]
