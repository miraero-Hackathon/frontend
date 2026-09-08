<template>
  <!-- 모바일/태블릿 오버레이 배경 -->
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-if="uiStore.sidebarOpen"
      type="button"
      class="fixed inset-0 z-40 bg-[#0a192f]/35 backdrop-blur-[2px] lg:hidden"
      aria-label="메뉴 닫기"
      @click="closeSidebar"
    />
  </Transition>

  <!-- 사이드바 드로어 -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <aside
      v-if="uiStore.sidebarOpen"
      class="fixed inset-y-0 left-0 z-50 flex w-[min(84vw,320px)] flex-col overflow-hidden rounded-r-[28px] border-r border-slate-200 bg-[#f8fafc] shadow-none lg:hidden"
      aria-label="사이드바 메뉴"
    >
      <header class="flex items-center justify-between bg-white px-6 pb-5 pt-6">
        <RouterLink :to="{ name: ROUTE_NAMES.DASHBOARD }" class="flex items-center gap-3" @click="closeSidebar">
          <span class="flex size-10 items-center justify-center rounded-2xl bg-primary shadow-[0_6px_16px_rgba(0,102,255,0.24)]">
            <img src="@/assets/icons/logo.svg" alt="" class="size-5" />
          </span>
          <span>
            <strong class="block text-lg font-bold tracking-tight text-[#0a192f]">미래로</strong>
            <small class="block text-[11px] font-bold text-emerald-600">마이데이터 연동됨</small>
          </span>
        </RouterLink>
        <button type="button" class="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 cursor-pointer" aria-label="메뉴 닫기" @click="closeSidebar">
          <svg viewBox="0 0 24 24" fill="none" class="size-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <section class="rounded-[24px] border border-[#dbe9ff] bg-white p-3 shadow-[0_8px_24px_rgba(15,35,70,0.06)]">
          <button type="button" class="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left cursor-pointer" @click="isRoadmapListExpanded = !isRoadmapListExpanded">
            <span class="flex size-9 items-center justify-center rounded-xl bg-[#eaf2ff]"><img :src="roadmapNav.icon" alt="" class="size-[18px]" /></span>
            <span class="min-w-0 flex-1">
              <strong class="block text-sm font-bold text-[#0a192f]">나의 홈</strong>
              <small class="block truncate text-[11px] text-slate-400">목표를 선택해 진행 상황을 확인하세요</small>
            </span>
            <img src="@/assets/icons/chevron-down.svg" alt="" class="size-4 transition-transform" :class="isRoadmapListExpanded ? 'rotate-180' : ''" />
          </button>

          <div v-if="isRoadmapListExpanded" class="mt-2 space-y-1 border-t border-slate-100 pt-2">
            <RouterLink
              v-for="goal in goalStore.goals" :key="goal.goalId"
              :to="{ name: ROUTE_NAMES.DASHBOARD_GOAL, params: { goalId: goal.goalId } }"
              class="block rounded-2xl px-3 py-2.5 transition"
              :class="isSelectedGoal(goal) ? 'bg-[#eaf2ff]' : 'hover:bg-slate-50'"
              @click="closeSidebar"
            >
              <div class="flex items-center gap-2">
                <span class="size-2 rounded-full" :class="isSelectedGoal(goal) ? 'bg-primary' : 'bg-slate-300'" />
                <span class="min-w-0 flex-1 truncate text-xs font-bold" :class="isSelectedGoal(goal) ? 'text-primary' : 'text-slate-600'">{{ goal.goalName }}</span>
                <span class="text-xs font-bold" :class="isSelectedGoal(goal) ? 'text-primary' : 'text-slate-400'">{{ goal.progressRate }}%</span>
              </div>
              <div class="ml-4 mt-2 h-1 overflow-hidden rounded-full bg-slate-200"><div class="h-full rounded-full bg-primary" :style="{ width: `${Math.min(100, Math.max(0, goal.progressRate))}%` }" /></div>
            </RouterLink>
            <RouterLink :to="{ name: ROUTE_NAMES.GOAL_SELECT, query: { from: 'dashboard' } }" class="mt-2 flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[#b9d3ff] py-2.5 text-xs font-bold text-primary transition hover:bg-[#f4f8ff]" @click="closeSidebar">
              <span class="text-base">＋</span> 새 로드맵 만들기
            </RouterLink>
          </div>
        </section>

        <nav class="mt-5 grid grid-cols-2 gap-2" aria-label="전체 서비스">
          <RouterLink
            v-for="item in serviceItems" :key="item.routeName" :to="{ name: item.routeName }"
            class="flex items-center gap-3 rounded-[18px] border px-3 py-3.5 transition"
            :class="isActive(item.routeName) ? 'border-primary/15 bg-[#eaf2ff] text-primary' : 'border-transparent bg-white text-slate-500 hover:border-slate-200'"
            @click="closeSidebar"
          >
            <img :src="item.icon" alt="" class="size-[18px] shrink-0" :class="isActive(item.routeName) ? '' : 'opacity-65'" />
            <span class="truncate text-xs font-bold">{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>

      <RouterLink :to="{ name: ROUTE_NAMES.MYPAGE }" class="m-4 flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition hover:bg-slate-50" @click="closeSidebar">
        <span class="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#66b2ff] text-sm font-bold text-white">{{ userInitial }}</span>
        <span class="min-w-0 flex-1"><strong class="block truncate text-sm font-bold text-[#0a192f]">{{ userName || '사용자' }}</strong><small class="block text-[11px] text-slate-400">내 정보와 설정</small></span>
        <span class="text-slate-300">›</span>
      </RouterLink>
    </aside>
  </Transition>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { useGoalStore } from '@/features/goal'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { NAV_ITEMS } from '@/shared/constants/navigation'

const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()
const goalStore = useGoalStore()
const isRoadmapListExpanded = ref(true)
const userName = computed(() => authStore.user?.name ?? '')
const userInitial = computed(() => userName.value.charAt(0) || '미')
const activeRouteName = computed(() => route.meta.navRouteName ?? route.name)
const isActive = (routeName) => activeRouteName.value === routeName
const isSelectedGoal = (goal) => String(goal.goalId) === String(goalStore.selectedGoalId)
const closeSidebar = () => { uiStore.sidebarOpen = false }
const roadmapNav = NAV_ITEMS.find((item) => item.routeName === ROUTE_NAMES.DASHBOARD)
const serviceItems = NAV_ITEMS.filter((item) => item.routeName !== ROUTE_NAMES.DASHBOARD && item.routeName !== ROUTE_NAMES.MYPAGE)
onMounted(() => goalStore.fetchGoals())
</script>
