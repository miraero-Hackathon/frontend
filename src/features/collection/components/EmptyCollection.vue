<!-- 목표 컬렉션 빈 상태 (Empty State) 컴포넌트 (대시보드 스토리텔링 결 반영) -->
<template>
  <div
    class="mx-auto flex w-full max-w-[540px] flex-col items-center justify-center rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,102,255,0.04)] sm:p-12"
  >
    <!-- 콜리 캐릭터 아이콘 컨테이너 -->
    <div
      class="flex size-20 items-center justify-center rounded-3xl border border-primary/15 bg-[#eaf2ff] p-2.5 shadow-inner transition-transform duration-300 hover:scale-105"
    >
      <img :src="coliImage" alt="콜리" class="size-14 object-contain drop-shadow-sm" />
    </div>

    <!-- 타이틀 & 스토리텔링 안내 문구 -->
    <h3 class="mt-5 text-xl font-bold tracking-tight text-[#0a192f] sm:text-2xl">
      아직 완주한 목표가 없어요
    </h3>
    <p class="mt-2 text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
      콜리와 함께 로드맵을 따라 페이스를 맞춰 달려보세요.<br class="hidden sm:inline" />
      스플릿을 모두 완주하면 이곳에 영광의 완주 메달이 보관돼요!
    </p>

    <!-- 버튼 (목표 로드맵 시작하기) -->
    <button
      type="button"
      class="mt-6 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-md active:translate-y-0 cursor-pointer select-none"
      @click="$emit('start-roadmap')"
    >
      <span>첫 목표 로드맵 시작하기</span>
      <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import coliImage from '@/assets/images/coli_new.png'

defineEmits(['start-roadmap'])
</script>
