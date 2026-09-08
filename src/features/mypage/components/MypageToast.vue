<template>
  <Teleport to="body">
    <Transition name="mypage-toast">
      <div
        v-if="message"
        class="fixed bottom-5 left-1/2 z-[200] flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] sm:bottom-8 sm:whitespace-nowrap"
        :class="variant === 'error' ? 'bg-red-700' : 'bg-[#0a192f]'"
        :role="variant === 'error' ? 'alert' : 'status'"
        :aria-live="variant === 'error' ? 'assertive' : 'polite'"
      >
        <span
          class="flex size-[17px] items-center justify-center rounded-full border border-white text-[10px]"
          aria-hidden="true"
          >{{ variant === 'error' ? '!' : '✓' }}</span
        >
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  message: { type: String, default: '' },
  variant: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error'].includes(value),
  },
})
</script>

<style scoped>
.mypage-toast-enter-active,
.mypage-toast-leave-active {
  transition:
    opacity 180ms ease,
    transform 220ms ease;
}

.mypage-toast-enter-from,
.mypage-toast-leave-to {
  transform: translate(-50%, 16px);
  opacity: 0;
}
</style>
