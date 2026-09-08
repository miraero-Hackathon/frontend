<template>
  <div class="page-container-narrow flex flex-col gap-3 pb-10 pt-3 sm:gap-6 sm:pb-14 sm:pt-6">
    <!-- 1. 페이스메이커 전용 저금통 카드 -->
    <section
      class="rounded-[20px] px-5 py-5 text-white shadow-[0_12px_40px_rgba(0,102,255,0.22)] sm:px-6 sm:py-6"
      style="background: linear-gradient(135deg, #0066ff 0%, #66b2ff 100%)"
      aria-labelledby="pacemaker-balance-title"
    >
      <p id="pacemaker-balance-title" class="text-xs font-bold text-white/80">
        페이스메이커 전용 저금통
      </p>
      <p v-if="pacemaker.maskedAccountNumber" class="mt-0.5 text-xs font-medium text-white/70">
        {{ pacemaker.maskedAccountNumber }}
      </p>

      <p class="mt-4 text-[32px] font-bold leading-none tracking-tight sm:text-[34px]">
        {{ formatNumber(pacemaker.moneyBoxBalance)
        }}<span class="ml-1 text-lg font-semibold">원</span>
      </p>
      <p class="mt-1.5 text-xs text-white/70">현재 모인 금액</p>

      <div class="mt-4 grid grid-cols-2 gap-3 border-t border-white/15 pt-3">
        <div>
          <p class="text-[11px] font-medium text-white/70">오늘 자동저축</p>
          <p class="text-sm font-bold">+{{ formatNumber(pacemaker.todaySavingAmount) }}원</p>
        </div>
        <!-- 하루 한도: 영역 자체가 상한선 변경 진입점 -->
        <button
          type="button"
          class="group -my-0.5 -mr-2 flex items-center justify-between gap-2 rounded-xl px-2 py-0.5 text-left transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer select-none"
          aria-label="하루 한도 변경하기"
          @click="$emit('edit-max-amount')"
        >
          <span class="min-w-0">
            <span class="block text-[11px] font-medium text-white/70">하루 한도</span>
            <span class="block text-sm font-bold"> {{ formatNumber(pacemaker.maxAmount) }}원 </span>
          </span>
          <svg
            class="size-3.5 shrink-0 text-white/50 transition group-hover:text-white/80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>

    <!-- 2. 자동저축 상태 카드: 별도 제목 없이 상태 문구가 가장 먼저 보이도록 구성 -->
    <section
      class="flex items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-4 shadow-xs sm:px-6"
      aria-label="자동저축 상태"
    >
      <div class="min-w-0">
        <p
          class="flex items-center gap-1.5 text-sm font-bold"
          :class="isActive ? 'text-primary' : 'text-slate-500'"
        >
          <span
            class="size-1.5 shrink-0 rounded-full"
            :class="isActive ? 'bg-primary' : 'bg-slate-300'"
          />
          {{ isActive ? '자동저축 진행 중' : '자동저축 일시정지' }}
        </p>
        <p class="mt-1 truncate text-xs text-slate-400">
          {{ statusDescription }}
        </p>
        <p
          v-if="pacemakerStore.toggleError"
          class="mt-1 text-xs font-bold text-red-500"
          role="alert"
        >
          상태를 변경하지 못했어요. 다시 시도해 주세요.
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 min-w-[92px] rounded-full px-4 py-2.5 text-xs font-bold shadow-2xs transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        :class="
          isActive
            ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            : 'bg-primary text-white shadow-[0_3px_10px_rgba(0,102,255,0.2)] hover:bg-[#0055dd]'
        "
        :disabled="pacemakerStore.isToggling"
        @click="handleToggle"
      >
        {{ pacemakerStore.isToggling ? '변경 중...' : isActive ? '일시정지' : '다시 시작' }}
      </button>
    </section>

    <!-- 3. 이번 주 자동 저축 기록 -->
    <section
      class="rounded-[20px] border border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5 shadow-xs"
      aria-labelledby="streak-title"
    >
      <div class="mb-4 flex flex-col gap-1">
        <div class="flex items-center justify-between gap-2">
          <button
            type="button"
            class="group inline-flex min-w-0 items-center gap-1.5 text-left outline-none cursor-pointer select-none"
            :aria-label="isMonthlyStreak ? '주간 기록 보기로 전환' : '월간 기록 보기로 전환'"
            @click="isMonthlyStreak = !isMonthlyStreak"
          >
            <h3
              id="streak-title"
              class="truncate text-sm sm:text-base font-bold text-[#0a192f] transition-colors group-hover:text-primary"
            >
              {{ isMonthlyStreak ? '이번 달 자동 저축 기록' : '이번 주 자동 저축 기록' }}
            </h3>
            <span
              class="flex size-5 sm:size-6 shrink-0 items-center justify-center rounded-full bg-slate-100/90 text-slate-500 transition-all duration-200 group-hover:bg-primary/10 group-hover:text-primary"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                class="size-3 sm:size-3.5 transition-transform duration-200"
                :class="isMonthlyStreak ? 'rotate-180 text-primary' : ''"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </button>
          <span
            class="shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap"
            :class="
              pacemaker.currentStreak > 0
                ? 'bg-accent-light text-primary'
                : 'bg-slate-100 text-slate-500'
            "
          >
            연속 {{ formatNumber(pacemaker.currentStreak) }}일
          </span>
        </div>
        <p class="text-[11px] font-medium text-slate-400">
          {{
            isMonthlyStreak ? '클릭하여 이번 주 기록으로 접기' : '클릭하여 이번 달 기록으로 펼치기'
          }}
          · {{ formatTodayLabel }} 기준
        </p>
      </div>

      <div v-if="!isMonthlyStreak" class="grid grid-cols-7 gap-1.5 sm:gap-2">
        <div
          v-for="day in weekDays"
          :key="day.label"
          class="flex flex-col items-center gap-1 sm:gap-1.5"
        >
          <div
            class="flex size-8 sm:size-10 items-center justify-center rounded-full text-xs font-bold transition-all duration-150"
            :class="weekDayClass(day)"
          >
            <svg
              v-if="day.saved"
              class="size-3.5 sm:size-4 stroke-[3]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span v-else class="font-bold text-xs">—</span>
          </div>
          <span
            class="text-[11px] sm:text-xs font-bold"
            :class="day.saved ? 'text-[#0a192f]' : 'text-slate-400'"
          >
            {{ day.label }}
          </span>
        </div>
      </div>
      <div v-else class="flex flex-col gap-2.5">
        <div class="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-slate-400">
          <span v-for="label in WEEKDAY_LABELS" :key="label">{{ label }}</span>
        </div>
        <div class="grid grid-cols-7 gap-x-1.5 gap-y-3">
          <span v-for="(day, index) in monthDays" :key="day?.date ?? `empty-${index}`">
            <span
              v-if="day"
              class="mx-auto flex size-7 items-center justify-center rounded-full text-[10px] font-bold transition-all"
              :class="monthDayClass(day)"
            >
              {{ day.day }}
            </span>
          </span>
        </div>
      </div>

      <div
        class="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-400"
      >
        <span>{{ isMonthlyStreak ? '이번 달 자동 저축' : '이번 주 자동 저축' }}</span>
        <span class="font-bold text-primary">
          {{ isMonthlyStreak ? monthlySuccessCount : weeklySuccessCount }}회 성공
        </span>
      </div>

      <button
        type="button"
        class="mt-3 w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 cursor-pointer select-none"
        @click="openHistoryModal"
      >
        자동저축 내역 보기
      </button>
    </section>

    <!-- 4. 목표별 입금 자산 -->
    <section aria-labelledby="goal-accounts-title">
      <h3
        id="goal-accounts-title"
        class="mb-2.5 px-0.5 text-base font-bold text-[#0a192f] sm:text-lg"
      >
        목표별 입금 자산
      </h3>
      <div
        v-if="pacemakerStore.depositTargetsError"
        class="rounded-[18px] border border-red-200 bg-red-50 px-5 py-6 text-center"
        role="alert"
      >
        <p class="text-sm font-bold text-red-600">입금 대상을 불러오지 못했어요.</p>
        <button
          type="button"
          class="mt-3 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="pacemakerStore.isDepositTargetsLoading"
          @click="retryDepositTargets"
        >
          {{ pacemakerStore.isDepositTargetsLoading ? '불러오는 중...' : '다시 시도' }}
        </button>
      </div>
      <div
        v-else-if="pacemakerStore.isDepositTargetsLoading"
        class="rounded-[18px] border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-400"
        role="status"
      >
        입금 대상을 불러오는 중이에요.
      </div>
      <div v-else-if="accountGroups.length" class="flex flex-col gap-3">
        <article
          v-for="group in accountGroups"
          :key="group.goalId"
          class="flex flex-col gap-3.5 rounded-[18px] border border-slate-200 bg-white px-4 py-4 sm:px-5 shadow-xs"
        >
          <!-- 상단: 목표 아이콘 + 목표명 / 우측 상단 입금하기 -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F2F4F6] text-primary"
              >
                <GoalTypeIcon :goal-type="group.goalType" />
              </div>
              <p class="truncate text-sm font-bold text-[#0a192f]">{{ group.goalName }}</p>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-[0_3px_10px_rgba(0,102,255,0.2)] transition hover:bg-[#0055dd] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              :disabled="!pacemaker.moneyBoxBalance || !selectedDepositAsset(group)?.assetId"
              @click="openDeposit(group)"
            >
              입금하기
            </button>
          </div>

          <!-- 페이스메이커 입금에 사용할 연결 자산 선택 -->
          <div
            class="overflow-hidden rounded-xl border border-slate-200/80 bg-white transition-colors duration-200"
          >
            <button
              :id="assetTriggerId(group.goalId)"
              type="button"
              class="flex w-full items-center justify-between gap-3 bg-slate-50/80 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/15"
              :aria-expanded="expandedGoalId === group.goalId"
              :aria-controls="assetListId(group.goalId)"
              aria-haspopup="listbox"
              @click="toggleAssetList(group)"
              @keydown.enter.prevent="toggleAssetList(group)"
              @keydown.space.prevent="toggleAssetList(group)"
              @keydown.down.prevent="handleAssetTriggerArrow(group, 1)"
              @keydown.up.prevent="handleAssetTriggerArrow(group, -1)"
              @keydown.esc.stop.prevent="closeAssetList(group.goalId)"
            >
              <span class="min-w-0">
                <span class="block text-[11px] font-medium text-slate-400">연결 자산 선택</span>
                <span class="mt-0.5 block truncate text-sm font-bold text-[#0a192f]">
                  {{ depositAssetName(selectedDepositAsset(group)) }}
                </span>
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-4 shrink-0 text-slate-400 transition-transform duration-200"
                :class="expandedGoalId === group.goalId ? 'rotate-180' : ''"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <Transition name="asset-accordion">
              <div
                v-if="expandedGoalId === group.goalId"
                :id="assetListId(group.goalId)"
                class="asset-accordion-panel"
                role="listbox"
                :aria-label="`${group.goalName} 연결 자산 선택`"
              >
                <div class="min-h-0">
                  <div class="border-t border-slate-200/80">
                    <button
                      v-for="(asset, assetIndex) in group.depositAssets ?? []"
                      :id="assetOptionId(group.goalId, assetIndex)"
                      :key="`${asset.assetType}-${asset.assetId}`"
                      type="button"
                      role="option"
                      class="flex w-full items-center justify-between gap-3 px-3 py-3 text-left outline-none transition-colors duration-150"
                      :class="[
                        assetIndex > 0 ? 'border-t border-slate-200/70' : '',
                        isSelectedAsset(group, asset)
                          ? 'bg-primary/[0.06] focus-visible:bg-primary/[0.08]'
                          : 'bg-white hover:bg-slate-50 active:bg-slate-100 focus-visible:bg-slate-50',
                        'focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/15',
                      ]"
                      :aria-selected="isSelectedAsset(group, asset)"
                      :tabindex="focusedAssetIndex === assetIndex ? 0 : -1"
                      @click="selectDepositAsset(group, asset)"
                      @focus="focusedAssetIndex = assetIndex"
                      @keydown.down.prevent="moveAssetFocus(group, assetIndex, 1)"
                      @keydown.up.prevent="moveAssetFocus(group, assetIndex, -1)"
                      @keydown.home.prevent="focusAssetOption(group, 0)"
                      @keydown.end.prevent="
                        focusAssetOption(group, (group.depositAssets?.length ?? 1) - 1)
                      "
                      @keydown.enter.prevent="selectDepositAsset(group, asset)"
                      @keydown.space.prevent="selectDepositAsset(group, asset)"
                      @keydown.esc.stop.prevent="closeAssetList(group.goalId, true)"
                    >
                      <span class="flex min-w-0 items-center gap-2">
                        <span
                          class="flex size-4 shrink-0 items-center justify-center text-primary"
                          aria-hidden="true"
                        >
                          <svg
                            v-if="isSelectedAsset(group, asset)"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="size-3.5"
                          >
                            <path d="m5 12 4 4L19 6" />
                          </svg>
                        </span>
                        <span class="truncate text-sm font-medium text-[#0a192f]">
                          {{ depositAssetName(asset) }}
                        </span>
                      </span>
                      <span class="shrink-0 text-sm font-bold tabular-nums text-[#0a192f]">
                        {{ formatNumber(asset.balance) }}원
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- 현재 금액 / 목표 금액 / 진행률 -->
          <div>
            <div class="flex items-end justify-between gap-3">
              <div class="flex min-w-0 items-end gap-4">
                <div class="min-w-0">
                  <p class="text-[11px] font-medium text-slate-400">현재 금액</p>
                  <p class="mt-0.5 truncate text-sm font-bold text-[#0a192f]">
                    {{ formatNumber(group.totalSavedAmount) }}원
                  </p>
                </div>
                <div class="min-w-0">
                  <p class="text-[11px] font-medium text-slate-400">목표 금액</p>
                  <p class="mt-0.5 truncate text-sm font-bold text-slate-500">
                    {{ formatNumber(group.goalAmount) }}원
                  </p>
                </div>
              </div>
              <p class="shrink-0 text-lg font-bold tabular-nums text-primary">
                {{ goalProgressRate(group) }}%
              </p>
            </div>
            <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-primary transition-all"
                :style="{ width: `${goalProgressRate(group)}%` }"
              />
            </div>
          </div>
        </article>
      </div>
      <div
        v-else
        class="rounded-[18px] border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm text-slate-400"
      >
        입금할 수 있는 목표 자산이 아직 없어요.
      </div>
    </section>

    <PacemakerHistoryModal
      v-model="isHistoryModalOpen"
      :histories="pacemakerStore.histories"
      :is-loading="pacemakerStore.isHistoriesLoading"
      :error="pacemakerStore.historiesError"
      @retry="retryHistories"
    />
    <PacemakerDepositModal
      v-model="isDepositModalOpen"
      :target="selectedDepositTarget"
      :available-balance="pacemaker.moneyBoxBalance"
      :is-submitting="isDepositing"
      :error-message="depositErrorMessage"
      @deposit="handleDeposit"
    />
    <PacemakerDepositSuccessModal
      v-model="isDepositSuccessModalOpen"
      :target="selectedDepositTarget"
      :amount="depositedAmount"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { usePacemakerStore } from '@/features/pacemaker/store/pacemaker.store'
import { usePacemakerDeposit } from '@/features/pacemaker/composables/usePacemakerDeposit'
import PacemakerDepositModal from '@/features/pacemaker/components/PacemakerDepositModal.vue'
import PacemakerDepositSuccessModal from '@/features/pacemaker/components/PacemakerDepositSuccessModal.vue'
import PacemakerHistoryModal from '@/features/pacemaker/components/PacemakerHistoryModal.vue'
import { useModal } from '@/shared/composables/useModal'
import { useLocalDateClock } from '@/shared/composables/useLocalDateClock'
import GoalTypeIcon from '@/shared/ui/GoalTypeIcon.vue'

defineEmits(['edit-max-amount'])

const DAY_OF_WEEK_LABEL = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
}
const WEEK_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']
// JS Date#getDay()는 일요일이 0이라 dayOfWeek 이름과 매칭하기 위한 순서.
const DAY_OF_WEEK_BY_INDEX = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]

const pacemakerStore = usePacemakerStore()
const {
  selectedDepositTarget,
  depositedAmount,
  isDepositing,
  depositErrorMessage,
  openDeposit: openDepositTarget,
  submitDeposit,
  retryDepositTargets,
  retryHistories,
} = usePacemakerDeposit()
const selectedAssetIds = ref({})
const expandedGoalId = ref(null)
const focusedAssetIndex = ref(-1)
const isMonthlyStreak = ref(false)
const { isOpen: isDepositModalOpen, open: openDepositModal } = useModal()
const { isOpen: isDepositSuccessModalOpen, open: openDepositSuccessModal } = useModal()
const { isOpen: isHistoryModalOpen, open: openHistoryModal } = useModal()
const { currentDate, localDateKey: referenceDate } = useLocalDateClock()

const pacemaker = computed(() => pacemakerStore.pacemakerView)
const isActive = computed(() => pacemaker.value.status === 'ACTIVE')
const weeklyStreak = computed(() => pacemaker.value.weeklyStreak ?? [])
// 서버는 오늘 날짜를 별도로 내려주지 않으므로 자정에 갱신되는 로컬 날짜를 기준일로 쓴다.
const todayDayOfWeek = computed(() => DAY_OF_WEEK_BY_INDEX[currentDate.value.getDay()])

const weekDays = computed(() => {
  const byDay = new Map(weeklyStreak.value.map((day) => [day.dayOfWeek, day]))
  return WEEK_ORDER.map((dayOfWeek) => ({
    saved: byDay.get(dayOfWeek)?.saved === true,
    label: DAY_OF_WEEK_LABEL[dayOfWeek],
    isToday: dayOfWeek === todayDayOfWeek.value,
  }))
})
const weeklySuccessCount = computed(() => weekDays.value.filter((day) => day.saved).length)

// 서버 히스토리는 SAVED/SKIPPED만 내려주고, 그 외 날짜(시작 전이거나 아직 기록이 없는 날)는
// 실제 실패가 아니므로 별도 상태(NO_DATA)로 구분해 실패처럼 보이지 않게 한다.
const monthDays = computed(() => {
  const [year, month] = referenceDate.value.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  const historyByDate = new Map(pacemakerStore.histories.map((item) => [item.date, item.status]))
  const days = Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const isFuture = date > referenceDate.value
    const historyStatus = historyByDate.get(date)
    const status = isFuture ? 'FUTURE' : (historyStatus ?? 'NO_DATA')
    return {
      day,
      date,
      status,
      isToday: date === referenceDate.value,
      isFuture,
    }
  })
  const firstDay = new Date(year, month - 1, 1).getDay()
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1
  return [...Array(mondayOffset).fill(null), ...days]
})

const monthlySuccessCount = computed(() => {
  const currentMonth = referenceDate.value.slice(0, 7)
  return pacemakerStore.histories.filter(
    (item) => item.status === 'SAVED' && item.date?.startsWith(currentMonth)
  ).length
})

const formatTodayLabel = computed(() => {
  const [, month, day] = referenceDate.value.split('-')
  return `${month}월 ${day}일`
})

const statusDescription = computed(() =>
  isActive.value ? '꾸준히 목표를 향해 모으고 있어요' : '다시 시작하면 모으기를 이어가요'
)

const accountGroups = computed(() => pacemakerStore.depositTargets)

function goalProgressRate(group) {
  const goalAmount = Number(group?.goalAmount ?? 0)
  if (goalAmount <= 0) return 0
  const saved = Number(group?.totalSavedAmount ?? 0)
  return Math.min(100, Math.max(0, Math.round((saved / goalAmount) * 100)))
}

// 계좌/저금통은 별도 ID 체계라 assetId만으로는 충돌할 수 있어 assetType까지 묶어 키로 쓴다.
function assetKey(asset) {
  return asset ? `${asset.assetType}-${asset.assetId}` : null
}

function selectedDepositAsset(group) {
  const selectedKey = selectedAssetIds.value[group.goalId]
  return (
    group.depositAssets?.find((asset) => assetKey(asset) === selectedKey) ??
    group.depositAssets?.[0]
  )
}

function isSelectedAsset(group, asset) {
  return assetKey(selectedDepositAsset(group)) === assetKey(asset)
}

// 카드에 표시할 계좌명을 계좌 상세 API(/accounts/{accountId})에서 조회해 캐시해둠
watch(
  accountGroups,
  (groups) => {
    groups.forEach((group) => {
      group.depositAssets?.forEach((asset) => {
        if (asset.assetType === 'ACCOUNT' && asset.assetId) {
          pacemakerStore.fetchAccountDetail(asset.assetId)
        }
      })
    })
  },
  { immediate: true }
)

// LOAN/ACCOUNT/MONEY_BOX가 같은 숫자 assetId 공간을 공유할 수 있어(서버 스펙 확인됨),
// ACCOUNT 전용 캐시(accountDetails)는 assetType이 ACCOUNT일 때만 조회한다.
function depositAssetName(asset) {
  if (!asset) return '입금 자산'
  if (asset.assetType === 'MONEY_BOX') return '저금통'
  if (asset.assetType === 'LOAN') return asset.financialInstitutionName ?? '대출 계좌'
  const accountName = pacemakerStore.accountDetails[asset.assetId]?.accountName
  return accountName ?? asset.financialInstitutionName ?? '입금 계좌'
}

function assetTriggerId(goalId) {
  return `linked-assets-trigger-${goalId}`
}

function assetListId(goalId) {
  return `linked-assets-${goalId}`
}

function assetOptionId(goalId, assetIndex) {
  return `linked-assets-${goalId}-option-${assetIndex}`
}

function selectedAssetIndex(group) {
  const selectedKey = assetKey(selectedDepositAsset(group))
  const selectedIndex = group.depositAssets?.findIndex((asset) => assetKey(asset) === selectedKey)
  return Math.max(0, selectedIndex ?? 0)
}

async function focusAssetOption(group, assetIndex) {
  const assetCount = group.depositAssets?.length ?? 0
  if (assetCount === 0) return

  const nextIndex = Math.min(Math.max(assetIndex, 0), assetCount - 1)
  focusedAssetIndex.value = nextIndex
  await nextTick()
  document.getElementById(assetOptionId(group.goalId, nextIndex))?.focus()
}

async function openAssetList(group) {
  if (!(group.depositAssets?.length > 0)) return
  expandedGoalId.value = group.goalId
  await focusAssetOption(group, selectedAssetIndex(group))
}

function toggleAssetList(group) {
  if (expandedGoalId.value === group.goalId) {
    closeAssetList(group.goalId)
    return
  }
  openAssetList(group)
}

function handleAssetTriggerArrow(group, direction) {
  if (expandedGoalId.value !== group.goalId) {
    openAssetList(group)
    return
  }
  moveAssetFocus(group, focusedAssetIndex.value, direction)
}

function moveAssetFocus(group, currentIndex, direction) {
  const assetCount = group.depositAssets?.length ?? 0
  if (assetCount === 0) return
  const nextIndex = (currentIndex + direction + assetCount) % assetCount
  focusAssetOption(group, nextIndex)
}

async function closeAssetList(goalId, returnFocus = false) {
  if (expandedGoalId.value !== goalId) return
  expandedGoalId.value = null
  focusedAssetIndex.value = -1
  if (!returnFocus) return

  await nextTick()
  document.getElementById(assetTriggerId(goalId))?.focus()
}

function selectDepositAsset(group, asset) {
  selectedAssetIds.value = { ...selectedAssetIds.value, [group.goalId]: assetKey(asset) }
  closeAssetList(group.goalId, true)
}

function openDeposit(group) {
  openDepositTarget(group, selectedDepositAsset(group))
  openDepositModal()
}

function handleDeposit(payload) {
  submitDeposit(payload, () => {
    isDepositModalOpen.value = false
    openDepositSuccessModal()
  })
}

async function handleToggle() {
  await pacemakerStore.togglePacemaker()
}

function formatNumber(amount) {
  return Number(amount ?? 0).toLocaleString('ko-KR')
}

// 오늘 날짜는 저축 여부와 무관하게 테두리로 구분해 "오늘이 어디인지" 바로 보이게 한다.
function weekDayClass(day) {
  if (day.saved) {
    return day.isToday
      ? 'bg-primary text-white shadow-xs scale-105 ring-2 ring-offset-2 ring-primary/40'
      : 'bg-primary text-white shadow-xs scale-105'
  }
  if (day.isToday) return 'border-2 border-primary bg-white text-primary'
  return 'bg-slate-100 text-slate-300'
}

function monthDayClass(day) {
  if (day.status === 'SAVED') return 'bg-primary text-white'
  if (day.isToday) return 'border border-primary text-primary'
  if (day.status === 'FUTURE') return 'text-slate-300'
  // SKIPPED: 조건상 저축하지 않은 정상 케이스라 실패(NO_DATA)와 다른 점선 스타일로 구분한다.
  if (day.status === 'SKIPPED') return 'border border-dashed border-slate-300 text-slate-400'
  // NO_DATA: 시작 전이거나 기록이 없는 날 — 실패처럼 보이지 않도록 옅게만 표시한다.
  return 'text-slate-300'
}
</script>

<style scoped>
.asset-accordion-panel {
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
}

.asset-accordion-enter-active,
.asset-accordion-leave-active {
  transition:
    grid-template-rows 180ms ease,
    opacity 160ms ease;
}

.asset-accordion-enter-from,
.asset-accordion-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .asset-accordion-enter-active,
  .asset-accordion-leave-active {
    transition: none;
  }
}
</style>
