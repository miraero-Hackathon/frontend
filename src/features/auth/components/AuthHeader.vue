<!-- 로그인·회원가입 공통 상단바: 좌측 로고, 우측 뒤로가기 링크(대상/텍스트는 페이지별로 전달) -->
<template>
  <div
    class="sticky top-0 z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-5 backdrop-blur-md md:px-8 lg:px-[80px]"
  >
    <BrandHeader />
    <RouterLink
      :to="{ name: backTo }"
      class="flex items-center gap-1 py-3 text-sm text-gray-500 transition-colors hover:text-gray-900"
    >
      <span aria-hidden="true">←</span>
      <span>{{ backLabel }}</span>
    </RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import BrandHeader from '@/shared/ui/BrandHeader.vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'

defineProps({
  backTo: { type: String, default: ROUTE_NAMES.ONBOARDING },
  backLabel: { type: String, default: '처음으로' },
})
</script>
