<!-- 공용 로딩 스피너: API 응답을 기다리는 동안 화면 대신 보여줌 -->
<template>
  <div
    class="flex flex-col items-center justify-center gap-3.5 py-16 text-center select-none"
    :class="containerClass"
    role="status"
    aria-live="polite"
  >
    <div class="relative flex items-center justify-center" :class="sizeConfig.box">
      <!-- 배경 트랙 원 -->
      <div class="absolute inset-0 rounded-full border-[3.5px] border-primary/10" />
      <!-- 회전하는 인디케이터 -->
      <div
        class="absolute inset-0 animate-spin rounded-full border-[3.5px] border-transparent border-t-primary"
      />
    </div>

    <div class="flex flex-col gap-1 max-w-xs px-4">
      <p class="text-sm font-bold text-[#0a192f]">{{ message }}</p>
      <p v-if="subMessage" class="text-xs font-medium text-slate-400">{{ subMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: String, default: '화면을 불러오는 중이에요' },
  subMessage: { type: String, default: '' },
  size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
  containerClass: { type: String, default: '' },
})

const sizeConfig = computed(() => {
  switch (props.size) {
    case 'sm':
      return { box: 'size-7' }
    case 'lg':
      return { box: 'size-12' }
    case 'md':
    default:
      return { box: 'size-10' }
  }
})
</script>
