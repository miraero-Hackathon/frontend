<template>
  <div class="min-h-full bg-[#f8fafc] pb-16">
    <div class="page-container pb-10 pt-4 sm:pb-14 sm:pt-6">
      <YouthPolicyFilters @category-applied="scrollToPolicyList" />
      <RecommendedPoliciesSection @view-detail="openDetail" />
      <PolicyListSection ref="policyListSectionRef" @view-detail="openDetail" />
    </div>

    <button
      v-if="showScrollTop"
      type="button"
      class="fixed bottom-8 right-8 z-30 hidden size-11 items-center justify-center rounded-full bg-white text-primary shadow-[0_4px_16px_rgba(10,25,47,0.16)] transition-all duration-200 ease-out hover:-translate-y-1 hover:bg-[#eaf2ff] hover:shadow-[0_8px_20px_rgba(0,102,255,0.2)] sm:flex"
      aria-label="맨 위로"
      @click="scrollToTop"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="size-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="m5 15 7-7 7 7" />
      </svg>
    </button>

    <PolicyDetailModal
      :open="isDetailOpen"
      :policy="youthPolicyStore.selectedPolicy"
      :is-loading="youthPolicyStore.isDetailLoading"
      :has-error="Boolean(youthPolicyStore.detailError)"
      @close="closeDetail"
      @retry="detailPolicyId && youthPolicyStore.fetchPolicyDetail(detailPolicyId)"
    />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  PolicyDetailModal,
  PolicyListSection,
  RecommendedPoliciesSection,
  YouthPolicyFilters,
  useYouthPolicyStore,
} from '@/features/youth-policy'
import { useMypageStore } from '@/features/mypage'

const youthPolicyStore = useYouthPolicyStore()
const mypageStore = useMypageStore()
const isDetailOpen = ref(false)
const detailPolicyId = ref(null)
const showScrollTop = ref(false)
const policyListSectionRef = ref(null)
let scrollContainer = null

function handleScroll() {
  showScrollTop.value = Boolean(
    scrollContainer && scrollContainer.scrollTop > scrollContainer.clientHeight * 0.5
  )
}

function scrollToTop() {
  scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToPolicyList() {
  policyListSectionRef.value?.scrollToList()
}

onMounted(() => {
  youthPolicyStore.fetchPolicies()
  youthPolicyStore.fetchRecommendedPolicies()
  mypageStore.ensureProfile()

  scrollContainer = document.querySelector('main')
  scrollContainer?.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  scrollContainer?.removeEventListener('scroll', handleScroll)
})

async function openDetail(youthPolicyId) {
  detailPolicyId.value = youthPolicyId
  isDetailOpen.value = true
  await youthPolicyStore.fetchPolicyDetail(youthPolicyId)
}

function closeDetail() {
  isDetailOpen.value = false
  detailPolicyId.value = null
  youthPolicyStore.clearSelectedPolicy()
}
</script>
