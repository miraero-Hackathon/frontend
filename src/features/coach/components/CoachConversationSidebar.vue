<!-- AI 코치 대화방 목록 사이드바: 화면 오른쪽에 배치
     - 데스크톱(lg 이상): 인라인, 드래그로 폭 조절 + 얇은 탭으로 접기/펼치기
     - 모바일(lg 미만): 메인 대시보드 사이드바처럼 오버레이 + 배경 딤 처리, isOpen으로 열고 닫음 -->
<template>
  <!-- 모바일 오버레이 배경 -->
  <div
    v-if="!isDesktop && isOpen"
    class="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
    @click="$emit('update:isOpen', false)"
  />

  <div
    ref="containerRef"
    class="h-full shrink-0"
    :class="
      isDesktop
        ? 'relative'
        : [
            'fixed inset-y-0 right-0 z-50 w-[85%] max-w-[320px] transition-all duration-200 ease-out',
            isOpen
              ? 'translate-x-0 shadow-2xl opacity-100 visible'
              : 'translate-x-full shadow-none opacity-0 invisible pointer-events-none',
          ]
    "
    :style="isDesktop ? { width: isDesktopCollapsed ? '0px' : `${width}px` } : undefined"
  >
    <!-- 데스크톱: 접힌 상태에서 화면 오른쪽 끝에 붙는 펼치기 탭 -->
    <button
      v-if="isDesktop && isDesktopCollapsed"
      type="button"
      class="absolute -left-8 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-slate-200 bg-white text-slate-400 shadow-[0_2px_6px_rgba(0,0,0,0.06)] hover:text-primary"
      aria-label="대화 목록 펼치기"
      @click="isDesktopCollapsed = false"
    >
      <ChevronIcon direction="left" />
    </button>

    <aside
      v-show="isDesktop ? !isDesktopCollapsed : true"
      class="flex h-full w-full flex-col overflow-hidden border-l border-slate-200 bg-white"
    >
      <!-- 새 대화 버튼 + 접기 버튼(데스크톱) / 닫기 버튼(모바일) -->
      <div class="flex items-center gap-2 border-b border-slate-100 p-4">
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/[0.04] py-2.5 text-sm font-bold text-primary"
          @click="$emit('create')"
        >
          <img src="@/assets/icons/plus.svg" alt="" class="size-3" />
          새 대화
        </button>
        <button
          type="button"
          class="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
          :aria-label="isDesktop ? '대화 목록 접기' : '대화 목록 닫기'"
          @click="isDesktop ? (isDesktopCollapsed = true) : $emit('update:isOpen', false)"
        >
          <ChevronIcon :direction="isDesktop ? 'right' : 'close'" />
        </button>
      </div>

      <!-- 대화방 리스트 -->
      <ul class="flex-1 overflow-y-auto p-2 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <li v-for="conversation in conversations" :key="getConvId(conversation)">
          <div
            class="group flex items-center gap-1 rounded-xl px-3 py-2.5"
            :class="
              getConvId(conversation) === activeConversationId
                ? 'bg-[#eaf2ff]'
                : 'hover:bg-slate-50'
            "
          >
            <button
              type="button"
              class="min-w-0 flex-1 text-left cursor-pointer"
              @click="$emit('select', getConvId(conversation))"
            >
              <p
                class="truncate text-sm font-bold"
                :class="
                  getConvId(conversation) === activeConversationId
                    ? 'text-primary'
                    : 'text-[#0a192f]'
                "
              >
                {{ conversation.title }}
              </p>
              <p class="truncate text-xs text-slate-400">{{ formatRelativeDate(conversation) }}</p>
            </button>
            <button
              type="button"
              class="shrink-0 rounded-lg p-1.5 text-slate-300 opacity-0 hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 cursor-pointer"
              aria-label="대화방 삭제"
              @click="$emit('delete', getConvId(conversation))"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-3.5"
              >
                <path
                  d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"
                />
              </svg>
            </button>
          </div>
        </li>

        <li v-if="conversations.length === 0" class="px-3 py-6 text-center text-xs text-slate-400">
          아직 대화가 없어요
        </li>
      </ul>
    </aside>

    <!-- 드래그로 폭 조절: 데스크톱 전용, 사이드바 왼쪽 경계에 배치 -->
    <div
      v-if="isDesktop && !isDesktopCollapsed"
      class="absolute -left-1 top-0 h-full w-2 cursor-col-resize select-none"
      @mousedown="startDrag"
    >
      <div class="mx-auto h-full w-px bg-transparent hover:bg-primary/30" />
    </div>
  </div>
</template>

<script setup>
import { h, onBeforeUnmount, ref } from 'vue'
import { useMediaQuery } from '@/shared/composables/useMediaQuery'

defineProps({
  conversations: {
    type: Array,
    default: () => [],
  },
  activeConversationId: {
    type: Number,
    default: null,
  },
  // 모바일 오버레이 열림 상태 (데스크톱에서는 사용 안 함 — lg:translate-x-0 없이 항상 인라인 표시)
  isOpen: {
    type: Boolean,
    default: false,
  },
})
defineEmits(['create', 'select', 'delete', 'update:isOpen'])

const isDesktop = useMediaQuery('(min-width: 1024px)')

const MIN_WIDTH = 200
const MAX_WIDTH = 420
const DEFAULT_WIDTH = 260
const COLLAPSE_THRESHOLD = 140

const containerRef = ref(null)
const width = ref(DEFAULT_WIDTH)
const isDesktopCollapsed = ref(false)
const isDragging = ref(false)

function startDrag(event) {
  event.preventDefault()
  isDragging.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', stopDrag)
}

function handleDrag(event) {
  if (!isDragging.value || !containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const nextWidth = rect.right - event.clientX

  if (nextWidth < COLLAPSE_THRESHOLD) {
    isDesktopCollapsed.value = true
    return
  }

  isDesktopCollapsed.value = false
  width.value = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, nextWidth))
}

function stopDrag() {
  isDragging.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', stopDrag)
}

onBeforeUnmount(stopDrag)

function getConvId(conversation) {
  return conversation?.aiCoachConversationId ?? conversation?.conversationId ?? conversation?.id
}

function formatRelativeDate(conversation) {
  const isoDate = conversation.lastMessageAt ?? conversation.createdAt
  const date = new Date(isoDate)
  const now = new Date()
  const isSameDay = date.toDateString() === now.toDateString()

  if (isSameDay) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

// 방향별 화살표/닫기 아이콘 (단순 path 하나짜리라 인라인 컴포넌트로 처리)
const ICON_PATHS = {
  left: 'm15 18-6-6 6-6',
  right: 'm9 18 6-6-6-6',
  close: 'M18 6 6 18M6 6l12 12',
}

const ChevronIcon = (props) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: 'size-4',
    },
    [h('path', { d: ICON_PATHS[props.direction] })]
  )
</script>
