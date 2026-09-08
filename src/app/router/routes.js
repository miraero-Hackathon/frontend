// 각 feature 라우트 배열을 레이아웃 기준으로 합침
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { authRoutes } from '@/features/auth'
import { goalRoutes } from '@/features/goal'
import { roadmapRoutes } from '@/features/roadmap'
import { spendingRoutes } from '@/features/spending'
import { productsRoutes } from '@/features/products'
import { coachRoutes } from '@/features/coach'
import { collectionRoutes } from '@/features/collection'
import { mypageRoutes } from '@/features/mypage'
import { pacemakerRoutes } from '@/features/pacemaker'
import { youthPolicyRoutes } from '@/features/youth-policy'
import { creditRoutes } from '@/features/credit'

export const routes = [
  {
    path: '/',
    component: () => import('@/app/layouts/OnboardingLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.ONBOARDING,
        component: () => import('@/pages/onboarding/OnboardingPage.vue'),
      },
      ...authRoutes,
      ...goalRoutes,
    ],
  },
  {
    path: '/',
    component: () => import('@/app/layouts/DashboardLayout.vue'),
    children: [
      ...roadmapRoutes,
      ...pacemakerRoutes,
      ...collectionRoutes,
      ...spendingRoutes,
      ...productsRoutes,
      ...creditRoutes,
      ...youthPolicyRoutes,
      ...coachRoutes,
      ...mypageRoutes,
      {
        path: 'menu',
        name: ROUTE_NAMES.MENU,
        component: () => import('@/pages/menu/MenuPage.vue'),
        meta: { title: '전체 메뉴' },
      },
    ],
  },
]
