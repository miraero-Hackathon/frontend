<template>
  <Teleport to="body">
    <Transition name="mypage-modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-[#0a192f]/45 p-4 backdrop-blur-[6px]"
        @mousedown.self="handleBackdropClick"
      >
        <section
          ref="dialog"
          class="flex max-h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.18)]"
          :class="maxWidthClass"
          :role="role"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId || undefined"
          tabindex="-1"
          @keydown="handleKeydown"
        >
          <div
            v-if="showHeader"
            class="flex items-center justify-between border-b border-slate-100 px-7 pb-4 pt-5"
          >
            <slot name="heading">
              <h2 :id="titleId" class="text-base font-bold text-[#0a192f]">{{ title }}</h2>
            </slot>
            <button
              type="button"
              class="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f8fbff]"
              aria-label="닫기"
              @click="requestClose"
            >
              <img src="@/assets/icons/modal-close.svg" alt="" class="size-[15px]" />
            </button>
          </div>
          <slot />
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  titleId: { type: String, required: true },
  descriptionId: { type: String, default: '' },
  maxWidthClass: { type: String, default: 'max-w-md' },
  role: { type: String, default: 'dialog' },
  showHeader: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true },
  closeDisabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const dialog = ref(null)
let previouslyFocusedElement = null
let previousBodyOverflow = ''

const focusableSelector = [
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function requestClose() {
  if (!props.closeDisabled) emit('update:modelValue', false)
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) requestClose()
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    requestClose()
    return
  }
  if (event.key !== 'Tab') return

  const focusableElements = [...(dialog.value?.querySelectorAll(focusableSelector) ?? [])]
  if (focusableElements.length === 0) {
    event.preventDefault()
    dialog.value?.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements.at(-1)
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      previouslyFocusedElement = document.activeElement
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      await nextTick()
      const autofocusElement = dialog.value?.querySelector('[autofocus]')
      const firstFocusableElement = dialog.value?.querySelector(focusableSelector)
      ;(autofocusElement || firstFocusableElement || dialog.value)?.focus()
      return
    }

    document.body.style.overflow = previousBodyOverflow
    await nextTick()
    previouslyFocusedElement?.focus?.()
    previouslyFocusedElement = null
  }
)

// 닫혀 있던 모달까지 body 스타일과 포커스를 되돌리면 다른 모달의 상태를 덮어쓴다.
onBeforeUnmount(() => {
  if (!props.modelValue) return

  document.body.style.overflow = previousBodyOverflow
  previouslyFocusedElement?.focus?.()
})
</script>

<style scoped>
.mypage-modal-enter-active,
.mypage-modal-leave-active {
  transition: opacity 180ms ease;
}

.mypage-modal-enter-active section,
.mypage-modal-leave-active section {
  transition:
    opacity 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mypage-modal-enter-from,
.mypage-modal-leave-to,
.mypage-modal-enter-from section,
.mypage-modal-leave-to section {
  opacity: 0;
}

.mypage-modal-enter-from section,
.mypage-modal-leave-to section {
  transform: translateY(16px) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .mypage-modal-enter-active,
  .mypage-modal-leave-active,
  .mypage-modal-enter-active section,
  .mypage-modal-leave-active section {
    transition-duration: 0.01ms;
  }
}
</style>
