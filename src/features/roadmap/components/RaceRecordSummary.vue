<!-- 스마트 자산 브리핑 (기존 RaceRecordSummary) -->
<template>
  <div class="space-y-3">
    <section
      class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(15,35,70,0.03)] sm:p-6 md:p-7"
    >
      <div class="flex items-center justify-between pb-3.5 sm:pb-4">
        <h3 class="text-base font-bold tracking-tight text-[#0a192f] whitespace-nowrap sm:text-lg">
          스마트 자산 브리핑
        </h3>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SmartBriefingCard :goal="goal" />
        <ConnectedAssetsCard :assets="assets" @open-detail="$emit('open-detail')" />
      </div>
    </section>

    <!-- 3. 친구에게 공유하기 배너 -->
    <div>
      <ShareWithFriendsCard @open="$emit('open')" />
    </div>
  </div>
</template>

<script setup>
import SmartBriefingCard from '@/features/roadmap/components/SmartBriefingCard.vue'
import ConnectedAssetsCard from '@/features/roadmap/components/ConnectedAssetsCard.vue'
import ShareWithFriendsCard from '@/features/roadmap/components/ShareWithFriendsCard.vue'

defineProps({
  goal: {
    type: Object,
    required: true,
  },
  assets: {
    type: Array,
    required: true,
  },
})

defineEmits(['open', 'open-detail'])
</script>
