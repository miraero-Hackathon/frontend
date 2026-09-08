<!-- 공용 모달 컴포넌트: 데스크톱에선 중앙 팝업, 모바일에선 하단 바텀 시트(Bottom Sheet) 형태 전환 -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        @mousedown.self="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition duration-300 cubic-bezier(0.16, 1, 0.3, 1)"
          enter-from-class="translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
          enter-to-class="translate-y-0 sm:scale-100 sm:opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="translate-y-0 sm:scale-100 sm:opacity-100"
          leave-to-class="translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
          appear
        >
          <div
            class="relative w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl pb-[env(safe-area-inset-bottom)] sm:pb-0"
            :class="hideDefaultClose ? '' : 'p-6'"
          >
            <!-- 모바일 상단 손잡이 바 (상단 오버레이로 헤더 여백 침범 방지) -->
            <div class="pointer-events-none absolute inset-x-0 top-2.5 z-20 mx-auto h-1 w-10 shrink-0 rounded-full bg-slate-300/80 sm:hidden" />

            <slot />
            <button
              v-if="!hideDefaultClose"
              type="button"
              class="mt-4 w-full rounded-xl py-2.5 text-center text-sm font-bold text-slate-500 hover:bg-slate-100 transition"
              @click="$emit('update:modelValue', false)"
            >
              닫기
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  hideDefaultClose: { type: Boolean, default: false },
  closeOnBackdrop: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    emit('update:modelValue', false)
  }
}
</script>
