<!-- 전체 정책 목록용 가로형 카드. 추천 카드와 구분해 탐색에 필요한 정보만 빠르게 훑게 한다. -->
<template>
  <button
    type="button"
    class="group relative flex min-h-[176px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white px-5 py-4 text-left shadow-xs transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-md active:scale-[0.98] cursor-pointer select-none"
    @click="emit('view-detail', policy.youthPolicyId)"
  >
    <!-- 상단: 키워드 태그 배지 + 마감일 배지 -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex min-w-0 flex-wrap items-center gap-1.5">
        <span
          v-for="keyword in keywordTags"
          :key="keyword"
          class="truncate rounded-md bg-[#eef5ff] px-2.5 py-0.5 text-[11px] font-bold text-primary"
        >
          {{ keyword }}
        </span>
      </div>
      <span
        class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
        :class="deadlineBadge.className"
      >
        {{ deadlineBadge.label }}
      </span>
    </div>

    <h3
      class="mt-3 line-clamp-2 text-base font-bold leading-6 text-gray-900 group-hover:text-primary transition-colors"
    >
      {{ policy.policyName }}
    </h3>

    <div class="mt-auto flex items-end justify-between gap-4 pt-4">
      <dl class="min-w-0 space-y-1.5 text-xs">
        <div v-if="policy.providerInstitutionName" class="flex min-w-0 gap-2">
          <dt class="shrink-0 font-semibold text-slate-400">제공기관</dt>
          <dd class="truncate font-bold text-slate-600">{{ policy.providerInstitutionName }}</dd>
        </div>
        <div v-if="policy.applicationPeriod" class="flex min-w-0 gap-2">
          <dt class="shrink-0 font-semibold text-slate-400">신청기간</dt>
          <dd class="truncate font-bold text-slate-600">{{ policy.applicationPeriod }}</dd>
        </div>
      </dl>

      <span
        class="shrink-0 inline-flex items-center gap-0.5 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
      >
        자세히 보기 ›
      </span>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** @type {import('vue').PropType<import('@/features/youth-policy/api/youthPolicy.api').YouthPolicyListItem>} */
  policy: { type: Object, required: true },
})
const emit = defineEmits(['view-detail'])

const keywordTags = computed(() => {
  const tags = (props.policy.policyKeyword || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  return tags.length > 0 ? tags : (props.policy.policyCategory ? [props.policy.policyCategory] : [])
})

const deadlineBadge = computed(() => {
  const period = props.policy.applicationPeriod ?? ''
  if (period.includes('상시')) {
    return { label: '상시 모집', className: 'bg-slate-100 text-slate-600' }
  }

  const dates = period.match(/\d{4}-\d{2}-\d{2}/g)
  const endDateText = dates?.at(-1)
  if (!endDateText) return { label: '기간 확인', className: 'bg-slate-100 text-slate-500' }

  const [year, month, day] = endDateText.split('-').map(Number)
  const endDate = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / 86400000)

  if (daysLeft < 0) return { label: '마감', className: 'bg-slate-100 text-slate-400' }
  if (daysLeft === 0) return { label: '오늘 마감', className: 'bg-red-50 text-red-600 font-bold' }
  if (daysLeft <= 7)
    return { label: `마감 D-${daysLeft}`, className: 'bg-orange-50 text-orange-600 font-bold' }
  return { label: `D-${daysLeft}`, className: 'bg-slate-100 text-slate-700 font-bold' }
})
</script>
