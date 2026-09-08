<!-- 목표 일시정지 상태 배너: 로드맵 상단에 노출, 재개 버튼 클릭 시 재개 확인 모달을 염 -->
<template>
  <div
    class="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-[#f8fafc] px-5 py-4"
  >
    <div class="flex items-center gap-3">
      <div class="flex size-8 shrink-0 items-center justify-center rounded-[14px] bg-slate-200">
        <img src="@/assets/icons/goal-paused-clock.svg" alt="" class="size-[15px]" />
      </div>
      <div>
        <p class="text-sm font-bold tracking-tight text-slate-500">목표가 일시정지 중이에요</p>
        <p class="pt-0.5 text-xs text-slate-400">
          자동이체가 해제되어 있어요 · 저금통에 자동으로 쌓이지 않아요
        </p>
      </div>
    </div>
    <button
      type="button"
      class="shrink-0 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-[0_3px_5px_rgba(0,102,255,0.28)]"
      @click="$emit('resume-click')"
    >
      목표 재개하기
    </button>
  </div>
</template>

<script setup>
defineEmits(['resume-click'])
</script>
