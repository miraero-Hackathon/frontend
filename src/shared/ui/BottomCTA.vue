<!-- 목표설정 퍼널(GOAL-01~04) 공통 하단 고정 CTA 버튼: 내부적으로 BaseButton 재사용 -->
<template>
  <div
    class="inset-x-0 bottom-0 z-30 flex flex-col items-center px-4 pb-6 pointer-events-none"
    :class="desktopStatic ? 'fixed md:static md:px-0 md:pb-12 md:mt-8' : 'fixed'"
  >
    <p
      v-if="caption"
      class="pointer-events-auto mb-2 text-center text-xs font-medium text-gray-400 transition-opacity"
    >
      {{ caption }}
    </p>

    <div class="pointer-events-auto w-full max-w-[618px] animate-fade-in [animation-delay:400ms]">
      <BaseButton
        full-width
        :size="size"
        :disabled="disabled"
        class="shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/35 active:scale-[0.99] disabled:shadow-none"
        @click="emit('click', $event)"
      >
        <span class="inline-flex items-center justify-center gap-1.5 font-bold tracking-tight">
          <span>{{ label }}</span>
          <span aria-hidden="true" class="text-lg">›</span>
        </span>
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/shared/ui/BaseButton.vue'

defineProps({
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  caption: { type: String, default: '' },
  size: { type: String, default: 'lg' },
  desktopStatic: { type: Boolean, default: false },
})
const emit = defineEmits(['click'])
</script>
