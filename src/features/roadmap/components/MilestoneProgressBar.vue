<!-- 목표 진행 로드맵: 전체 마일스톤 진행바 + 페이스 상태별 주인공-콜리 랠리 주행 (소프트 스카이블루 테마, 정적 클린 뷰) -->
<template>
  <div class="w-full">
    <!-- 모바일: 단계, 주행 상황, 다음 마일스톤을 하나의 카드로 단순화 -->
    <section class="sm:hidden" aria-label="현재 마일스톤 진행 상황">
      <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div class="relative h-44 bg-gradient-to-b from-slate-50/80 to-white">
          <!-- 현재 단계와 전체 진행률 -->
          <div class="absolute inset-x-0 top-0 z-30 px-4 pt-3.5">
            <div class="flex items-center justify-between text-[11px] font-bold">
              <span class="text-primary">{{ activeMilestoneIndex + 1 }}단계</span>
              <span class="text-slate-400">
                {{ activeMilestoneIndex + 1 }} / {{ milestones.length }}
              </span>
            </div>
            <div class="mt-2 h-1 overflow-hidden rounded-full bg-slate-200/80">
              <div
                class="h-full rounded-full bg-primary transition-[width] duration-700"
                :style="{ width: `${mobileOverallProgress}%` }"
              />
            </div>
          </div>

          <!-- 모바일 줌인 도로 트랙 -->
          <svg
            class="absolute inset-x-0 bottom-0 h-24 w-full"
            viewBox="0 0 390 96"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="mobileTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#0064ff" />
                <stop offset="100%" stop-color="#38bdf8" />
              </linearGradient>
            </defs>
            <path
              d="M-18 65 C75 52 135 74 210 62 C286 50 334 56 408 43"
              stroke="#dbeafe"
              stroke-width="24"
              stroke-linecap="round"
            />
            <path
              d="M-18 65 C75 52 135 74 210 62 C286 50 334 56 408 43"
              stroke="#ffffff"
              stroke-width="17"
              stroke-linecap="round"
            />
            <path
              d="M-18 65 C75 52 135 74 210 62 C286 50 334 56 408 43"
              stroke="#eff6ff"
              stroke-width="11"
              stroke-linecap="round"
            />
            <path
              d="M-18 65 C75 52 135 74 210 62 C286 50 334 56 408 43"
              pathLength="100"
              stroke="url(#mobileTrackGrad)"
              stroke-width="7"
              stroke-linecap="round"
              class="transition-all duration-500 ease-out"
              :stroke-dasharray="`${mobileTrackProgress} 100`"
            />
          </svg>

          <!-- 도착점 마커 -->
          <span
            class="absolute bottom-[44px] right-4 z-10 flex size-5 items-center justify-center rounded-full border-2 border-primary bg-white shadow-sm ring-2 ring-primary/10"
            aria-hidden="true"
          >
            <span class="size-2 rounded-full bg-primary" />
          </span>

          <!-- A. 모바일 순항 중 (ON_TRACK): 주인공 항상 최상위(z-20), 콜리 뒤쪽(z-10) -->
          <div
            v-if="paceState === PACE_STATE.ON_TRACK"
            class="absolute bottom-[28px] flex -translate-x-1/2 items-end transition-[left] duration-500 pointer-events-none z-20"
            :style="{ left: `${Math.max(24, Math.min(74, mobilePlayerPosition))}%` }"
          >
            <!-- 1. 주인공 캐릭터 (항상 맨 앞 z-20) -->
            <img
              :src="goalCharacterImage"
              alt="주인공 위치"
              class="h-[60px] w-auto drop-shadow-md z-20"
              :style="goalCharacterFootStyle"
            />

            <!-- 2. 페이스메이커 콜리 (주인공 뒤 레이어 z-10) + 말풍선 -->
            <div class="relative -ml-[20px] flex flex-col items-start pl-1 z-10">
              <!-- 콜리 머리 위 스마트 말풍선 (세모 왼쪽) -->
              <div class="relative -mb-1 flex flex-col items-start">
                <div
                  class="relative rounded-2xl border border-slate-200/90 bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-[#0a192f] shadow-[0_4px_12px_rgba(10,25,47,0.08)] whitespace-nowrap"
                >
                  {{ paceMessage }}
                  <!-- 말풍선 꼬리 (왼쪽) -->
                  <div
                    class="absolute -bottom-1 left-2.5 h-0 w-0 border-x-[3.5px] border-t-[4px] border-x-transparent border-t-white"
                  />
                  <div
                    class="absolute -bottom-[5px] left-2.5 -z-10 h-0 w-0 border-x-[3.5px] border-t-[4px] border-x-transparent border-t-slate-200"
                  />
                </div>
              </div>

              <img :src="coliBottomImage" alt="페이스메이커 콜리" class="h-10 w-auto drop-shadow-md ml-0.5" />
            </div>
          </div>

          <!-- B. 모바일 분리 주행 (BEHIND / AHEAD): 주인공 항상 z-20, 콜리 z-10 -->
          <template v-else>
            <!-- 1. 주인공 캐릭터 (항상 맨 앞 z-20으로 절대 가려지지 않음) -->
            <div
              class="absolute flex -translate-x-1/2 items-end transition-[left,bottom] duration-500 pointer-events-none z-20"
              :style="{
                left: `${mobilePlayerClampedPosition}%`,
                bottom: isMobileCharactersTied ? `${28 - MOBILE_TIE_VERTICAL_OFFSET / 2}px` : '28px',
              }"
            >
              <img
                :src="goalCharacterImage"
                alt="주인공 위치"
                class="h-[60px] w-auto drop-shadow-md"
                :style="goalCharacterFootStyle"
              />
            </div>

            <!-- 2. 페이스메이커 콜리 + 말풍선 (주인공 뒤 레이어 z-10) -->
            <!-- 말풍선을 flex 흐름에 두면 말풍선 텍스트 폭만큼 이 wrapper 자체가 넓어져서,
                 -translate-x-1/2가 이미지가 아니라 그 넓은 박스를 기준으로 중앙정렬되어 버린다.
                 그러면 캐릭터 사이에 가로 최소 간격을 둬도 실제 이미지 위치는 예상과 다르게
                 어긋나 겹칠 수 있다. 말풍선을 absolute로 빼서 wrapper 너비가 이미지 너비만큼만
                 되도록 하고, left%가 항상 실제 이미지 위치를 정확히 가리키게 한다. -->
            <div
              class="absolute -translate-x-1/2 pointer-events-none z-10 transition-[left,bottom] duration-500"
              :style="{
                left: `${mobileColiClampedPosition}%`,
                bottom: isMobileCharactersTied ? `${28 + MOBILE_TIE_VERTICAL_OFFSET / 2}px` : '28px',
              }"
            >
              <!-- 콜리 머리 위 스마트 말풍선 (화면 우측에 가까우면 세모 오른쪽, 좌측에 가까우면 세모 왼쪽 — 화면 밖으로 잘리지 않도록) -->
              <div
                class="absolute bottom-full -mb-1 flex w-max flex-col"
                :class="isMobileColiPastMidpoint ? 'right-0 items-end' : 'left-0 items-start'"
              >
                <div
                  class="relative rounded-2xl border border-slate-200/90 bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-[#0a192f] shadow-[0_4px_12px_rgba(10,25,47,0.08)] whitespace-nowrap"
                >
                  {{ paceMessage }}
                  <!-- 말풍선 꼬리 -->
                  <div
                    class="absolute -bottom-1 h-0 w-0 border-x-[3.5px] border-t-[4px] border-x-transparent border-t-white"
                    :class="isMobileColiPastMidpoint ? 'right-2.5' : 'left-2.5'"
                  />
                  <div
                    class="absolute -bottom-[5px] -z-10 h-0 w-0 border-x-[3.5px] border-t-[4px] border-x-transparent border-t-slate-200"
                    :class="isMobileColiPastMidpoint ? 'right-2.5' : 'left-2.5'"
                  />
                </div>
              </div>

              <img :src="coliBottomImage" alt="페이스메이커 콜리" class="h-10 w-auto drop-shadow-md" />
            </div>
          </template>
        </div>

        <!-- 캐릭터 범례: 로드맵과 다음 마일스톤 요약 사이, 어떤 캐릭터가 목표 페이스이고 어떤 캐릭터가 나의 현재 페이스인지 한눈에 -->
        <div class="flex justify-center px-4 py-2">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50/80 px-2.5 py-1"
          >
            <span class="inline-flex items-center gap-1">
              <img :src="coliBottomImage" alt="" class="size-3.5 shrink-0 object-contain" />
              <span class="whitespace-nowrap text-[9px] font-bold text-slate-500">목표 페이스</span>
            </span>
            <span class="h-2.5 w-px shrink-0 bg-slate-300" />
            <span class="inline-flex items-center gap-1">
              <img :src="goalCharacterImage" alt="" class="size-3.5 shrink-0 object-contain" />
              <span class="whitespace-nowrap text-[9px] font-bold text-slate-500">나의 현재 페이스</span>
            </span>
          </div>
        </div>

        <!-- 마일스톤 정보는 별도 카드 대신 같은 카드의 요약 영역으로 통합 -->
        <div class="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5">
          <div class="min-w-0 flex-1">
            <p class="truncate text-[11px] font-semibold text-slate-400">
              {{ activeMilestone.title || `다음 ${activeMilestoneIndex + 1}차 마일스톤` }}까지
            </p>
            <p class="mt-0.5 whitespace-nowrap text-sm font-bold text-[#0a192f]">
              <span class="tabular-nums text-primary"
                >{{ formatManwon(remainingToActiveMilestone) }}원</span
              >
              남았어요
            </p>
          </div>
          <div class="shrink-0 text-right">
            <!-- 이 마일스톤의 실제 예상 도착일 계산 로직이 없어 targetDate가 비어 있으면(완료
                 전 마일스톤은 항상 비어 있음) 목표 종료일로 대체하되, "도착 예정"이 아니라
                 "목표 예정일"로 라벨을 구분해 이 마일스톤만의 날짜로 오해하지 않게 한다. -->
            <span class="block text-[11px] font-semibold text-slate-400">
              {{ activeMilestone.targetDate ? '도착 예정' : '목표 예정일' }}
            </span>
            <strong class="mt-0.5 block text-xs font-bold text-primary">
              {{ activeMilestone.targetDate || formatEndDate(goal.period.endDate) }}
            </strong>
          </div>
        </div>
      </div>
    </section>

    <!-- 태블릿/데스크톱: 소프트 스카이블루 와이드 트랙 (상하 균형 컴팩트 뷰) -->
    <div class="relative hidden w-full sm:block" style="aspect-ratio: 2172 / 370">
      <div class="absolute top-0 left-0 w-full" style="aspect-ratio: 2172 / 370">
        <svg
          class="absolute inset-0 size-full"
          viewBox="0 0 2172 370"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="activeTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0064ff" />
              <stop offset="50%" stop-color="#2563eb" />
              <stop offset="100%" stop-color="#38bdf8" />
            </linearGradient>
          </defs>

          <!-- 도로 베이스 트랙: 시원하고 든든한 볼륨의 마라톤 코스 -->
          <path
            d="M-40 245 C250 210 420 220 650 240 C900 262 1110 210 1360 232 C1600 252 1840 220 2212 242"
            stroke="#cce1fd"
            stroke-width="48"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.9"
          />
          <path
            d="M-40 245 C250 210 420 220 650 240 C900 262 1110 210 1360 232 C1600 252 1840 220 2212 242"
            stroke="#ffffff"
            stroke-width="36"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M-40 245 C250 210 420 220 650 240 C900 262 1110 210 1360 232 C1600 252 1840 220 2212 242"
            stroke="#eaf2fe"
            stroke-width="26"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M-40 245 C250 210 420 220 650 240 C900 262 1110 210 1360 232 C1600 252 1840 220 2212 242"
            stroke="#93c5fd"
            stroke-width="2.5"
            stroke-dasharray="26 22"
            stroke-linecap="round"
          />
          <!-- 달성 구간만 브랜드 블루로 강조 -->
          <path
            d="M-40 245 C250 210 420 220 650 240 C900 262 1110 210 1360 232 C1600 252 1840 220 2212 242"
            pathLength="100"
            stroke="url(#activeTrackGrad)"
            stroke-width="16"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-all duration-700 ease-out"
            :stroke-dasharray="`${currentProgress} 100`"
          />
        </svg>

        <!-- 마일스톤 라벨 + 마커: 도로 곡선 위 윗선 지점(pointOnRoad)에 배치 -->
        <div
          v-for="milestone in milestones"
          :key="milestone.milestoneId"
          class="absolute z-10 flex w-max -translate-x-1/2 -translate-y-full flex-col items-center transition-transform hover:scale-105"
          :style="markerStyle(milestonePosition(milestone), isLastMilestone(milestone))"
        >
          <div
            class="hidden flex-col items-center rounded-xl border px-3 py-1.5 shadow-sm transition-all sm:flex"
            :class="
              milestone.status === 'COMPLETED'
                ? 'border-primary/20 bg-white ring-2 ring-primary/10'
                : 'border-slate-200/90 bg-white/95 backdrop-blur-sm'
            "
          >
            <span
              class="text-xs font-bold tracking-[-0.1px]"
              :class="milestone.status === 'COMPLETED' ? 'text-primary' : 'text-slate-600'"
            >
              {{ formatManwon(milestone.targetAmount) }}원
            </span>
            <span
              class="text-[11px] font-medium"
              :class="milestone.status === 'COMPLETED' ? 'text-primary/80' : 'text-slate-400'"
            >
              {{ milestone.percentage }}%
            </span>
            <span
              v-if="isLastMilestone(milestone)"
              class="mt-0.5 flex items-center gap-1 whitespace-nowrap border-t border-slate-100 pt-1 text-[10px] font-normal text-slate-400"
            >
              예상 도착일 {{ formatEndDate(goal.period.endDate) }}
            </span>
          </div>
          <span
            class="mt-1 flex size-4 translate-y-1/2 items-center justify-center rounded-full border-2 shadow-sm"
            :class="
              milestone.status === 'COMPLETED'
                ? 'border-primary bg-primary ring-2 ring-primary/20'
                : 'border-slate-300 bg-white'
            "
          >
            <img
              v-if="milestone.status === 'COMPLETED'"
              src="@/assets/icons/milestone-complete-check.svg"
              alt=""
              class="size-[7px]"
            />
          </span>
        </div>

        <!-- A. 데스크톱 순항 중 (ON_TRACK): 완벽하게 나란히 어깨를 맞대고 함께 위치 (주인공 z-20, 콜리 z-10) -->
        <div
          v-if="paceState === PACE_STATE.ON_TRACK"
          class="absolute flex -translate-x-1/2 -translate-y-full items-end z-20 transition-all duration-500"
          :style="characterMarkerStyle(currentProgress)"
        >
          <!-- 1. 주인공 캐릭터 (항상 앞 z-20) -->
          <img
            :src="goalCharacterImage"
            alt="현재 위치"
            class="h-9 w-auto drop-shadow-md sm:h-20 md:h-24 lg:h-28 xl:h-36 transition-transform hover:scale-105 z-20"
            :style="goalCharacterFootStyle"
          />

          <!-- 2. 페이스메이커 콜리 (나란히 어깨 맞댐: 주인공 뒤쪽 z-10) -->
          <div class="relative -ml-2 sm:-ml-4 md:-ml-6 flex items-end z-10">
            <!-- 브로콜리 스마트 말풍선 (우측 오프셋 + 자연스러운 높이 안착) -->
            <div
              class="absolute -top-7 left-1/2 z-30 flex w-max -translate-x-[20%] flex-col items-start sm:-top-11 md:-top-13 lg:-top-15"
            >
              <div
                class="relative rounded-2xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-bold text-[#0a192f] shadow-[0_6px_16px_rgba(10,25,47,0.1)] whitespace-nowrap"
              >
                {{ paceMessage }}
                <!-- 말풍선 꼬리 (콜리 머리 방향인 좌측 하단) -->
                <div
                  class="absolute -bottom-1.5 left-3.5 h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-white sm:-bottom-2 sm:border-x-[6px] sm:border-t-[7px]"
                ></div>
                <div
                  class="absolute -bottom-[7px] left-3.5 -z-10 h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-slate-200 sm:-bottom-[9px] sm:border-x-[6px] sm:border-t-[7px]"
                ></div>
              </div>
            </div>
            <img
              :src="coliBottomImage"
              alt="페이스메이커 콜리"
              class="h-6 w-auto drop-shadow-md sm:h-14 md:h-[68px] lg:h-20 xl:h-24 transition-transform hover:scale-105"
            />
          </div>
        </div>

        <!-- B. 데스크톱 분리 주행 (BEHIND / AHEAD): 앞/뒤로 시원하게 분리 (주인공 항상 z-20, 콜리 z-10) -->
        <template v-else>
          <!-- 1. 주인공 캐릭터 (항상 맨 앞 z-20으로 절대 가려지지 않음) -->
          <div
            class="absolute flex -translate-x-1/2 -translate-y-full items-end transition-all duration-500 z-20"
            :style="characterMarkerStyle(currentProgress)"
          >
            <img
              :src="goalCharacterImage"
              alt="현재 위치"
              class="h-9 w-auto drop-shadow-md sm:h-20 md:h-24 lg:h-28 xl:h-36 transition-transform hover:scale-105"
              :style="goalCharacterFootStyle"
            />
          </div>

          <!-- 2. 페이스메이커 콜리 (주인공 뒤 레이어 z-10) -->
          <div
            class="absolute flex -translate-x-1/2 -translate-y-full items-end transition-all duration-500 z-10"
            :style="desktopTargetStyle"
          >
            <div class="relative flex flex-col" :class="isColiPastMidpoint ? 'items-end' : 'items-start'">
              <!-- 브로콜리 스마트 말풍선 (화면 우측에 가까우면 세모 오른쪽, 좌측에 가까우면 세모 왼쪽 — 화면 밖으로 잘리지 않도록) -->
              <div
                class="absolute -top-7 z-30 flex w-max flex-col sm:-top-11 md:-top-13 lg:-top-15"
                :class="isColiPastMidpoint ? 'right-0 items-end' : 'left-0 items-start'"
              >
                <div
                  class="relative rounded-2xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-bold text-[#0a192f] shadow-[0_6px_16px_rgba(10,25,47,0.1)] whitespace-nowrap"
                >
                  {{ paceMessage }}
                  <!-- 말풍선 꼬리 -->
                  <div
                    class="absolute -bottom-1.5 h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-white sm:-bottom-2 sm:border-x-[6px] sm:border-t-[7px]"
                    :class="isColiPastMidpoint ? 'right-3.5' : 'left-3.5'"
                  />
                  <div
                    class="absolute -bottom-[7px] -z-10 h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-slate-200 sm:-bottom-[9px] sm:border-x-[6px] sm:border-t-[7px]"
                    :class="isColiPastMidpoint ? 'right-3.5' : 'left-3.5'"
                  />
                </div>
              </div>
              <img
                :src="coliBottomImage"
                alt="페이스메이커 콜리"
                class="h-6 w-auto drop-shadow-md sm:h-14 md:h-[68px] lg:h-20 xl:h-24 transition-transform hover:scale-105"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 캐릭터 범례 (태블릿/데스크톱): 로드맵 트랙 바로 아래, 어떤 캐릭터가 목표 페이스이고 어떤 캐릭터가 나의 현재 페이스인지 한눈에 -->
    <div class="mt-2 hidden justify-center sm:flex">
      <div
        class="inline-flex items-center gap-2.5 rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-1.5"
      >
        <span class="inline-flex items-center gap-1.5">
          <img :src="coliBottomImage" alt="" class="size-4 shrink-0 object-contain" />
          <span class="whitespace-nowrap text-[11px] font-bold text-slate-500">목표 페이스</span>
        </span>
        <span class="h-3 w-px shrink-0 bg-slate-300" />
        <span class="inline-flex items-center gap-1.5">
          <img :src="goalCharacterImage" alt="" class="size-4 shrink-0 object-contain" />
          <span class="whitespace-nowrap text-[11px] font-bold text-slate-500">나의 현재 페이스</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  PACEMAKER_CHARACTER_IMAGE as coliBottomImage,
  getGoalCharacterImage,
} from '@/features/roadmap/constants/goal-character.constants'
import {
  PACE_STATE,
  derivePaceState,
  deriveGoalPaceMetrics,
} from '@/features/roadmap/constants/pace-state.constants'

const props = defineProps({
  goal: {
    type: Object,
    required: true, // GoalDetail
  },
  milestones: {
    type: Array,
    required: true,
  },
})

// 목표 종류(goal.goalType)에 따라 로드맵 메인 캐릭터 매핑
const goalCharacterImage = computed(() => getGoalCharacterImage(props.goal?.goalType))

// 배너/CTA/말풍선이 전부 바라보는 것과 같은 단일 파생 상태 (시작 전/적정/앞섬/뒤처짐)
const paceState = computed(() => derivePaceState(props.goal))

// 페이스 상태에 따른 스마트 말풍선 메시지 (간결하고 임팩트 있는 숏 문구)
const paceMessage = computed(() => {
  if (paceState.value === PACE_STATE.NOT_STARTED) return '이제 출발해볼까요!'
  if (paceState.value === PACE_STATE.AHEAD) return '폭풍 질주 중!'
  if (paceState.value === PACE_STATE.BEHIND) return '조금만 힘내요!'
  return '나이스 페이스!'
})

// 누적 진행률(로드맵 = "지금 어디까지 왔는가")은 월 페이스와 절대 섞지 않고,
// currentAmount/goalAmount, expectedAmount/goalAmount 그대로 계산한다.
const paceMetrics = computed(() => deriveGoalPaceMetrics(props.goal))
const currentProgress = computed(() => paceMetrics.value.currentProgress)
// 목표 페이스 캐릭터의 "진짜" 위치 (겹침 방지 보정 전) — (i) 설명의 "계획대로 모았을 때의 위치"와 일치
const expectedProgressRaw = computed(() => paceMetrics.value.expectedProgress)

// 두 캐릭터가 겹치지 않도록 하는 최소 시각 간격만 별도로 적용한다 (데이터 자체는 왜곡하지 않음)
function withMinimumGap(anchorProgress, targetProgress, minGap) {
  const diff = targetProgress - anchorProgress
  if (Math.abs(diff) >= minGap) return targetProgress
  const direction = diff >= 0 ? 1 : -1
  return Math.min(100, Math.max(0, anchorProgress + direction * minGap))
}

const DESKTOP_MIN_GAP = 5
const coliProgress = computed(() =>
  withMinimumGap(currentProgress.value, expectedProgressRaw.value, DESKTOP_MIN_GAP)
)

// progress(%) 값에 고정 gap을 더하는 것만으로는 부족하다 — 도로 곡선이 압축된 구간(특히
// 시작 지점)에서는 그 gap이 실제로는 몇 픽셀 차이로만 반영되고, 컨테이너 폭이 넓어질수록
// 같은 %가 훨씬 큰 픽셀 간격이 되어 캐릭터 이미지 크기 대비 간격이 요동친다. 그래서 원본
// 진행률이 같거나 매우 가까우면(TIE) 컨테이너 폭과 무관하게 항상 같은 만큼 벌어지는 고정
// 픽셀 오프셋(가로+세로)을 콜리 쪽에 추가로 적용해, 캐릭터 이미지가 절대 겹치지 않게 한다.
const DESKTOP_TIE_THRESHOLD = DESKTOP_MIN_GAP
const DESKTOP_TIE_HORIZONTAL_PX = 56
const DESKTOP_TIE_VERTICAL_PX = 22

const isDesktopCharactersTied = computed(
  () => Math.abs(expectedProgressRaw.value - currentProgress.value) < DESKTOP_TIE_THRESHOLD
)

const desktopTargetPoint = computed(() => characterPointOnRoad(coliProgress.value))
const desktopTargetStyle = computed(() => {
  const point = desktopTargetPoint.value
  if (!isDesktopCharactersTied.value) {
    return { left: `${point.left}%`, top: `${point.top}%` }
  }

  return {
    left: `calc(${point.left}% + ${DESKTOP_TIE_HORIZONTAL_PX}px)`,
    top: `calc(${point.top}% - ${DESKTOP_TIE_VERTICAL_PX}px)`,
  }
})
// 말풍선이 화면 밖으로 잘리지 않도록, 콜리가 도로의 어느 쪽 절반에 있는지로만 방향을 정한다
// (페이스 상태가 아니라 실제 렌더링 위치 기준)
const isColiPastMidpoint = computed(() => desktopTargetPoint.value.left > 50)

const activeMilestoneIndex = computed(() => {
  const inProgressIndex = props.milestones.findIndex(
    (milestone) => milestone.status === 'IN_PROGRESS'
  )
  if (inProgressIndex >= 0) return inProgressIndex

  const upcomingIndex = props.milestones.findIndex((milestone) => milestone.status !== 'COMPLETED')
  return upcomingIndex >= 0 ? upcomingIndex : Math.max(0, props.milestones.length - 1)
})

const activeMilestone = computed(
  () =>
    props.milestones[activeMilestoneIndex.value] ?? { targetAmount: props.goal?.goalAmount ?? 0 }
)

const previousMilestoneAmount = computed(
  () => props.milestones[activeMilestoneIndex.value - 1]?.targetAmount ?? 0
)

const remainingToActiveMilestone = computed(() =>
  Math.max(0, (activeMilestone.value.targetAmount ?? 0) - (props.goal?.currentAmount ?? 0))
)

const mobileSegmentProgress = computed(() => {
  const segmentAmount = (activeMilestone.value.targetAmount ?? 0) - previousMilestoneAmount.value
  if (segmentAmount <= 0) return 100
  return Math.min(
    100,
    Math.max(
      0,
      (((props.goal?.currentAmount ?? 0) - previousMilestoneAmount.value) / segmentAmount) * 100
    )
  )
})

const mobileOverallProgress = computed(() => {
  const milestoneCount = props.milestones.length
  if (milestoneCount <= 0) return 0
  return Math.min(
    100,
    ((activeMilestoneIndex.value + mobileSegmentProgress.value / 100) / milestoneCount) * 100
  )
})

// 목표 페이스 캐릭터의 세그먼트 내 위치도 같은 방식(구간 시작~끝 금액 대비)으로 계산한다.
// expectedAmount가 현재 보이는 구간 범위를 벗어나면(이미 지났거나 아직 안 왔으면) 구간 끝/시작에 고정된다.
const mobileExpectedSegmentProgress = computed(() => {
  const segmentAmount = (activeMilestone.value.targetAmount ?? 0) - previousMilestoneAmount.value
  if (segmentAmount <= 0) return 100
  const expectedAmount = Number(props.goal?.pace?.expectedAmount ?? 0)
  return Math.min(
    100,
    Math.max(0, ((expectedAmount - previousMilestoneAmount.value) / segmentAmount) * 100)
  )
})

// 모바일 위치 계산: 두 캐릭터 모두 같은 구간 내 실제 진행률을 25%~72% 시각 범위에 매핑한다
// (기존처럼 페이스 상태별로 서로 다른 임의 구간에 밀어넣지 않는다)
const MOBILE_POSITION_START = 25
const MOBILE_POSITION_RANGE = 47
const MOBILE_MIN_GAP = 10
// 카드 폭 자체가 좁은 모바일에서는 "10% 가로 간격"이 실제 픽셀로는 캐릭터 이미지 폭보다도
// 작아서 겹쳐 보일 수 있다. 그래서 가로 간격이 실제로 충분한지 따지지 않고, 두 캐릭터의
// 원본 진행률(보정 전)이 같거나 매우 가까우면 곧바로 세로로도 추가 분리한다.
const MOBILE_TIE_VERTICAL_OFFSET = 16

const mobilePlayerPosition = computed(
  () => MOBILE_POSITION_START + (mobileSegmentProgress.value / 100) * MOBILE_POSITION_RANGE
)
const mobileExpectedPositionRaw = computed(
  () => MOBILE_POSITION_START + (mobileExpectedSegmentProgress.value / 100) * MOBILE_POSITION_RANGE
)
const mobileColiPosition = computed(() =>
  withMinimumGap(mobilePlayerPosition.value, mobileExpectedPositionRaw.value, MOBILE_MIN_GAP)
)
const mobilePlayerClampedPosition = computed(() =>
  Math.max(20, Math.min(76, mobilePlayerPosition.value))
)
const mobileColiClampedPosition = computed(() => Math.max(20, Math.min(76, mobileColiPosition.value)))
const isMobileCharactersTied = computed(
  () => Math.abs(mobileExpectedPositionRaw.value - mobilePlayerPosition.value) < MOBILE_MIN_GAP
)
const isMobileColiPastMidpoint = computed(
  () => mobileColiClampedPosition.value > MOBILE_POSITION_START + MOBILE_POSITION_RANGE / 2
)

// 모바일 도로 파란 게이지: 달성률 0%면 파란 선 미표시(0), 1% 이상부터 메인 캐릭터 발밑까지 채움
const mobileTrackProgress = computed(() => {
  if (mobileSegmentProgress.value <= 0) return 0
  const p = mobilePlayerPosition.value
  // SVG path viewBox 390 기준 (-18 ~ 408, 전체폭 426)
  return Math.min(100, Math.max(0, ((p * 3.9 + 18) / 426) * 100))
})

// 각 PNG의 아래쪽 투명 여백 보정 (도로 표면에 정확히 밀착)
const GOAL_TYPE_FOOT_OFFSET = {
  INDEPENDENCE: 0,
  WEDDING: 0,
  EMERGENCY: 0,
  LOAN: 0,
}

const goalCharacterFootStyle = computed(() => ({
  transform: `translateY(${GOAL_TYPE_FOOT_OFFSET[props.goal?.goalType] ?? 0}%)`,
}))

function milestonePosition(milestone) {
  return milestone.percentage
}

function isLastMilestone(milestone) {
  return props.milestones[props.milestones.length - 1]?.milestoneId === milestone.milestoneId
}

function formatManwon(amount) {
  return `${Math.round((amount ?? 0) / 10000).toLocaleString()}만`
}

function formatEndDate(yyyyMM) {
  return (yyyyMM ?? '').replace('-', '.')
}

// 캐릭터 전용 앵커 좌표 (370px 높이 기준 도로 표면 안착)
const CHARACTER_ROAD_ANCHORS = [
  { t: 0, left: 8.5, top: 65.0 },
  { t: 0.25, left: 28, top: 60.8 },
  { t: 0.5, left: 50, top: 65.0 },
  { t: 0.75, left: 72, top: 63.2 },
  { t: 1, left: 91.5, top: 63.2 },
]

// 마일스톤 마커 앵커 좌표 (370px 높이 기준 도로 상단 윗선에 완벽 일치)
const ROAD_ANCHORS = [
  { t: 0, left: 8, top: 57.0 },
  { t: 0.25, left: 28.5, top: 56.8 },
  { t: 0.5, left: 50, top: 57.2 },
  { t: 0.75, left: 71.5, top: 57.0 },
  { t: 1, left: 92, top: 56.8 },
]

// 0~100 사이의 진행률(progress)을 도로 앵커 곡선에 정확히 보간 (0 이하 외삽 지원)
function interpolateAnchors(anchors, progress) {
  const t = Number(progress) / 100
  if (t <= anchors[0].t) {
    const first = anchors[0]
    const second = anchors[1]
    const slopeLeft = (second.left - first.left) / (second.t - first.t)
    const slopeTop = (second.top - first.top) / (second.t - first.t)
    return {
      left: Math.max(3.5, first.left + slopeLeft * (t - first.t)),
      top: first.top + slopeTop * (t - first.t),
    }
  }
  if (t >= anchors[anchors.length - 1].t) {
    return anchors[anchors.length - 1]
  }
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]
    const b = anchors[i + 1]
    if (t >= a.t && t <= b.t) {
      const localT = (t - a.t) / (b.t - a.t)
      return {
        left: a.left + (b.left - a.left) * localT,
        top: a.top + (b.top - a.top) * localT,
      }
    }
  }
  return anchors[anchors.length - 1]
}

function pointOnRoad(progress) {
  return interpolateAnchors(ROAD_ANCHORS, progress)
}

function markerStyle(progress, isFinish = false) {
  if (isFinish) {
    return { left: '92%', top: '56.8%' }
  }

  const { left, top } = pointOnRoad(progress)
  return { left: `${left}%`, top: `${top}%` }
}

function characterPointOnRoad(progress) {
  return interpolateAnchors(CHARACTER_ROAD_ANCHORS, progress)
}

function characterMarkerStyle(progress) {
  const { left, top } = characterPointOnRoad(progress)
  return { left: `${left}%`, top: `${top}%` }
}
</script>
