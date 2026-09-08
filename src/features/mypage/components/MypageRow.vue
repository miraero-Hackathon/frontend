<template>
  <div
    class="flex min-h-[54px] items-center justify-between gap-4 py-3.5"
    :class="bordered ? 'border-b border-[#f4f8ff]' : ''"
  >
    <div class="min-w-0">
      <p class="text-sm font-medium text-[#0a192f]">{{ label }}</p>
      <p v-if="description" class="mt-0.5 text-xs text-slate-400">{{ description }}</p>
    </div>
    <div class="shrink-0 text-right text-sm text-slate-500">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  description: { type: String, default: '' },
  bordered: { type: Boolean, default: true },
})
</script>
