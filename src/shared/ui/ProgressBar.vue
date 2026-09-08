<!-- 목표설정 퍼널(GOAL-01~03) 진행률 바: N/총 단계 -->
<template>
  <div class="flex items-center gap-3">
    <div class="h-1 flex-1 rounded-full bg-accent">
      <div
        class="h-1 rounded-full bg-primary transition-[width] duration-700 ease-out"
        :style="{ width: animatedPercent + '%' }"
      />
    </div>
    <span class="shrink-0 text-xs font-medium text-gray-400">{{ currentStep }}/{{ totalSteps }}</span>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  currentStep: { type: Number, required: true },
  totalSteps: { type: Number, default: 3 },
})

const progressPercent = computed(() => (props.currentStep / props.totalSteps) * 100)

// 진입 시 0%에서 실제 진행률까지 부드럽게 채워지도록, 마운트 이후 한 프레임 뒤에 목표값으로 전환
const animatedPercent = ref(0)
onMounted(() => {
  requestAnimationFrame(() => {
    animatedPercent.value = progressPercent.value
  })
})
</script>
