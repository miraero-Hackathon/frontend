// 모달 열림/닫힘 상태 관리 composable 샘플
import { ref } from 'vue'

export function useModal(initialValue = false) {
  const isOpen = ref(initialValue)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  return { isOpen, open, close, toggle }
}
