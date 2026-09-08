<!-- src/features/pacemaker/components/PacemakerToastNotification.vue -->
<template>
  <Teleport to="body">
    <!-- 모바일: 화면 상단 중앙 inset-x-3 top-3 / 데스크탑: 우측 상단 sm:top-6 sm:right-6 sm:max-w-[360px] -->
    <div
      class="pointer-events-none fixed inset-x-3 top-3 z-50 flex flex-col gap-2.5 sm:left-auto sm:right-6 sm:top-6 sm:w-full sm:max-w-[360px]"
    >
      <TransitionGroup
        enter-active-class="transition duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
        enter-from-class="opacity-0 -translate-y-4 sm:translate-y-0 sm:translate-x-full scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:translate-x-0 scale-100"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0 sm:translate-x-0 scale-100"
        leave-to-class="opacity-0 -translate-y-4 sm:translate-y-0 sm:translate-x-full scale-95"
      >
        <div
          v-for="toast in toastList"
          :key="toast.id"
          class="group pointer-events-auto relative flex min-h-[72px] w-full cursor-pointer items-center overflow-hidden rounded-[20px] border border-white/60 bg-[#f4f5f8]/95 p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-[0_14px_36px_rgba(0,0,0,0.16)]"
          role="alert"
          @click="onToastClick(toast)"
        >
          <!-- 좌측: 3D 페이스메이커 콜리 아바타 + 미니 테마 뱃지 -->
          <div class="relative mr-3.5 shrink-0">
            <div
              class="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-[#eaf2ff] via-[#f4f8ff] to-white p-1 shadow-sm transition-transform group-hover:scale-105"
            >
              <img
                src="@/assets/images/coli_new.png"
                alt="페이스메이커 콜리"
                class="size-9 object-contain drop-shadow-sm"
              />
            </div>
            <!-- 우측 하단 미니 테마 뱃지 -->
            <span
              class="absolute -bottom-1 -right-1 flex size-[18px] items-center justify-center rounded-full text-[10px] shadow-[0_1px_0_rgba(0,0,0,0.05)]"
              :class="toast.type === 'STREAK' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-primary'"
            >
              <AppIcon :name="toast.type === 'STREAK' ? 'fire' : 'money'" size="sm" class="size-3" />
            </span>
          </div>

          <!-- 알림 메인 텍스트 영역 -->
          <div class="flex-1 min-w-0 self-center">
            <!-- 1행: 페이스메이커 라벨 + (평소: '방금' ➔ Hover 시: X 버튼 교체) -->
            <div class="flex items-center justify-between gap-2 mb-0.5">
              <span class="text-[11px] font-bold text-primary flex items-center gap-1 leading-none">
                페이스메이커 콜리
              </span>

              <!-- Hover Swap 영역: 평소엔 '방금', 마우스 대면 X 버튼으로 교체 -->
              <div class="relative shrink-0 flex items-center justify-end min-w-[28px] h-4">
                <!-- 평소: '방금' 텍스트 -->
                <span
                  class="text-[11px] font-medium text-[#8e8e93] transition-opacity duration-200 group-hover:opacity-0"
                >
                  방금
                </span>

                <!-- Hover 시: X 닫기 버튼 -->
                <button
                  type="button"
                  class="absolute inset-0 flex items-center justify-end text-[#8e8e93] opacity-0 transition-opacity duration-200 hover:text-[#1c1c1e] group-hover:opacity-100"
                  aria-label="닫기"
                  @click.stop="emit('remove', toast.id)"
                >
                  <svg
                    class="size-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 2행: 알림 타이틀 -->
            <h4 class="text-[13px] font-bold text-[#1c1c1e] tracking-tight leading-tight truncate">
              {{ toast.title }}
            </h4>

            <!-- 3행: 알림 본문 설명 -->
            <p class="mt-0.5 text-[11.5px] font-normal text-[#636366] leading-snug truncate">
              {{ toast.body }}
            </p>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import AppIcon from '@/shared/ui/AppIcon.vue'
defineProps({
  toastList: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['remove', 'click-toast'])

function onToastClick(toast) {
  emit('click-toast', toast)
}
</script>
