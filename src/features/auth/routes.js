// auth 도메인 라우트 (AUTH-01~03)
import { ROUTE_NAMES } from '@/shared/constants/routes'

export const authRoutes = [
  {
    path: '/login',
    name: ROUTE_NAMES.LOGIN,
    component: () => import('@/pages/auth/LoginPage.vue'),
  },
  {
    path: '/signup',
    name: ROUTE_NAMES.SIGNUP,
    component: () => import('@/pages/auth/SignupPage.vue'),
  },
  {
    path: '/mydata',
    name: ROUTE_NAMES.MYDATA_LOADING,
    component: () => import('@/pages/auth/MyDataLoadingPage.vue'),
  },
]
