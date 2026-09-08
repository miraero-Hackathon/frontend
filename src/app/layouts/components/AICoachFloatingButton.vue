<template>
  <RouterLink
    v-if="route.name !== ROUTE_NAMES.COACH"
    :to="{ name: ROUTE_NAMES.COACH }"
    class="group fixed bottom-[calc(86px+env(safe-area-inset-bottom))] right-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_28px_rgba(0,102,255,0.35)] ring-4 ring-white/90 transition duration-200 hover:-translate-y-0.5 hover:bg-[#005ce6] hover:shadow-[0_14px_32px_rgba(0,102,255,0.4)] focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-primary/20 active:translate-y-0 active:scale-95 sm:right-6 md:bottom-6 md:right-8 md:size-16"
    aria-label="AI 코치 열기"
    :aria-current="route.name === ROUTE_NAMES.COACH ? 'page' : undefined"
  >
    <AppIcon name="message" size="xl" :stroke-width="1.8" class="text-white" />
    <span
      class="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-xl bg-[#0a192f] px-3 py-2 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 md:block"
      aria-hidden="true"
    >
      AI 코치
    </span>
  </RouterLink>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import AppIcon from '@/shared/ui/AppIcon.vue'

const route = useRoute()
</script>
