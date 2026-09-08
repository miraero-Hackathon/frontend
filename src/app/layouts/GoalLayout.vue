<template>
  <!-- 기존 bg-gray-50 제거, w-full 추가로 전체 화면 사용 -->
  <div class="min-h-screen w-full relative">
    <!-- 너비 제한(max-w-4xl) 및 패딩(px-6, py-8) 제거 -->
    <main class="w-full h-full">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>
