// spending 도메인 라우트 (EXP-01~04)
import { ROUTE_NAMES } from '@/shared/constants/routes'

export const spendingRoutes = [
  {
    path: '/spending',
    name: ROUTE_NAMES.SPENDING,
    component: () => import('@/pages/spending/SpendingPage.vue'),
  },
]
