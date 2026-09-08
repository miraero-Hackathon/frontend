<!-- 온보딩류 히어로 화면 공용 배경: 연한 블루 그라데이션 + 좌우 블러 글로우 -->
<template>
  <div class="hero-bg relative flex min-h-screen flex-col">
    <div class="hero-bg__glow" aria-hidden="true"></div>
    <slot />
  </div>
</template>

<style scoped>
.hero-bg {
  position: relative;

  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(219, 233, 255, 0.28) 0%,
      rgba(219, 233, 255, 0.12) 22%,
      rgba(255, 255, 255, 0) 55%
    ),
    radial-gradient(circle at 0% 0%, rgba(237, 244, 255, 0.18) 0%, rgba(255, 255, 255, 0) 48%),
    radial-gradient(
      circle at 0% 100%,
      rgba(219, 233, 255, 0.24) 0%,
      rgba(219, 233, 255, 0.1) 20%,
      rgba(255, 255, 255, 0) 48%
    ),
    linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

/*
  블러 글로우는 별도 레이어(.hero-bg__glow)에 담아 overflow:hidden을 여기에만 건다.
  .hero-bg 자체에 overflow:hidden을 두면 하위의 sticky 헤더가 깨지기 때문(스펙상
  overflow:visible이 아닌 조상은 sticky의 기준 박스가 되어버려 고정이 안 먹힘).
*/
.hero-bg__glow {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.hero-bg__glow::before {
  content: '';

  position: absolute;

  inset: -200px;

  background:
    radial-gradient(circle at 85% 10%, rgba(222, 236, 255, 0.35), transparent 45%),
    radial-gradient(circle at 15% 5%, rgba(240, 246, 255, 0.25), transparent 40%),
    radial-gradient(circle at 10% 95%, rgba(222, 236, 255, 0.3), transparent 40%);

  filter: blur(80px);
}
</style>
