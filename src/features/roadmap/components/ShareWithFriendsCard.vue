<!-- 목표 달성 현황 친구 공유하기 배너 카드 -->
<template>
  <button
    type="button"
    class="group relative flex min-h-[84px] w-full cursor-pointer items-center justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-r from-white via-[#f8fbff] to-[#ebf4ff] p-4 text-left shadow-[0_4px_24px_rgba(15,35,70,0.03)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(0,102,255,0.08)] active:scale-[0.98] sm:p-5 break-keep"
    @click="$emit('open')"
  >
    <div class="relative z-10 min-w-0 pr-20 sm:pr-36">
      <!-- 메인 타이틀 -->
      <h3 class="text-sm font-bold tracking-tight text-[#0a192f] sm:text-base">
        친구에게 나의 로드맵 자랑하기
      </h3>

      <!-- 설명 문구 (~에요 톤앤매너) -->
      <p class="mt-0.5 text-[11px] font-bold text-slate-400 sm:text-xs">
        목표 달성 현황 카드를 공유하고 함께 달려보세요!
      </p>

      <!-- 하단 인터랙티브 공유 CTA -->
      <div class="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-primary">
        <span class="font-bold">지금 공유하기</span>
        <span class="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </div>
    </div>

    <!-- 우측 스타프렌즈 일러스트 (모바일 밸런스 최적화 및 앰비언트 그림자) -->
    <img
      :src="friendsImage"
      alt="스타프렌즈 친구들"
      class="absolute -bottom-1.5 right-1 h-[62px] w-auto object-contain drop-shadow-[0_6px_14px_rgba(0,102,255,0.12)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105 sm:right-4 sm:h-20"
    />
  </button>
</template>

<script setup>
import friendsImage from '@/assets/images/friends.png'

defineEmits(['open'])
</script>
