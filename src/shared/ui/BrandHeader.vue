<!-- 로고 + 서비스명 (온보딩·auth·goal 등 여러 화면 헤더 좌측에서 공통 사용) — 클릭 시 첫 화면으로 이동 -->
<template>
  <RouterLink :to="{ name: ROUTE_NAMES.ONBOARDING }" class="flex items-center gap-3">
    <div class="flex size-9 items-center justify-center rounded-[16px] bg-primary">
      <img src="@/assets/icons/logo.svg" alt="미래로" class="size-5" />
    </div>
    <span class="text-xl font-bold tracking-tight text-[#0a192f]">미래로</span>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ROUTE_NAMES } from '@/shared/constants/routes'
</script>
