<!-- 조건 일치 정책을 찾는 데 사용한 프로필 정보를 깔끔하게 보여주는 인라인 바 -->
<template>
  <aside
    class="mt-2.5 flex flex-col gap-2 rounded-xl border border-blue-100/90 bg-[#f5f8ff] px-3.5 py-2.5 text-xs shadow-2xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2"
  >
    <div class="flex items-center justify-between sm:contents">
      <span class="shrink-0 font-bold text-slate-700">적용된 조건:</span>
      <RouterLink
        :to="{ name: ROUTE_NAMES.MYPAGE }"
        class="inline-flex min-h-7 shrink-0 items-center gap-0.5 rounded-md px-1 text-[11px] font-bold text-primary transition-colors hover:bg-primary/5 hover:text-blue-700 sm:order-3 sm:ml-auto"
      >
        {{ hasProfileBasis ? '내 조건 수정' : '내 조건 등록' }}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="size-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
        </svg>
      </RouterLink>
    </div>
    <div class="min-w-0 sm:order-2 sm:flex-1">
      <div v-if="basisItems.length > 0" class="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap sm:overflow-visible">
        <span
          v-for="item in basisItems"
          :key="item"
          class="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-blue-200/70 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs"
        >
          {{ item }}
        </span>
      </div>
      <span v-else class="text-slate-400 text-[11px]">등록된 조건 정보 없음</span>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { calculateAge } from '@/features/youth-policy/composables/useEligibilityCheck'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { formatKRWCompact } from '@/shared/lib/money'

const props = defineProps({
  /** @type {import('vue').PropType<{ birthDate?: string, monthlyIncome?: number } | null>} */
  profile: { type: Object, default: null },
  region: { type: String, default: '전체' },
})

const age = computed(() => calculateAge(props.profile?.birthDate))
const hasProfileBasis = computed(() => age.value != null || props.profile?.monthlyIncome != null)

const basisItems = computed(() => {
  const items = []
  if (age.value != null) items.push(`만 ${age.value}세`)
  if (props.profile?.monthlyIncome != null) {
    items.push(`월소득 ${formatKRWCompact(props.profile.monthlyIncome)}`)
  }
  if (props.region && props.region !== '전체') {
    items.push(props.region)
  }
  return items
})
</script>
