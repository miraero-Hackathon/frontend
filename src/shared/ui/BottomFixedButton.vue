<template>
  <div
    class="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4 pb-8 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
  >
    <div class="mx-auto max-w-lg">
      <button
        v-bind="$attrs"
        class="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
      >
        <slot />
      </button>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  inheritAttrs: false,
})
</script>
