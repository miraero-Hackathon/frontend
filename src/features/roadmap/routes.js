// roadmap 도메인 라우트: 로드맵 대시보드 (DASH-01~09)
import { ROUTE_NAMES } from '@/shared/constants/routes'

export const roadmapRoutes = [
  {
    path: '/dashboard',
    name: ROUTE_NAMES.DASHBOARD,
    component: () => import('@/pages/dashboard/DashboardPage.vue'),
  },
  {
    path: '/dashboard/:goalId',
    name: ROUTE_NAMES.DASHBOARD_GOAL,
    component: () => import('@/pages/dashboard/DashboardPage.vue'),
    props: true,
  },
]
