<template>
  <MypageSection title="마이데이터 연동 상태" heading-id="mydata-section-title">
    <div
      v-if="loading && connections.length === 0"
      class="mb-5 flex flex-col"
      aria-label="연결 기관 불러오는 중"
    >
      <div v-for="index in 3" :key="index" class="flex min-h-[57px] items-center gap-4 py-3">
        <span class="size-8 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <span class="h-4 flex-1 animate-pulse rounded bg-slate-100" />
        <span class="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>

    <div
      v-else-if="loadError && connections.length === 0"
      class="mb-5 rounded-2xl bg-red-50 px-4 py-4 text-sm text-red-700"
      role="alert"
    >
      연결 기관을 불러오지 못했습니다. 아래 버튼을 눌러 다시 시도해주세요.
    </div>

    <div
      v-else-if="connections.length === 0"
      class="mb-5 rounded-2xl bg-[#f4f8ff] px-4 py-5 text-center text-sm text-slate-500"
    >
      연결된 마이데이터 기관이 없습니다.
    </div>

    <div v-else class="mb-5 flex flex-col">
      <div
        v-for="(institution, index) in institutions"
        :key="institution.id"
        class="flex min-h-[57px] items-center gap-3 py-3 sm:gap-4"
        :class="index < institutions.length - 1 ? 'border-b border-[#f4f8ff]' : ''"
      >
        <div
          class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#eaf2ff]"
          aria-hidden="true"
        >
          <img src="@/assets/icons/bank-account.svg" alt="" class="size-4" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-[#0a192f]">{{ institution.name }}</p>
          <p class="truncate text-xs text-slate-400">
            마지막 동기화 {{ institution.lastSyncedLabel }}
          </p>
        </div>
        <span
          class="flex shrink-0 items-center gap-1.5 text-xs font-medium"
          :class="institution.expired ? 'text-amber-600' : 'text-emerald-600'"
        >
          <i
            class="size-2 rounded-full"
            :class="institution.expired ? 'bg-amber-500' : 'bg-emerald-600'"
            aria-hidden="true"
          />
          {{ institution.expired ? '만료됨' : '연동됨' }}
        </span>
      </div>
    </div>
    <button
      type="button"
      class="flex w-full items-center justify-center gap-2 rounded-[14px] border px-4 py-3 text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-60"
      :class="
        syncError
          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
          : 'border-[#c5dcff] bg-[#f4f8ff] text-primary hover:bg-[#eaf2ff]'
      "
      :disabled="loading || syncing"
      :aria-busy="syncing"
      @click="handleAction"
    >
      <span v-if="showSyncing" class="mypage-spinner" aria-hidden="true" />
      {{ showSyncing ? '동기화 중...' : idleButtonLabel }}
    </button>
  </MypageSection>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { formatDateTime } from '@/shared/lib/date'
import MypageSection from '@/features/mypage/components/MypageSection.vue'

const props = defineProps({
  connections: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  syncing: { type: Boolean, default: false },
  loadError: { type: Object, default: null },
  syncError: { type: Object, default: null },
})

const emit = defineEmits(['sync', 'retry-load'])
const showSyncing = ref(false)
const institutions = computed(() =>
  props.connections.map((connection) => ({
    id: connection.connectionId,
    name: connection.institutionName,
    lastSyncedLabel: connection.lastSyncedAt
      ? formatDateTime(connection.lastSyncedAt)
      : '기록 없음',
    expired: isExpired(connection.expiresAt),
  }))
)
const idleButtonLabel = computed(() => {
  if (props.syncError) return '다시 시도하기'
  if (props.loadError && props.connections.length === 0) return '연결 기관 다시 불러오기'
  return '마이데이터 다시 동기화'
})
let syncingIndicatorTimer

watch(
  () => props.syncing,
  (syncing) => {
    window.clearTimeout(syncingIndicatorTimer)
    showSyncing.value = false

    if (!syncing) return
    syncingIndicatorTimer = window.setTimeout(() => {
      if (props.syncing) showSyncing.value = true
    }, 300)
  },
  { immediate: true }
)

function isExpired(value) {
  if (!value) return false
  const expiresAt = new Date(value).getTime()
  return Number.isFinite(expiresAt) && expiresAt < Date.now()
}

function handleAction() {
  if (props.loadError && props.connections.length === 0 && !props.syncError) {
    emit('retry-load')
    return
  }

  emit('sync')
}

onBeforeUnmount(() => window.clearTimeout(syncingIndicatorTimer))
</script>
