// spending 도메인 라우트 (EXP-01~04)
import { ROUTE_NAMES } from '@/shared/constants/routes'

export const creditRoutes = [
  {
    path: '/credit',
    name: ROUTE_NAMES.CREDIT,
    component: () => import('@/pages/credit/CreditPage.vue'),
  },
]
