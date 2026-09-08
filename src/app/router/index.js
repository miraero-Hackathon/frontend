// 라우터 생성 + 인증 네비게이션 가드
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/app/router/routes'
import { useAuthStore } from '@/stores/auth.store'
import { AUTH_UNAUTHORIZED_EVENT, ROUTE_NAMES } from '@/shared/constants/routes'

const PUBLIC_ROUTE_NAMES = new Set([ROUTE_NAMES.ONBOARDING, ROUTE_NAMES.LOGIN, ROUTE_NAMES.SIGNUP])

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 목표 선택에서 구체화 화면으로 진입할 때는 이전 화면의 스크롤 위치를 이어받지 않는다.
    if (from.name === ROUTE_NAMES.GOAL_SELECT && to.name === ROUTE_NAMES.GOAL_DETAIL) {
      return { left: 0, top: 0 }
    }

    return savedPosition ?? { left: 0, top: 0 }
  },
})

if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, () => {
    if (router.currentRoute.value.name !== ROUTE_NAMES.LOGIN) {
      router.replace({ name: ROUTE_NAMES.LOGIN })
    }
  })
}

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (!PUBLIC_ROUTE_NAMES.has(to.name) && !authStore.accessToken) {
    return { name: ROUTE_NAMES.LOGIN }
  }

  return true
})
