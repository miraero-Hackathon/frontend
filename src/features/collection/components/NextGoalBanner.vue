<!-- 하단 새 로드맵 추가 CTA 배너 -->
<template>
  <div
    class="flex flex-col justify-between gap-4 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(0,102,255,0.04)] sm:p-6 md:flex-row md:items-center"
  >
    <!-- 좌측 문구 영역 -->
    <div class="max-w-xl">
      <h3 class="text-base sm:text-lg font-bold tracking-tight text-[#0a192f]">
        다음 목표도 페이스메이커와 함께 달려요
      </h3>
      <p class="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
        새로운 목표 로드맵을 등록하고 또 한 번의 멋진 성취를 경험해보세요.
      </p>
    </div>

    <!-- 우측 액션 버튼 -->
    <div class="shrink-0">
      <button
        type="button"
        class="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-md active:translate-y-0 cursor-pointer select-none sm:w-auto"
        @click="$emit('add-goal')"
      >
        <span>새 로드맵 시작하기</span>
        <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
          <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['add-goal'])
</script>
