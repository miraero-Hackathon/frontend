// goal 도메인 라우트 (GOAL-01~05)
import { ROUTE_NAMES } from '@/shared/constants/routes'

export const goalRoutes = [
  {
    path: '/goal/select',
    name: ROUTE_NAMES.GOAL_SELECT,
    component: () => import('@/pages/goal/GoalSelectPage.vue'),
  },
  {
    path: '/goal/detail',
    name: ROUTE_NAMES.GOAL_DETAIL,
    component: () => import('@/pages/goal/GoalDetailPage.vue'),
  },
  {
    path: '/goal/feasibility',
    name: ROUTE_NAMES.GOAL_FEASIBILITY,
    component: () => import('@/pages/goal/FeasibilityPage.vue'),
  },
  {
    path: '/goal/account',
    name: ROUTE_NAMES.GOAL_ACCOUNT,
    component: () => import('@/pages/goal/AccountLinkPage.vue'),
  },
]
