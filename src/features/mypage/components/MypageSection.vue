<template>
  <section
    class="overflow-hidden rounded-[20px] border border-slate-200 bg-white"
    :aria-labelledby="headingId"
  >
    <div class="border-b border-[#f0f4fb] px-5 py-4 sm:px-6">
      <h2 :id="headingId" class="text-sm font-bold text-[#0a192f]">{{ title }}</h2>
    </div>
    <div class="px-5 py-5 sm:px-6" :class="bodyClass">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  headingId: { type: String, required: true },
  bodyClass: { type: String, default: '' },
})
</script>
