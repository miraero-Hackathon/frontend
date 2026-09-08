<!-- "연동된 저금통 · 계좌" 카드: 클릭하면 이 목표에 묶인 자금 상세 모달을 염 -->
<template>
  <button
    type="button"
    class="group flex flex-col justify-between rounded-xl border border-slate-100 bg-[#f8fbff] p-4 text-left transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:bg-white hover:shadow-sm active:scale-[0.98] cursor-pointer break-keep select-none"
    @click="$emit('open-detail')"
  >
    <div>
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-slate-500">연동된 저금통 · 계좌</p>
        <span class="text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
          자세히 보기 ›
        </span>
      </div>

      <div class="flex flex-col gap-2 pt-2.5">
        <div
          v-for="asset in savingsAssets.slice(0, 2)"
          :key="asset.assetId"
          class="flex items-center gap-2.5"
        >
          <div
            class="flex size-7 items-center justify-center rounded-[10px] bg-slate-100 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]"
          >
            <DashboardIcon
              :name="asset.assetType === 'MONEY_BOX' ? 'piggy-bank' : 'bank'"
              class="size-[18px] drop-shadow-[0_2px_3px_rgba(49,130,246,0.18)]"
              :class="asset.assetType === 'MONEY_BOX' ? 'text-[#3182f6]' : 'text-[#7c5ce7]'"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-semibold text-[#0a192f]">{{ asset.assetName }}</p>
            <p class="truncate text-[10px] text-slate-400">
              {{ asset.bankName }} {{ asset.accountNumberMasked }}
            </p>
          </div>
          <p class="shrink-0 text-xs font-bold tabular-nums text-[#0a192f]">
            {{ formatKRWCompact(asset.balance) }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5">
      <span class="text-xs font-medium text-slate-500">합계 잔액</span>
      <span class="text-sm font-bold tabular-nums text-[#0a192f]">{{ formatKRWCompact(totalBalance) }}</span>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import DashboardIcon from '@/pages/dashboard/components/DashboardIcon.vue'
import { formatKRWCompact } from '@/shared/lib/money'

const props = defineProps({
  assets: {
    type: Array,
    default: () => [],
  },
})
defineEmits(['open-detail'])

const savingsAssets = computed(() =>
  (props.assets ?? []).filter((asset) => asset.assetType === 'MONEY_BOX' || asset.assetType === 'ACCOUNT')
)

const totalBalance = computed(() =>
  savingsAssets.value.reduce((sum, asset) => sum + (asset.balance ?? 0), 0)
)

</script>
