<!-- 청년정책 상세 모달 -->
<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @mousedown.self="emit('close')"
    >
      <section
        class="flex max-h-[calc(100vh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-detail-title"
      >
        <header class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 id="policy-detail-title" class="text-sm font-bold text-primary">청년 정책 상세</h2>
          <button
            type="button"
            class="flex size-8 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-500"
            aria-label="닫기"
            @click="emit('close')"
          >
            ×
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <LoadingSpinner
            v-if="isLoading"
            message="정책 정보를 불러오고 있어요"
            container-class="min-h-[280px]"
          />

          <div v-else-if="hasError" class="flex min-h-[280px] flex-col items-center justify-center text-center">
            <p class="text-sm font-bold text-gray-900">상세 정보를 불러오지 못했어요</p>
            <button
              type="button"
              class="mt-4 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white"
              @click="emit('retry')"
            >
              다시 시도
            </button>
          </div>

          <div v-else-if="policy">
            <div class="flex flex-wrap items-center gap-1.5 mb-2">
              <span
                v-for="keyword in keywordTags"
                :key="keyword"
                class="rounded-md bg-[#eef5ff] px-2.5 py-1 text-[11px] font-bold text-primary"
              >
                {{ keyword }}
              </span>
              <span
                v-if="policy.providerInstitutionName"
                class="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600"
              >
                {{ policy.providerInstitutionName }}
              </span>
            </div>
            <h3 class="mt-2 text-xl font-bold text-[#0a192f]">{{ policy.policyName }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-500">{{ policy.policyDescription }}</p>

            <div v-if="supportItems.length" class="mt-5 rounded-2xl bg-accent-light px-5 py-4">
              <p class="text-xs font-bold text-primary/70">지원 내용</p>
              <ul class="mt-2 space-y-2">
                <li
                  v-for="item in supportItems"
                  :key="item"
                  class="flex items-start gap-2 text-sm font-bold leading-6 text-primary"
                >
                  <span class="mt-[9px] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <dl class="mt-5 divide-y divide-gray-100 rounded-2xl border border-gray-100 px-4">
              <div
                v-for="item in infoRows"
                :key="item.label"
                class="grid grid-cols-[64px_minmax(0,1fr)] gap-3 py-3.5 sm:grid-cols-[96px_minmax(0,1fr)]"
              >
                <dt class="whitespace-nowrap pt-0.5 text-xs text-gray-400">{{ item.label }}</dt>
                <dd>
                  <p
                    v-if="item.items.length === 1"
                    class="text-sm font-bold leading-6 text-gray-700 [text-wrap:pretty]"
                  >
                    {{ item.items[0] }}
                  </p>
                  <ul v-else class="space-y-1.5">
                    <li
                      v-for="value in item.items"
                      :key="value"
                      class="flex items-start gap-2 text-sm font-bold leading-6 text-gray-700"
                    >
                      <span class="mt-[10px] size-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                      <span class="[text-wrap:pretty]">{{ value }}</span>
                    </li>
                  </ul>
                </dd>
              </div>
            </dl>

            <a
              v-if="policy.applicationUrl"
              :href="policy.applicationUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-5 flex items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-white"
            >
              신청하러 가기
            </a>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import LoadingSpinner from '@/shared/ui/LoadingSpinner.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** @type {import('vue').PropType<import('@/features/youth-policy/api/youthPolicy.api').YouthPolicyDetail | null>} */
  policy: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
  hasError: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'retry'])

const keywordTags = computed(() => {
  if (!props.policy) return []
  const tags = (props.policy.policyKeyword || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  return tags.length > 0 ? tags : (props.policy.policyCategory ? [props.policy.policyCategory] : [])
})

const supportItems = computed(() => splitDetailItems(props.policy?.supportContent))

const infoRows = computed(() => {
  if (!props.policy) return []
  return [
    { label: '신청 기간', value: props.policy.applicationPeriod || '별도 공지' },
    { label: '지원 대상', value: props.policy.qualification || '정보 없음' },
    { label: '소득 조건', value: props.policy.incomeConditionText || '별도 조건 없음' },
    { label: '신청 방법', value: props.policy.applicationMethod || '정보 없음' },
  ]
    .filter((row) => row.value)
    .map((row) => ({ ...row, items: splitDetailItems(row.value) }))
})

function splitDetailItems(value) {
  if (!value) return []

  return String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/\r?\n|;\s*|(?=[①-⑳])|(?=\s*[•●○▪■▶※]\s*)/)
    .map((item) =>
      item
        .trim()
        .replace(/^(?:[-*•●○▪■▶※]|[①-⑳]|\d+[.)])\s*/, '')
        .trim()
    )
    .filter(Boolean)
}
</script>
