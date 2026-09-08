<!-- 좌측 사이드바 + 헤더 + 컨텐츠 영역 레이아웃 -->
<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-[#f8fafc]">
    <DashboardHeader v-if="!route.meta.hideHeader" />
    <DashboardSidebar v-if="!route.meta.hideHeader" />
    <main
      class="flex-1 min-h-0 [scrollbar-gutter:stable]"
      :class="[
        route.meta.fixedHeight
          ? 'overflow-hidden flex flex-col'
          : 'overflow-y-auto max-md:pb-[calc(80px+env(safe-area-inset-bottom))]'
      ]"
    >
      <RouterView v-slot="{ Component, route: currentRoute }">
        <transition :name="currentRoute.meta.pageTransition || 'page-fade'" mode="out-in">
          <component :is="Component" :key="currentRoute.name || currentRoute.path" />
        </transition>
      </RouterView>
      <DashboardFooter v-if="!route.meta.hideHeader && !route.meta.hideFooter && !route.meta.fixedHeight" />
    </main>
    <DashboardBottomNav v-if="!route.meta.hideHeader && !route.meta.hideBottomNav" />
    <AICoachFloatingButton />
  </div>
</template>

<script setup>
import { useRoute, RouterView } from 'vue-router'
import DashboardHeader from '@/app/layouts/components/DashboardHeader.vue'
import DashboardSidebar from '@/app/layouts/components/DashboardSidebar.vue'
import DashboardBottomNav from '@/app/layouts/components/DashboardBottomNav.vue'
import AICoachFloatingButton from '@/app/layouts/components/AICoachFloatingButton.vue'
import DashboardFooter from '@/app/layouts/components/DashboardFooter.vue'

const route = useRoute()
</script>

<style scoped>
/* 일반 탭 전환 페이드 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.page-fade-leave-to {
  opacity: 0;
}

/* AI 코치 전용 애플 감성 '실크 페이드(Fade Smooth)' 트랜지션 (흔들림 제로) */
.fade-smooth-enter-active {
  transition: opacity 0.15s ease-out;
}

.fade-smooth-leave-active {
  transition: opacity 0.12s ease-in;
}

.fade-smooth-enter-from,
.fade-smooth-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-fade-enter-active,
  .page-fade-leave-active,
  .fade-smooth-enter-active,
  .fade-smooth-leave-active {
    transition: none;
  }
  .page-fade-enter-from,
  .page-fade-leave-to,
  .fade-smooth-enter-from,
  .fade-smooth-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
