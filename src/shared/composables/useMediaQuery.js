// 미디어 쿼리 매칭 여부를 반응형으로 추적하는 composable
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * @param {string} query 예: '(min-width: 1024px)'
 * @returns {import('vue').Ref<boolean>}
 */
export function useMediaQuery(query) {
  const mediaQueryList = window.matchMedia(query)
  const matches = ref(mediaQueryList.matches)

  function handleChange(event) {
    matches.value = event.matches
  }

  onMounted(() => mediaQueryList.addEventListener('change', handleChange))
  onBeforeUnmount(() => mediaQueryList.removeEventListener('change', handleChange))

  return matches
}
