<!-- 공용 브랜드 + 단계형 네비게이션 헤더 -->
<template>
  <header
    class="sticky top-0 z-20 w-full py-5 transition-all duration-300"
    :class="[
      isScrolled
        ? 'border-b border-blue-100/60 bg-[#f8fbff]/85 backdrop-blur-md shadow-xs'
        : 'border-b border-transparent bg-transparent shadow-none',
    ]"
  >
    <div
      class="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 md:px-8 lg:px-[80px]"
    >
      <!-- 좌측: 뒤로가기 버튼 + 브랜드 로고 -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <button
          v-if="showBack"
          type="button"
          class="group flex size-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-blue-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          :aria-label="backLabel || '이전으로 가기'"
          :title="backLabel || '이전'"
          @click="emit('back')"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            class="size-5 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <BrandHeader v-if="showBrand" />
      </div>

      <!-- 우측: 네비게이션 또는 커스텀 액션 슬롯 -->
      <div v-if="$slots.default" class="flex items-center">
        <slot />
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import BrandHeader from '@/shared/ui/BrandHeader.vue'

const props = defineProps({
  showBrand: { type: Boolean, default: true },
  showBack: { type: Boolean, default: true },
  backLabel: { type: String, default: '이전' },
  threshold: { type: Number, default: 20 },
})

const emit = defineEmits(['back'])

const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > props.threshold
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
