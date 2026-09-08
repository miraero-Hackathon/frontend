import { ref, watch, onMounted, onUnmounted } from 'vue'

/**
 * 숫자가 0(또는 이전 값)에서 목표 값까지 부드럽게 카운트업되는 Vue Composable
 * @param {import('vue').Ref<number>} targetRef 목표 숫자 ref
 * @param {Object} options
 * @param {number} [options.duration=1000] 애니메이션 지속 시간 (ms)
 * @param {number} [options.decimals=0] 소수점 자릿수
 * @param {number} [options.initialValue=0] 시작 숫자
 */
export function useCountUp(targetRef, options = {}) {
  const { duration = 1000, decimals = 0, initialValue = 0 } = options

  const displayValue = ref(initialValue)
  let animationFrameId = null
  let startTime = null
  let startValue = initialValue

  // 감속 이징 (처음엔 빠르게, 끝에선 아주 부드럽게 안착)
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  }

  function animate(timestamp) {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime
    const progress = Math.min(1, elapsed / duration)
    const easedProgress = easeOutExpo(progress)

    const target = Number(targetRef.value ?? 0)
    const current = startValue + (target - startValue) * easedProgress

    displayValue.value = Number(current.toFixed(decimals))

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      displayValue.value = target
    }
  }

  function startAnimation() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    startTime = null
    startValue = displayValue.value
    animationFrameId = requestAnimationFrame(animate)
  }

  watch(
    () => targetRef.value,
    (newVal) => {
      if (newVal !== undefined && newVal !== null) {
        startAnimation()
      }
    }
  )

  onMounted(() => {
    startAnimation()
  })

  onUnmounted(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
  })

  return {
    displayValue,
  }
}
