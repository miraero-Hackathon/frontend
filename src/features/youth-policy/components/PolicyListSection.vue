<template>
  <section
    ref="sectionRef"
    class="mt-8 scroll-mt-36 transition-all duration-200"
  >
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-lg font-bold text-gray-900">
        {{ listTitle }}
        <span class="text-gray-400">({{ youthPolicyStore.totalElements }})</span>
      </h2>
    </div>

    <div
      v-if="youthPolicyStore.isLoading && youthPolicyStore.policies.length === 0"
      class="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4"
    >
      <div
        v-for="index in 6"
        :key="index"
        class="h-[170px] animate-pulse rounded-2xl border border-gray-100 bg-white p-5"
      >
        <div class="h-4 w-20 rounded bg-gray-100" />
        <div class="mt-3 h-5 w-2/3 rounded bg-gray-100" />
        <div class="mt-3 h-3 w-full rounded bg-gray-100" />
      </div>
    </div>

    <div
      v-else-if="youthPolicyStore.error"
      class="mt-4 flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white text-center"
    >
      <p class="text-sm font-bold text-gray-900">정책 목록을 불러오지 못했어요</p>
      <button
        type="button"
        class="mt-4 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white"
        @click="youthPolicyStore.fetchPolicies(youthPolicyStore.page)"
      >
        다시 시도
      </button>
    </div>

    <div
      v-else-if="youthPolicyStore.policies.length === 0"
      class="mt-4 flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white text-center"
    >
      <p class="text-sm font-bold text-gray-900">조건에 맞는 정책이 없어요</p>
      <p class="mt-1 text-xs text-gray-400">검색어나 필터를 바꿔서 다시 찾아보세요.</p>
    </div>

    <div v-else class="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
      <PolicyListCard
        v-for="policy in youthPolicyStore.policies"
        :key="policy.youthPolicyId"
        :policy="policy"
        @view-detail="emit('view-detail', $event)"
      />
    </div>

    <div
      v-if="youthPolicyStore.policies.length > 0 && youthPolicyStore.totalPages > 1"
      class="mt-7 flex justify-center"
      aria-label="정책 목록 페이지"
    >
      <div class="flex items-center gap-3 sm:hidden">
        <button
          type="button"
          class="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 transition-colors disabled:cursor-default disabled:opacity-30 disabled:pointer-events-none"
          :disabled="youthPolicyStore.page <= 1 || youthPolicyStore.isLoading"
          @click="changePage(youthPolicyStore.page - 1)"
        >
          이전
        </button>
        <span class="min-w-16 text-center text-sm font-bold text-gray-500">
          {{ youthPolicyStore.page }} / {{ youthPolicyStore.totalPages }}
        </span>
        <button
          type="button"
          class="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 transition-colors disabled:cursor-default disabled:opacity-30 disabled:pointer-events-none"
          :disabled="youthPolicyStore.isLastPage || youthPolicyStore.isLoading"
          @click="changePage(youthPolicyStore.page + 1)"
        >
          다음
        </button>
      </div>

      <div class="hidden items-center gap-1.5 sm:flex">
        <button
          type="button"
          class="flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors disabled:cursor-default disabled:opacity-30 disabled:pointer-events-none"
          aria-label="이전 페이지"
          :disabled="youthPolicyStore.page <= 1 || youthPolicyStore.isLoading"
          @click="changePage(youthPolicyStore.page - 1)"
        >
          ←
        </button>
        <button
          v-for="pageNumber in visiblePageNumbers"
          :key="pageNumber"
          type="button"
          class="flex size-9 items-center justify-center rounded-lg border text-sm font-bold transition-colors disabled:cursor-default"
          :class="
            pageNumber === youthPolicyStore.page
              ? 'border-primary bg-primary text-white'
              : 'border-gray-200 bg-white text-gray-500 hover:border-primary/40 hover:text-primary'
          "
          :aria-current="pageNumber === youthPolicyStore.page ? 'page' : undefined"
          :disabled="youthPolicyStore.isLoading"
          @click="changePage(pageNumber)"
        >
          {{ pageNumber }}
        </button>
        <button
          type="button"
          class="flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors disabled:cursor-default disabled:opacity-30 disabled:pointer-events-none"
          aria-label="다음 페이지"
          :disabled="youthPolicyStore.isLastPage || youthPolicyStore.isLoading"
          @click="changePage(youthPolicyStore.page + 1)"
        >
          →
        </button>
      </div>
    </div>

    <div
      v-if="!youthPolicyStore.error"
      class="mt-8 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-400"
    >
      <span>더 많은 청년정책은 온통청년에서 확인할 수 있어요.</span>
      <a
        href="https://www.youthcenter.go.kr"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-0.5 font-bold text-primary hover:text-blue-700 transition-colors"
      >
        온통청년 바로가기
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          class="size-3"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M14 5h5v5M19 5l-9 9" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 13v6H5V5h6" />
        </svg>
      </a>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import PolicyListCard from '@/features/youth-policy/components/PolicyListCard.vue'
import { POLICY_CATEGORY_IDS } from '@/features/youth-policy/constants/youthPolicy.constants'
import { useYouthPolicyStore } from '@/features/youth-policy/store/youthPolicy.store'

const emit = defineEmits(['view-detail'])
const youthPolicyStore = useYouthPolicyStore()
const sectionRef = ref(null)

defineExpose({ scrollToList })

const listTitle = computed(() =>
  youthPolicyStore.categoryId === POLICY_CATEGORY_IDS.ALL
    ? '정책 목록'
    : `${youthPolicyStore.activeCategory.label} 정책 목록`
)

const visiblePageNumbers = computed(() => {
  const total = youthPolicyStore.totalPages
  const current = youthPolicyStore.page
  const visibleCount = Math.min(5, total)
  const start = Math.min(Math.max(1, current - 2), Math.max(1, total - visibleCount + 1))
  return Array.from({ length: visibleCount }, (_, index) => start + index)
})

function scrollToList() {
  sectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function changePage(targetPage) {
  if (
    youthPolicyStore.isLoading ||
    targetPage === youthPolicyStore.page ||
    targetPage < 1 ||
    targetPage > youthPolicyStore.totalPages
  ) {
    return
  }

  await youthPolicyStore.fetchPolicies(targetPage)
  scrollToList()
}
</script>
