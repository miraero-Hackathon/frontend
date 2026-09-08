<template>
  <BaseModal
    :model-value="modelValue"
    hide-default-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <section
      class="px-6 pb-6 pt-7 sm:px-7 sm:pb-7"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spending-simulator-info-title"
      aria-describedby="spending-simulator-info-description"
    >
      <header class="flex items-start justify-between gap-4">
        <div>
          <h3 id="spending-simulator-info-title" class="text-lg font-bold text-[#0A192F]">
            절감 시뮬레이터란?
          </h3>
          <p id="spending-simulator-info-description" class="mt-2 text-sm leading-6 text-[#64748B]">
            카테고리별 지출을 조정해<br />
            목표 달성까지 얼마나 단축할 수 있는지<br />
            확인해보는 기능이에요
          </p>
        </div>

        <button
          type="button"
          class="flex size-8 shrink-0 items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F4F8FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]/30"
          aria-label="절감 시뮬레이터 설명 닫기"
          @click="close"
        >
          <img src="@/assets/icons/modal-close.svg" alt="" class="size-4" />
        </button>
      </header>

      <div
        class="mt-5 flex items-center gap-3 rounded-2xl border border-[#DCE9FF] bg-[#F4F8FF] px-4 py-3.5"
      >
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[#0066FF] shadow-[0_1px_4px_rgba(10,25,47,0.08)]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" fill="none" class="size-4">
            <circle cx="10" cy="10" r="7.5" stroke="currentColor" />
            <path d="M10 9v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            <circle cx="10" cy="6.5" r="1" fill="currentColor" />
          </svg>
        </span>
        <p class="text-xs font-semibold leading-5 text-[#475569]">
          기준 지출은 최근 3개월 평균 소비예요
        </p>
      </div>

      <button
        type="button"
        class="mt-6 w-full rounded-xl bg-primary py-3.5 text-center text-sm font-bold text-white shadow-[0_4px_14px_rgba(0,102,255,0.2)] transition hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]/30 focus-visible:ring-offset-2"
        @click="close"
      >
        확인
      </button>
    </section>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/shared/ui/BaseModal.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>
