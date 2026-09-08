import { ref, onMounted } from 'vue'

/**
 * 페이스메이커 전용 브라우저 시스템 알림(Notification API) Composable
 */
export function usePacemakerNotification() {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window
  const permission = ref(isSupported ? Notification.permission : 'denied')

  /**
   * 1. 브라우저 알림 권한 요청 (onMounted 등에서 호출)
   * @returns {Promise<NotificationPermission>}
   */
  const requestPermission = async () => {
    if (!isSupported) {
      console.warn('이 브라우저는 Notification API를 지원하지 않습니다.')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      permission.value = 'granted'
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission()
      permission.value = result
      return result
    }

    permission.value = Notification.permission
    return permission.value
  }

  /**
   * 2. 시스템 알림 전송 (알림 클릭 시 window.focus 포함)
   * @param {string} title - 알림 제목
   * @param {NotificationOptions & { onClick?: (e: Event) => void }} options
   * @returns {Notification | null}
   */
  const sendNotification = (title, options = {}) => {
    if (!isSupported) return null
    if (permission.value !== 'granted' && Notification.permission !== 'granted') {
      console.warn('알림 권한이 허용되지 않았습니다.')
      return null
    }

    const { body = '', icon, tag, onClick, ...otherOptions } = options

    // tag가 같으면 브라우저가 동일 알림으로 인식해 재팝업을 막으므로 고유 타임스탬프를 부여
    const uniqueTag = tag ? `${tag}-${Date.now()}` : `pacemaker-notification-${Date.now()}`

    const notification = new Notification(title, {
      body,
      icon,
      tag: uniqueTag,
      requireInteraction: false,
      ...otherOptions,
    })

    // 클릭 시 창 활성화(window.focus) 및 콜백 수행
    notification.onclick = (event) => {
      event.preventDefault()
      if (typeof window !== 'undefined') {
        window.focus()
      }

      if (typeof onClick === 'function') {
        onClick(event)
      }
      notification.close()
    }

    return notification
  }

  onMounted(() => {
    if (isSupported) {
      permission.value = Notification.permission
    }
  })

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
  }
}
