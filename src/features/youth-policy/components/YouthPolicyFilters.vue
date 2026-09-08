<template>
  <div class="sticky top-0 z-20 -mx-4 bg-[#f8fbff] px-4 pb-3 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
    <section class="flex flex-col gap-3 pt-4 sm:flex-row">
      <div class="relative flex-1">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path stroke-linecap="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          v-model="searchInput"
          type="text"
          placeholder="정책명 검색 (예: 취업, 대출, 월세)"
          class="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-9 text-sm outline-none focus:border-primary"
          @keydown.enter="applySearch"
          @blur="applySearch"
        />
        <button
          v-if="searchInput"
          type="button"
          class="absolute right-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="검색어 지우기"
          @mousedown.prevent="clearSearch"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="size-3.5"
          >
            <path stroke-linecap="round" d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="sm:w-48">
        <RegionSelectPopover
          :model-value="youthPolicyStore.region"
          :regions="POLICY_REGIONS"
          @apply="applyRegion"
        />
      </div>
    </section>

    <div class="mt-3 flex items-center justify-between gap-3">
      <nav
        class="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="정책 카테고리"
      >
        <button
          v-for="category in POLICY_CATEGORIES"
          :key="category.id"
          type="button"
          role="tab"
          class="flex shrink-0 items-center justify-center rounded-full border px-4 py-1.5 text-xs sm:text-[13px] font-bold transition-all duration-150 cursor-pointer select-none"
          :class="
            youthPolicyStore.categoryId === category.id
              ? 'border-primary bg-primary text-white shadow-xs'
              : 'border-gray-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary hover:bg-[#f8fbff]'
          "
          :aria-selected="youthPolicyStore.categoryId === category.id"
          @click="applyCategory(category.id)"
        >
          {{ category.label }}
        </button>
      </nav>
      <button
        v-if="youthPolicyStore.hasActiveFilters"
        type="button"
        class="flex shrink-0 items-center gap-1 text-xs font-bold text-gray-400 hover:text-primary"
        @click="resetFilters"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="size-3.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0 1 14.6-4.6M20 15a8 8 0 0 1-14.6 4.6"
          />
        </svg>
        필터 초기화
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import RegionSelectPopover from '@/features/youth-policy/components/RegionSelectPopover.vue'
import {
  POLICY_CATEGORIES,
  POLICY_REGIONS,
} from '@/features/youth-policy/constants/youthPolicy.constants'
import { useYouthPolicyStore } from '@/features/youth-policy/store/youthPolicy.store'

const youthPolicyStore = useYouthPolicyStore()
const emit = defineEmits(['category-applied'])
const searchInput = ref(youthPolicyStore.searchKeyword)

watch(
  () => youthPolicyStore.searchKeyword,
  (keyword) => {
    searchInput.value = keyword
  }
)

function clearSearch() {
  searchInput.value = ''
  youthPolicyStore.setSearchKeyword('')
}

function resetFilters() {
  if (!youthPolicyStore.hasActiveFilters) return
  youthPolicyStore.resetFilters()
}

function applySearch() {
  if (searchInput.value === youthPolicyStore.searchKeyword) return
  youthPolicyStore.setSearchKeyword(searchInput.value)
}

function applyRegion(region) {
  youthPolicyStore.setRegion(region)
}

async function applyCategory(categoryId) {
  await youthPolicyStore.setCategory(categoryId)
  emit('category-applied')
}
</script>
