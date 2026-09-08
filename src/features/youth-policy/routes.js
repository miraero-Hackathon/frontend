// youth-policy 도메인 라우트
import { ROUTE_NAMES } from '@/shared/constants/routes'

export const youthPolicyRoutes = [
  {
    path: '/youth-policy',
    name: ROUTE_NAMES.YOUTH_POLICY,
    component: () => import('@/pages/youth-policy/YouthPolicyPage.vue'),
  },
]
