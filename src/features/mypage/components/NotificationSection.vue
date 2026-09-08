<template>
  <MypageSection title="알림 설정" heading-id="notification-section-title" body-class="!py-2">
    <MypageRow
      v-for="(item, index) in items"
      :key="item.id"
      :label="item.label"
      :description="`${item.description} · 이 기기에 저장`"
      :bordered="index < items.length - 1"
    >
      <MypageToggle
        :model-value="item.enabled"
        :label="`${item.label} ${item.enabled ? '끄기' : '켜기'}`"
        @update:model-value="emit('toggle', item.id)"
      />
    </MypageRow>
  </MypageSection>
</template>

<script setup>
import MypageRow from '@/features/mypage/components/MypageRow.vue'
import MypageSection from '@/features/mypage/components/MypageSection.vue'
import MypageToggle from '@/features/mypage/components/MypageToggle.vue'

defineProps({
  items: { type: Array, required: true },
})

const emit = defineEmits(['toggle'])
</script>
