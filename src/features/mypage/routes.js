// mypage 도메인 라우트 (MY-01)
import { ROUTE_NAMES } from '@/shared/constants/routes'

export const mypageRoutes = [
  {
    path: '/mypage',
    name: ROUTE_NAMES.MYPAGE,
    component: () => import('@/pages/mypage/MyPage.vue'),
  },
]
