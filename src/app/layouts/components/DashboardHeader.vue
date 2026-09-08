<template>
  <header
    class="z-30 shrink-0 border-b border-slate-200/80 bg-white/95 shadow-[0_2px_12px_rgba(15,35,70,0.04)] backdrop-blur-xl max-lg:border-b-0 max-lg:bg-[#f8fafc] max-lg:shadow-none"
  >
    <!-- 모바일/태블릿 헤더 (lg:hidden) -->
    <div class="page-container flex h-[72px] items-center justify-between gap-3 lg:hidden">
      <!-- 1. 뒤로가기 / 닫기 서브 헤더 (상세/서브 페이지 및 챗봇 세션) -->
      <div
        v-if="route.meta.showBack || route.meta.showBackButton || route.meta.showClose"
        class="flex items-center gap-1.5 min-w-0"
      >
        <button
          type="button"
          class="-ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 active:scale-95 cursor-pointer"
          :aria-label="route.meta.showClose ? '화면 닫기' : '이전 화면으로 이동'"
          @click="handleBackOrClose"
        >
          <!-- 닫기 (✕) 아이콘 -->
          <svg
            v-if="route.meta.showClose"
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <!-- 뒤로가기 (<) 화살표 아이콘 -->
          <svg v-else class="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <strong class="truncate text-base font-bold tracking-tight text-[#0a192f]">
          {{ mobileHeaderTitle }}
        </strong>
      </div>

      <!-- 2. 홈 탭(로드맵): 브랜드 로고 + 현재 목표 선택 드롭다운 스위처 -->
      <div v-else-if="isHomeTab" class="flex items-center gap-2 min-w-0">
        <button
          type="button"
          class="-ml-2 hidden size-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 md:flex cursor-pointer"
          aria-label="메뉴 열기"
          :aria-expanded="uiStore.sidebarOpen"
          @click="uiStore.toggleSidebar()"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            class="size-5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <RouterLink :to="{ name: ROUTE_NAMES.DASHBOARD }" class="flex shrink-0 items-center gap-2">
          <div class="flex size-8 items-center justify-center rounded-[12px] bg-primary shadow-sm">
            <img src="@/assets/icons/logo.svg" alt="미래로" class="size-[18px]" />
          </div>
          <strong class="text-lg font-bold tracking-tight text-[#0a192f] hidden sm:block"
            >미래로</strong
          >
        </RouterLink>

        <!-- 토스 스타일: 현재 목표 선택 드롭다운 버튼 -->
        <button
          type="button"
          class="group flex max-w-[190px] items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 shadow-[0_1px_0_rgba(0,0,0,0.05)] transition hover:border-primary/40 hover:bg-[#f8fbff] active:scale-95 cursor-pointer select-none"
          aria-label="로드맵 선택"
          @click.stop="isMobileRoadmapSheetOpen = !isMobileRoadmapSheetOpen"
        >
          <span class="size-2 shrink-0 rounded-full bg-primary ring-2 ring-primary/20" />
          <span class="truncate text-xs font-bold text-[#0a192f] group-hover:text-primary">
            {{ currentSelectedGoalName }}
          </span>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            class="size-3.5 shrink-0 text-slate-400 transition-transform duration-200 group-hover:text-primary"
            :class="isMobileRoadmapSheetOpen ? 'rotate-180 text-primary' : ''"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- 3. 다른 탭들(지출, 페이스, 코치, 전체 등): 핵심 키워드 타이틀 노출 -->
      <div v-else class="flex items-center gap-2">
        <button
          type="button"
          class="-ml-2 hidden size-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 md:flex cursor-pointer"
          aria-label="메뉴 열기"
          :aria-expanded="uiStore.sidebarOpen"
          @click="uiStore.toggleSidebar()"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            class="size-5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 class="text-lg font-bold tracking-tight text-[#0a192f]">
          {{ mobileHeaderTitle }}
        </h1>
      </div>

      <!-- 우측: 알림 센터 종 아이콘 & 마이페이지 아바타 (+ AI 코치 전용 대화목록 버튼) -->
      <div class="flex shrink-0 items-center gap-0">
        <!-- AI 코치 전용: 모바일 대화 목록 열기 버튼 -->
        <button
          v-if="currentRouteName === ROUTE_NAMES.COACH"
          type="button"
          class="flex size-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 active:scale-95 cursor-pointer"
          aria-label="대화 목록 열기"
          @click="coachStore.toggleSidebar()"
        >
          <img src="@/assets/icons/goal-paused-clock.svg" alt="" class="size-5" />
        </button>

        <!-- 🔔 모바일 알림 종 아이콘 & 알림 드롭다운 -->
        <div ref="mobileDropdownRef" class="relative">
          <button
            type="button"
            class="relative flex size-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 focus:outline-none active:scale-95"
            aria-label="알림 센터 열기"
            @click="toggleDropdown"
          >
            <svg
              class="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>

            <!-- 읽지 않은 알림 빨간 뱃지 (단정한 솔리드 레드 닷) -->
            <span
              v-if="hasUnread"
              class="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white"
            />
          </button>

          <!-- 모바일 알림 센터 드롭다운 메뉴 -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-2"
          >
            <div
              v-if="isDropdownOpen"
              class="fixed inset-x-4 top-16 z-50 max-h-[80vh] rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[360px]"
            >
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-[#0a192f]">알림 센터</span>
                  <span
                    v-if="notificationHistory.length > 0"
                    class="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary"
                  >
                    {{ notificationHistory.length }}
                  </span>
                </div>
                <button
                  v-if="notificationHistory.length > 0"
                  type="button"
                  class="text-[11px] text-slate-400 transition hover:text-slate-600"
                  @click="clearHistory"
                >
                  전체 지우기
                </button>
              </div>

              <!-- 알림 목록 -->
              <div class="mt-3 flex max-h-72 flex-col gap-2.5 overflow-y-auto pr-1">
                <div
                  v-if="notificationHistory.length === 0"
                  class="py-8 text-center text-xs text-slate-400"
                >
                  수신된 알림이 없습니다.
                </div>

                <div
                  v-for="item in notificationHistory"
                  :key="item.id"
                  class="group relative flex min-h-[64px] cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-[#f8fbff] p-3 transition hover:bg-blue-50/60 hover:border-blue-200"
                  @click="handleNotificationClick(item)"
                >
                  <!-- 테마별 컬러 틴트 아이콘 -->
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-xl shadow-[0_1px_0_rgba(0,0,0,0.05)]"
                    :class="getNotificationIconStyle(item.type, item.badgeIcon).container"
                  >
                    <AppIcon
                      :name="getNotificationIconStyle(item.type, item.badgeIcon).icon"
                      size="sm"
                      :class="getNotificationIconStyle(item.type, item.badgeIcon).iconColor"
                    />
                  </div>

                  <!-- 내용 -->
                  <div class="flex-1 min-w-0 self-center">
                    <div class="flex items-center justify-between gap-2">
                      <p class="text-xs font-bold text-[#0a192f] truncate">{{ item.title }}</p>
                      <button
                        type="button"
                        class="text-slate-400 hover:text-slate-600"
                        aria-label="알림 제거"
                        @click.stop="removeHistoryItem(item.id)"
                      >
                        <svg
                          class="size-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <p class="mt-0.5 text-[11px] text-slate-500 leading-tight truncate">
                      {{ item.body }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 데스크탑 헤더 (lg:flex) -->
    <div class="page-container hidden h-20 items-center gap-5 lg:flex">
      <RouterLink
        :to="{ name: ROUTE_NAMES.DASHBOARD }"
        class="mr-4 flex shrink-0 items-center gap-2.5"
      >
        <div class="flex size-8 items-center justify-center rounded-[12px] bg-primary shadow-sm">
          <img src="@/assets/icons/logo.svg" alt="미래로" class="size-[18px]" />
        </div>
        <strong class="text-xl font-bold tracking-tight text-[#0a192f]">미래로</strong>
      </RouterLink>

      <nav class="flex min-w-0 flex-1 items-stretch justify-center gap-5 self-stretch xl:gap-8">
        <div ref="roadmapDropdownRef" class="relative flex shrink-0 items-stretch">
          <button
            type="button"
            class="group relative flex items-center justify-center gap-1 px-2 text-sm font-bold transition hover:text-primary cursor-pointer select-none"
            :class="isRoadmapActive ? 'text-primary' : 'text-[#0a192f]'"
            aria-haspopup="menu"
            :aria-expanded="isRoadmapDropdownOpen"
            @click="handleRoadmapHeaderClick"
          >
            <span>홈</span>
            <span
              class="flex items-center justify-center rounded-full p-0.5 transition hover:bg-slate-100"
              aria-label="로드맵 목록 열기"
              @click.stop="isRoadmapDropdownOpen = !isRoadmapDropdownOpen"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                class="size-3.5 transition-transform duration-200"
                :class="isRoadmapDropdownOpen ? 'rotate-180 text-primary' : ''"
              >
                <path
                  d="m5 7.5 5 5 5-5"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span
              class="absolute inset-x-1 bottom-0 h-0.5 origin-left bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100"
              :class="isRoadmapActive ? 'scale-x-100' : 'scale-x-0'"
            />
          </button>

          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="-translate-y-1 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-1 opacity-0"
          >
            <div
              v-if="isRoadmapDropdownOpen"
              class="absolute left-0 top-[calc(100%+10px)] z-50 w-[286px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,35,70,0.14)]"
              role="menu"
            >
              <div class="max-h-[310px] space-y-1 overflow-y-auto">
                <RouterLink
                  v-for="goal in goalStore.goals"
                  :key="goal.goalId"
                  :to="{ name: ROUTE_NAMES.DASHBOARD_GOAL, params: { goalId: goal.goalId } }"
                  class="block rounded-xl px-3 py-3 transition hover:bg-[#f4f8ff]"
                  :class="isSelectedGoal(goal) ? 'bg-[#eaf2ff]' : ''"
                  role="menuitem"
                  @click="isRoadmapDropdownOpen = false"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="size-2 shrink-0 rounded-full"
                      :class="isSelectedGoal(goal) ? 'bg-primary' : 'bg-slate-300'"
                    />
                    <span
                      class="min-w-0 flex-1 truncate text-sm font-bold"
                      :class="isSelectedGoal(goal) ? 'text-primary' : 'text-slate-700'"
                    >
                      {{ goal.goalName }}
                    </span>
                    <span
                      class="text-sm font-bold"
                      :class="isSelectedGoal(goal) ? 'text-primary' : 'text-slate-400'"
                    >
                      {{ goal.progressRate }}%
                    </span>
                  </div>
                  <div class="ml-4 mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      class="h-full rounded-full"
                      :class="isSelectedGoal(goal) ? 'bg-primary' : 'bg-[#b9d3ff]'"
                      :style="{ width: `${Math.min(100, Math.max(0, goal.progressRate))}%` }"
                    />
                  </div>
                </RouterLink>
              </div>

              <RouterLink
                :to="{ name: ROUTE_NAMES.GOAL_SELECT, query: { from: 'dashboard' } }"
                class="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-[#b9d3ff] px-3 py-3 text-sm font-bold text-primary transition hover:bg-[#f4f8ff]"
                role="menuitem"
                @click="isRoadmapDropdownOpen = false"
              >
                <span class="text-lg font-light">＋</span>
                새 로드맵 추가
              </RouterLink>
            </div>
          </Transition>
        </div>

        <RouterLink
          v-for="item in headerNavItems"
          :key="item.routeName"
          :to="{ name: item.routeName }"
          class="group relative flex shrink-0 items-center justify-center px-2 text-center text-sm font-bold text-[#0a192f] transition hover:text-primary"
          :class="isActive(item.routeName) ? 'text-primary' : ''"
        >
          {{ item.label }}
          <span
            class="absolute inset-x-1 bottom-0 h-0.5 origin-left bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100"
            :class="isActive(item.routeName) ? 'scale-x-100' : 'scale-x-0'"
          />
        </RouterLink>
      </nav>

      <div class="flex shrink-0 items-center gap-3">
        <!-- 🔔 알림 종 아이콘 & 알림 센터 드롭다운 -->
        <div ref="dropdownRef" class="relative">
          <button
            type="button"
            class="relative flex size-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 focus:outline-none active:scale-95"
            aria-label="알림 센터 열기"
            @click="toggleDropdown"
          >
            <svg
              class="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>

            <!-- 읽지 않은 알림 빨간 뱃지 (단정한 솔리드 레드 닷) -->
            <span
              v-if="hasUnread"
              class="absolute top-2 right-2 size-2.5 rounded-full bg-red-500 ring-2 ring-white"
            />
          </button>

          <!-- 알림 센터 드롭다운 메뉴 (헤더 우측 경계선에 짝! 맞춤) -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-2"
          >
            <div
              v-if="isDropdownOpen"
              class="absolute right-0 mt-3 z-50 w-[320px] sm:w-[380px] rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl"
            >
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-[#0a192f]">알림 센터</span>
                  <span
                    v-if="notificationHistory.length > 0"
                    class="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary"
                  >
                    {{ notificationHistory.length }}
                  </span>
                </div>
                <button
                  v-if="notificationHistory.length > 0"
                  type="button"
                  class="text-[11px] text-slate-400 transition hover:text-slate-600"
                  @click="clearHistory"
                >
                  전체 지우기
                </button>
              </div>

              <!-- 알림 목록 -->
              <div class="mt-3 flex max-h-80 flex-col gap-2.5 overflow-y-auto pr-1">
                <div
                  v-if="notificationHistory.length === 0"
                  class="py-8 text-center text-xs text-slate-400"
                >
                  수신된 알림이 없습니다.
                </div>

                <div
                  v-for="item in notificationHistory"
                  :key="item.id"
                  class="group relative flex min-h-[68px] cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-[#f8fbff] p-3 transition hover:bg-blue-50/60 hover:border-blue-200"
                  @click="handleNotificationClick(item)"
                >
                  <!-- 테마별 컬러 틴트 아이콘 -->
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-xl shadow-[0_1px_0_rgba(0,0,0,0.05)]"
                    :class="getNotificationIconStyle(item.type, item.badgeIcon).container"
                  >
                    <AppIcon
                      :name="getNotificationIconStyle(item.type, item.badgeIcon).icon"
                      size="sm"
                      :class="getNotificationIconStyle(item.type, item.badgeIcon).iconColor"
                    />
                  </div>

                  <!-- 내용 -->
                  <div class="flex-1 min-w-0 self-center">
                    <!-- 1행: 알림 타이틀 + (평소: '방금' ➔ Hover 시: X 버튼 교체) -->
                    <div class="flex items-center justify-between gap-2">
                      <p class="text-xs font-bold text-[#0a192f] truncate">{{ item.title }}</p>

                      <!-- Hover Swap 영역 -->
                      <div class="relative shrink-0 flex items-center justify-end min-w-[28px] h-4">
                        <span
                          class="text-[11px] text-slate-400 transition-opacity duration-200 group-hover:opacity-0"
                        >
                          방금
                        </span>
                        <button
                          type="button"
                          class="absolute inset-0 flex items-center justify-end text-slate-300 opacity-0 transition-opacity duration-200 hover:text-slate-600 group-hover:opacity-100"
                          aria-label="알림 제거"
                          @click.stop="removeHistoryItem(item.id)"
                        >
                          <svg
                            class="size-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- 2행: 알림 본문 -->
                    <p class="mt-0.5 text-[11px] text-slate-500 leading-tight truncate">
                      {{ item.body }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 모바일 목표 선택 바텀시트 (토스 스타일: body 직속으로 Teleport하여 backdrop-filter/z-index 갇힘 방지) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isMobileRoadmapSheetOpen"
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] lg:hidden"
          @click="isMobileRoadmapSheetOpen = false"
        />
      </Transition>

      <Transition
        enter-active-class="transition duration-250 ease-out"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition duration-180 ease-in"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
      >
        <section
          v-if="isMobileRoadmapSheetOpen"
          id="mobile-roadmap-header-sheet"
          class="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 shadow-2xl lg:hidden"
          aria-label="로드맵 선택"
        >
          <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
          <div class="mb-3.5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-[#0a192f]">로드맵 선택</h2>
              <span
                v-if="goalStore.goals.length > 0"
                class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary"
              >
                {{ goalStore.goals.length }}개
              </span>
            </div>
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 cursor-pointer"
              aria-label="로드맵 목록 닫기"
              @click="isMobileRoadmapSheetOpen = false"
            >
              ✕
            </button>
          </div>

          <!-- 로드맵 목록 -->
          <div class="max-h-[50vh] space-y-2 overflow-y-auto pr-0.5">
            <button
              v-for="goal in goalStore.goals"
              :key="goal.goalId"
              type="button"
              class="flex w-full flex-col rounded-2xl border p-3.5 text-left transition active:scale-[0.99] cursor-pointer"
              :class="
                isSelectedGoal(goal)
                  ? 'border-primary/40 bg-[#eaf2ff] shadow-sm'
                  : 'border-slate-200/80 bg-[#f8fbff] hover:bg-white'
              "
              @click="selectGoalAndNavigate(goal.goalId)"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex min-w-0 items-center gap-2">
                  <span
                    class="size-2 shrink-0 rounded-full"
                    :class="
                      isSelectedGoal(goal) ? 'bg-primary ring-2 ring-primary/30' : 'bg-slate-300'
                    "
                  />
                  <strong
                    class="truncate text-sm font-bold"
                    :class="isSelectedGoal(goal) ? 'text-primary' : 'text-[#0a192f]'"
                  >
                    {{ goal.goalName }}
                  </strong>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <span
                    v-if="isSelectedGoal(goal)"
                    class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
                  >
                    선택됨
                  </span>
                  <span
                    class="text-sm font-bold tabular-nums"
                    :class="isSelectedGoal(goal) ? 'text-primary' : 'text-slate-500'"
                  >
                    {{ goal.progressRate }}%
                  </span>
                </div>
              </div>

              <!-- 진행률 바 -->
              <div class="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="isSelectedGoal(goal) ? 'bg-primary' : 'bg-[#93c5fd]'"
                  :style="{ width: `${Math.min(100, Math.max(0, goal.progressRate))}%` }"
                />
              </div>
            </button>
          </div>

          <!-- 새 로드맵 추가 버튼 -->
          <RouterLink
            :to="{ name: ROUTE_NAMES.GOAL_SELECT, query: { from: 'dashboard' } }"
            class="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#b9d3ff] bg-[#f4f8ff] py-3.5 text-sm font-bold text-primary transition active:scale-[0.99] hover:bg-blue-50"
            @click="isMobileRoadmapSheetOpen = false"
          >
            <span class="text-base leading-none">＋</span>
            새 로드맵 추가
          </RouterLink>
        </section>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui.store'
import { useGoalStore } from '@/features/goal'
import { useCoachStore } from '@/features/coach'
import { usePacemakerToast } from '@/features/pacemaker'
import { NAV_ITEMS } from '@/shared/constants/navigation'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import AppIcon from '@/shared/ui/AppIcon.vue'

function getNotificationIconStyle(type, badgeIcon) {
  if (type === 'STREAK' || badgeIcon === '🔥') {
    return {
      container: 'bg-amber-50 border border-amber-200/80 text-amber-500 shadow-amber-500/10',
      icon: 'fire',
      iconColor: 'text-amber-500',
    }
  }
  if (type === 'SAVING' || badgeIcon === '💰' || badgeIcon === '💸') {
    return {
      container: 'bg-blue-50 border border-blue-200/80 text-primary shadow-blue-500/10',
      icon: 'money',
      iconColor: 'text-primary',
    }
  }
  if (type === 'ACHIEVE' || badgeIcon === '🎯') {
    return {
      container:
        'bg-emerald-50 border border-emerald-200/80 text-emerald-600 shadow-emerald-500/10',
      icon: 'target',
      iconColor: 'text-emerald-600',
    }
  }
  return {
    container: 'bg-[#f0f6ff] border border-blue-100 text-primary shadow-blue-500/10',
    icon: badgeIcon || 'check',
    iconColor: 'text-primary',
  }
}

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const goalStore = useGoalStore()
const coachStore = useCoachStore()
const { notificationHistory, hasUnread, markAllAsRead, removeHistoryItem, clearHistory } =
  usePacemakerToast()

const isDropdownOpen = ref(false)
const dropdownRef = ref(null)
const mobileDropdownRef = ref(null)
const isRoadmapDropdownOpen = ref(false)
const roadmapDropdownRef = ref(null)
const isMobileRoadmapSheetOpen = ref(false)
const isScrolled = ref(false)

const currentSelectedGoalName = computed(() => {
  const matched = goalStore.goals.find((g) => String(g.goalId) === String(goalStore.selectedGoalId))
  return matched?.goalName || (goalStore.goals[0]?.goalName ?? '로드맵 선택')
})

function selectGoalAndNavigate(goalId) {
  isMobileRoadmapSheetOpen.value = false
  isRoadmapDropdownOpen.value = false
  const targetId = Number(goalId)
  goalStore.selectGoal(targetId)
  router.push({ name: ROUTE_NAMES.DASHBOARD_GOAL, params: { goalId: targetId } })
}

const headerNavOrder = [
  ROUTE_NAMES.COLLECTION,
  ROUTE_NAMES.PACEMAKER,
  ROUTE_NAMES.SPENDING,
  ROUTE_NAMES.CREDIT,
  ROUTE_NAMES.PRODUCTS,
  ROUTE_NAMES.YOUTH_POLICY,
  ROUTE_NAMES.COACH,
]
const headerNavItems = headerNavOrder.map((routeName) =>
  NAV_ITEMS.find((item) => item.routeName === routeName)
)
const isActive = (routeName) => route.name === routeName || route.meta.navRouteName === routeName
const isRoadmapActive = computed(() =>
  [ROUTE_NAMES.DASHBOARD, ROUTE_NAMES.DASHBOARD_GOAL].includes(route.name)
)

const PAGE_TITLES = {
  [ROUTE_NAMES.SPENDING]: '지출 분석',
  [ROUTE_NAMES.PACEMAKER]: '페이스메이커',
  [ROUTE_NAMES.COACH]: 'AI 목표 코치',
  [ROUTE_NAMES.MENU]: '전체 메뉴',
  [ROUTE_NAMES.CREDIT]: '신용 관리',
  [ROUTE_NAMES.COLLECTION]: '나의 컬렉션',
  [ROUTE_NAMES.PRODUCTS]: '추천 금융 상품',
  [ROUTE_NAMES.YOUTH_POLICY]: '청년 정책',
  [ROUTE_NAMES.MYPAGE]: '마이페이지',
}

const currentRouteName = computed(() => route.meta.navRouteName ?? route.name)
const isHomeTab = computed(() =>
  [ROUTE_NAMES.DASHBOARD, ROUTE_NAMES.DASHBOARD_GOAL].includes(currentRouteName.value)
)
const mobileHeaderTitle = computed(() => {
  if (route.meta.title) return route.meta.title
  return PAGE_TITLES[currentRouteName.value] || '미래로'
})

function isSelectedGoal(goal) {
  return String(goal.goalId) === String(goalStore.selectedGoalId)
}

function handleRoadmapHeaderClick() {
  if (isRoadmapActive.value) {
    isRoadmapDropdownOpen.value = !isRoadmapDropdownOpen.value
  } else {
    isRoadmapDropdownOpen.value = false
    const targetGoalId = goalStore.selectedGoalId
    if (targetGoalId) {
      router.push({ name: ROUTE_NAMES.DASHBOARD_GOAL, params: { goalId: targetGoalId } })
    } else {
      router.push({ name: ROUTE_NAMES.DASHBOARD })
    }
  }
}

function handleBackOrClose() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: ROUTE_NAMES.DASHBOARD })
  }
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    markAllAsRead()
  }
}

function handleNotificationClick(item) {
  isDropdownOpen.value = false

  if (item.type === 'AVAILABLE_MONEY') {
    const goalId = goalStore.selectedGoalId
    router.push({
      name: goalId ? ROUTE_NAMES.DASHBOARD_GOAL : ROUTE_NAMES.DASHBOARD,
      ...(goalId ? { params: { goalId } } : {}),
      query: { modal: 'today-available-money' },
    })
  } else if (item.type === 'STREAK') {
    if (route.name !== ROUTE_NAMES.PACEMAKER) {
      router.push({ name: ROUTE_NAMES.PACEMAKER })
    }
  }
}

function handleClickOutside(event) {
  const isOutsideDesktop = !dropdownRef.value || !dropdownRef.value.contains(event.target)
  const isOutsideMobile =
    !mobileDropdownRef.value || !mobileDropdownRef.value.contains(event.target)

  if (isOutsideDesktop && isOutsideMobile) {
    isDropdownOpen.value = false
  }
  if (roadmapDropdownRef.value && !roadmapDropdownRef.value.contains(event.target)) {
    isRoadmapDropdownOpen.value = false
  }
}

function handleScroll(event) {
  const target = event?.target ?? document.querySelector('main')
  const scrollTop = target?.scrollTop ?? window.scrollY ?? 0
  isScrolled.value = scrollTop > 10
}

onMounted(() => {
  goalStore.fetchGoals()
  document.addEventListener('click', handleClickOutside)

  const mainEl = document.querySelector('main')
  if (mainEl) {
    mainEl.addEventListener('scroll', handleScroll, { passive: true })
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  const mainEl = document.querySelector('main')
  if (mainEl) {
    mainEl.removeEventListener('scroll', handleScroll)
  }
  window.removeEventListener('scroll', handleScroll)
})
</script>
