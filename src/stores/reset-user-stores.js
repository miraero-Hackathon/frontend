import { getActivePinia } from 'pinia'
import { resetPacemakerToastState } from '@/features/pacemaker/composables/pacemakerToast.state'

// 로그아웃 절차 자체를 수행하는 Store만 보존하고, 나머지는 모두 초기화한다.
// 진행 중인 Store를 폐기하면 자기 자신을 무효화하게 되므로 이 둘은 제외해야 한다.
// 목록을 반대로(초기화 대상 나열) 관리하면 새 Store를 추가할 때 등록을 빠뜨리기 쉽고,
// 그 결과가 "이전 사용자 데이터 노출"이라 실패 비용이 크다.
export const PRESERVED_STORE_IDS = Object.freeze(['auth', 'feature-auth'])

/**
 * 현재 세션에서 생성된 사용자별 Store를 초기화하고 폐기한다.
 * 폐기까지 수행해 로그아웃 직전 요청의 늦은 응답이 다음 사용자의 새 Store를 덮지 못하게 한다.
 * Pinia 밖에서 사용자별 데이터를 들고 있는 모듈 상태도 함께 비운다.
 *
 * 주의: 폐기된 Store 인스턴스는 되살아나지 않는다. 언마운트되지 않는 컴포넌트(App.vue 등)나
 * composable이 setup 시점에 Store를 캡처해두면 재로그인 후에도 죽은 인스턴스를 참조하게 되므로,
 * Store는 사용하는 함수 안에서 그때그때 가져와야 한다.
 *
 * @param {import('pinia').Pinia | undefined} pinia
 */
export function resetUserStores(pinia = getActivePinia()) {
  // Store가 없는 환경에서도 알림 히스토리는 남지 않도록 Pinia 확인보다 먼저 처리한다.
  resetPacemakerToastState()

  if (!pinia) return

  // $dispose가 순회 중인 Map을 변경하므로 id를 먼저 복사한다.
  const storeIds = Array.from(pinia._s.keys())

  storeIds.forEach((storeId) => {
    if (PRESERVED_STORE_IDS.includes(storeId)) return

    const store = pinia._s.get(storeId)
    if (!store) return

    try {
      store.$reset()
    } catch (error) {
      // 한 Store의 초기화 실패가 인증 정보 삭제를 막지 않도록 나머지 Store도 계속 정리한다.
      // setup store는 $reset을 직접 구현해야 하며, 없으면 여기서 걸린다.
      console.error(`Store 초기화 실패 (${storeId}):`, error)
    } finally {
      store.$dispose()
      delete pinia.state.value[storeId]
    }
  })
}
