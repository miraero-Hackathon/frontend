<!-- 서비스 공용 미니멀 푸터 컴포넌트 (모바일에서는 숨김, PC/태블릿에서만 표시) -->
<template>
  <footer class="hidden md:block border-t border-slate-200/60 py-8 text-center sm:py-10">
    <div class="page-container flex flex-col items-center justify-center gap-1.5">
      <!-- 서비스 슬로건 -->
      <div class="flex items-center gap-1.5 text-slate-500">
        <span class="text-xs font-bold text-primary">미래로</span>
        <span class="text-[11px] font-medium text-slate-400">· 청년 금융 페이스메이커</span>
      </div>

      <!-- 안내 문구 & 카피라이트 -->
      <p class="pt-0.5 text-[10.5px] font-medium text-slate-400 sm:text-[11px]">
        미래로는 청년의 자산 형성과 목표 완주를 지원하는 스마트 금융 서비스입니다.
      </p>
      <p class="text-[10px] font-bold tracking-tight text-slate-300 sm:text-[10.5px]">
        © 2026 Miraero. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
// 공용 미니멀 푸터
</script>
