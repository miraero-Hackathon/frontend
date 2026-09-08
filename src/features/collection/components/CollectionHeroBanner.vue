<!-- 컬렉션 상단 명예의 전당 요약 히어로 배너 (대시보드 블루 톤앤매너 & API 명세 기반) -->
<template>
  <div
    class="relative flex flex-col justify-between gap-5 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(0,102,255,0.04)] sm:p-6 lg:flex-row lg:items-center"
  >
    <!-- 좌측 정보 영역 -->
    <div class="relative z-10 flex flex-1 flex-col gap-2.5">
      <div class="flex items-center gap-2">
        <span
          class="inline-flex w-fit items-center rounded-full border border-primary/20 bg-[#eaf2ff] px-2.5 py-0.5 text-xs font-bold text-primary"
        >
          나만의 완주 룸
        </span>
        <span class="text-xs font-bold text-slate-400">완주 기록 보관소</span>
      </div>

      <h1
        class="text-xl font-bold leading-tight tracking-tight text-[#0a192f] sm:text-2xl sm:leading-snug md:text-3xl break-keep"
      >
        총 <span class="text-primary">{{ totalCount }}개</span>의 로드맵을 성공적으로 완주했어요
      </h1>

      <p class="text-xs font-medium text-slate-500 sm:text-sm">
        목표 페이스를 끝까지 유지하며 모은 값진 성과예요. 다음 목표도 함께 달려봐요.
      </p>

      <!-- 요약 통계 그리드 바 (대시보드 인셋 스타일 - 2개 항목) -->
      <div class="mt-1.5 grid w-full grid-cols-2 gap-2.5 sm:w-fit sm:flex sm:items-center sm:gap-3">
        <div class="flex flex-col rounded-2xl border border-slate-100 bg-[#f8fbff] px-4 py-2.5 shadow-2xs">
          <span class="text-[11px] font-bold text-slate-400">총 완주 금액</span>
          <span class="mt-0.5 text-base sm:text-lg font-bold tracking-tight text-[#0a192f]">
            {{ formatManwon(totalAmount) }}<span class="text-xs font-bold text-slate-400 ml-0.5">만원</span>
          </span>
        </div>

        <div class="flex flex-col rounded-2xl border border-slate-100 bg-[#f8fbff] px-4 py-2.5 shadow-2xs">
          <span class="text-[11px] font-bold text-slate-400">완주한 목표</span>
          <span class="mt-0.5 text-base sm:text-lg font-bold tracking-tight text-[#0a192f]">
            {{ totalCount }}<span class="text-xs font-bold text-slate-400 ml-0.5">개</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 우측 캐릭터 일러스트 배너 (콜리) -->
    <div class="relative hidden shrink-0 items-center justify-center pr-2 lg:flex">
      <div
        class="relative flex size-28 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-[#eaf2ff] to-[#f4f8ff] p-2 shadow-inner"
      >
        <img
          :src="coliImage"
          alt="완주 메달 콜리"
          class="size-20 object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import coliImage from '@/assets/images/coli_new.png'

defineProps({
  totalCount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
})

function formatManwon(amount) {
  return Math.round((Number(amount) || 0) / 10000).toLocaleString('ko-KR')
}
</script>
