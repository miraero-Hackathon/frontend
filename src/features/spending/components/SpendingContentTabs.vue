<template>
  <section class="w-full" aria-label="지출 상세 정보">
    <div
      class="grid grid-cols-3 border-b border-[#E2E8F0] min-[1400px]:hidden"
      role="tablist"
      aria-label="지출 상세 탭"
    >
      <button
        v-for="(tab, index) in tabs"
        :id="`spending-tab-${tab.id}`"
        :key="tab.id"
        ref="tabButtons"
        type="button"
        class="relative px-2 py-3 text-sm font-semibold transition-colors"
        :class="activeTab === tab.id ? 'text-[#0066FF]' : 'text-[#64748B]'"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`spending-panel-${tab.id}`"
        :tabindex="activeTab === tab.id ? 0 : -1"
        @click="selectTab(tab.id)"
        @keydown="handleTabKeydown($event, index)"
      >
        {{ tab.label }}

        <span
          v-if="activeTab === tab.id"
          class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#0066FF]"
          aria-hidden="true"
        />
      </button>
    </div>

    <div
      class="mt-5 min-w-0 min-[1400px]:mt-0 min-[1400px]:grid min-[1400px]:grid-cols-2 min-[1400px]:gap-5"
    >
      <div
        id="spending-panel-peers"
        :class="activeTab === 'peers' ? 'block' : 'hidden min-[1400px]:block'"
        :role="isTabbedLayout ? 'tabpanel' : undefined"
        :aria-labelledby="isTabbedLayout ? 'spending-tab-peers' : undefined"
        :tabindex="isTabbedLayout ? 0 : undefined"
        class="min-w-0 min-[1400px]:order-2"
      >
        <SpendingPeerComparisonSection :summary="summary" />
      </div>

      <div
        id="spending-panel-adjustment"
        :class="activeTab === 'adjustment' ? 'block' : 'hidden min-[1400px]:block'"
        :role="isTabbedLayout ? 'tabpanel' : undefined"
        :aria-labelledby="isTabbedLayout ? 'spending-tab-adjustment' : undefined"
        :tabindex="isTabbedLayout ? 0 : undefined"
        class="min-w-0 min-[1400px]:order-1 min-[1400px]:col-span-2"
      >
        <SpendingSimulatorSection :summary="summary" :selected-goal="selectedGoal" />
      </div>

      <div
        id="spending-panel-monthly"
        :class="[activeTab === 'monthly' ? 'block' : 'hidden', 'min-w-0 min-[1400px]:contents']"
        :role="isTabbedLayout ? 'tabpanel' : undefined"
        :aria-labelledby="isTabbedLayout ? 'spending-tab-monthly' : undefined"
        :tabindex="isTabbedLayout ? 0 : undefined"
      >
        <SpendingMonthlyComparisonSection :summary="summary" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import SpendingMonthlyComparisonSection from '@/features/spending/components/SpendingMonthlyComparisonSection.vue'
import SpendingPeerComparisonSection from '@/features/spending/components/SpendingPeerComparisonSection.vue'
import SpendingSimulatorSection from '@/features/spending/components/SpendingSimulatorSection.vue'
import { DEFAULT_SELECTED_GOAL } from '@/features/spending/constants/spending.constants'
import { useMediaQuery } from '@/shared/composables/useMediaQuery'

defineProps({
  summary: {
    type: Object,
    required: true,
  },
  selectedGoal: {
    type: String,
    default: DEFAULT_SELECTED_GOAL,
  },
})

const tabs = [
  { id: 'peers', label: '맞춤 지출 비교' },
  { id: 'adjustment', label: '절감 조정' },
  { id: 'monthly', label: '지난달 비교' },
]

const activeTab = ref('adjustment')
const tabButtons = ref([])

// min-[1400px] 이상에서는 탭 버튼이 숨겨지고 패널 3개가 동시에 노출되는 레이아웃으로 바뀌므로,
// 그 구간에서는 tabpanel 관련 ARIA를 걷어내 숨겨진 탭 버튼을 aria-labelledby로 가리키지 않게 한다.
const isWideLayout = useMediaQuery('(min-width: 1400px)')
const isTabbedLayout = computed(() => !isWideLayout.value)

function selectTab(tabId) {
  if (tabs.some((tab) => tab.id === tabId)) {
    activeTab.value = tabId
  }
}

function handleTabKeydown(event, currentIndex) {
  let nextIndex = currentIndex

  if (event.key === 'ArrowLeft') {
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
  } else if (event.key === 'ArrowRight') {
    nextIndex = (currentIndex + 1) % tabs.length
  } else if (event.key === 'Home') {
    nextIndex = 0
  } else if (event.key === 'End') {
    nextIndex = tabs.length - 1
  } else {
    return
  }

  event.preventDefault()
  selectTab(tabs[nextIndex].id)
  tabButtons.value[nextIndex]?.focus()
}
</script>
