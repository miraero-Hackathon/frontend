<!-- AI 목표 코치 채팅 페이지 -->
<template>
  <div class="flex h-full w-full min-h-0 flex-1 overflow-hidden bg-[#f8fafc]">
    <div class="flex h-full min-h-0 flex-1 flex-col bg-[#f8fafc] overflow-hidden">
      <!-- AI 코치 상단 채팅 헤더 바 (PC/데스크톱 전용, 모바일은 상단 글로벌 헤더 사용) -->
      <div
        class="hidden lg:flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 sm:px-6 md:px-8"
      >
        <div class="flex items-center gap-3">
          <div class="flex size-7 shrink-0 items-center justify-center">
            <svg
              class="size-6 text-primary drop-shadow-xs"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linejoin="round"
              />
              <path d="M19 2L19.8 4.2L22 5L19.8 5.8L19 8L18.2 5.8L16 5L18.2 4.2L19 2Z" />
            </svg>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h1 class="text-sm font-bold tracking-tight text-[#0a192f] sm:text-base">
                AI 목표 코치
              </h1>
              <span
                class="hidden items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary sm:inline-flex"
              >
                {{ goalLabel ? `${goalLabel} 맞춤 코칭` : '마이데이터 맞춤 코칭' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 truncate max-w-[240px] sm:max-w-md">
              저축 및 목표 달성 페이스를 코칭해드려요
            </p>
          </div>
        </div>
      </div>

      <!-- 메시지 리스트 (반응형 패딩 및 내부 단독 스크롤) -->
      <div
        ref="messageListRef"
        class="flex-1 min-h-0 space-y-3 overflow-y-auto px-3.5 py-4 sm:space-y-4 sm:px-6 sm:py-6 lg:px-10"
        @scroll="handleMessageScroll"
      >
        <LoadingSpinner
          v-if="coachStore.isLoadingMessages && coachStore.messages.length === 0"
          message="대화 내역을 불러오고 있어요"
          sub-message="AI 코칭 데이터를 준비 중이에요."
          container-class="py-20"
        />
        <template v-else>
          <template v-for="message in coachStore.messages" :key="message.id">
            <ChatMessageBubble
              v-if="message.content.trim().length > 0"
              :message="message"
              :is-streaming="coachStore.isSending && message === coachStore.messages.at(-1)"
            />
          </template>

          <!-- AI 답변 생성 중 (생각 중 / 단정한 별 아이콘 + 텍스트 시머 그라데이션 말풍선) -->
          <div
            v-if="coachStore.isSending && coachStore.messages.at(-1)?.content.trim().length === 0"
            class="flex w-full items-end gap-2.5 justify-start"
          >
            <div class="mb-1 flex size-7 sm:size-8 shrink-0 items-center justify-center">
              <!-- 단정하게 고정된 반짝 별 심볼 -->
              <svg
                class="size-5 sm:size-5.5 text-primary drop-shadow-xs"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z"
                  stroke="currentColor"
                  stroke-width="0.8"
                  stroke-linejoin="round"
                />
                <path d="M19 2L19.8 4.2L22 5L19.8 5.8L19 8L18.2 5.8L16 5L18.2 4.2L19 2Z" />
              </svg>
            </div>
            <div
              class="flex items-center rounded-[18px] rounded-tl-[6px] border border-slate-200/80 bg-white px-4 py-2.5 shadow-2xs"
            >
              <!-- 옆으로 흘러가는 텍스트 그라데이션 시머 애니메이션 -->
              <span class="text-shimmer text-xs font-semibold tracking-tight select-none">
                답변을 작성하고 있어요
              </span>
            </div>
          </div>

          <div
            v-if="coachStore.sendError && !coachStore.isSending"
            class="flex w-full items-start gap-2.5"
            role="alert"
          >
            <div
              class="mt-1 flex size-7 shrink-0 items-center justify-center text-rose-500 sm:size-8"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="size-5"
              >
                <circle cx="12" cy="12" r="9" />
                <path stroke-linecap="round" d="M12 8v5M12 16.5h.01" />
              </svg>
            </div>
            <div
              class="max-w-[88%] rounded-[18px] rounded-tl-[6px] border border-rose-100 bg-rose-50 px-4 py-3 shadow-2xs sm:max-w-[540px]"
            >
              <p class="text-xs font-bold text-rose-700">답변을 불러오지 못했어요</p>
              <p class="mt-1 text-[11px] leading-4 text-rose-500">잠시 후 다시 시도해 주세요.</p>
              <div class="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-rose-700"
                  @click="coachStore.retryLastMessage"
                >
                  다시 시도
                </button>
                <button
                  type="button"
                  class="px-2 py-1.5 text-[11px] font-bold text-rose-400 hover:text-rose-600"
                  @click="coachStore.clearSendError"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 입력 영역 (하단 고정 질문 프리셋 포함) -->
      <CoachChatInput />
    </div>

    <CoachConversationSidebar
      v-model:is-open="coachStore.isSidebarOpen"
      :conversations="coachStore.conversations"
      :active-conversation-id="coachStore.currentConversationId"
      @create="handleCreateConversation"
      @select="handleSelectConversation"
      @delete="handleDeleteConversation"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useGoalStore } from '@/features/goal'
import { GOAL_TYPES } from '@/shared/constants/goals'
import { useMediaQuery } from '@/shared/composables/useMediaQuery'
import LoadingSpinner from '@/shared/ui/LoadingSpinner.vue'
import {
  useCoachStore,
  ChatMessageBubble,
  CoachChatInput,
  CoachConversationSidebar,
} from '@/features/coach'

const authStore = useAuthStore()
const goalStore = useGoalStore()
const coachStore = useCoachStore()

const messageListRef = ref(null)
const isNearBottom = ref(true)

const isDesktop = useMediaQuery('(min-width: 1024px)')

// 데스크톱 진입 시 기본 펼침
onMounted(() => {
  if (isDesktop.value) {
    coachStore.toggleSidebar(true)
  }
})

const userName = computed(() => authStore.user?.name ?? '')
const goalLabel = computed(
  () => GOAL_TYPES.find((type) => type.id === goalStore.selectedGoalType)?.label ?? ''
)

// TODO: goal store에 목표 title 전용 필드가 생기면 selectedGoalType 대신 그 필드로 교체
const welcomeMessage = computed(() => {
  const greeting = userName.value ? `안녕하세요 ${userName.value}님 👋 ` : '안녕하세요 👋 '
  const goalPart = goalLabel.value ? `${goalLabel.value} 목표를 함께 관리하는 코치예요. ` : ''
  return `${greeting}${goalPart}무엇이 궁금하세요?`
})

function scrollToBottom(force = true) {
  if (!force && !isNearBottom.value) return
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
      isNearBottom.value = true
    }
  })
}

function handleMessageScroll() {
  const element = messageListRef.value
  if (!element) return
  isNearBottom.value = element.scrollHeight - element.scrollTop - element.clientHeight < 80
}

watch(
  () => coachStore.messages.length,
  () => scrollToBottom()
)
watch(
  () => coachStore.messages.at(-1)?.content.length ?? 0,
  () => scrollToBottom(false)
)

async function handleCreateConversation() {
  await coachStore.createNewConversation(welcomeMessage.value)
  if (!isDesktop.value) coachStore.toggleSidebar(false)
  scrollToBottom()
}

async function handleSelectConversation(conversationId) {
  await coachStore.selectConversation(conversationId)
  if (!isDesktop.value) coachStore.toggleSidebar(false)
  scrollToBottom()
}

async function handleDeleteConversation(conversationId) {
  const wasActive = coachStore.currentConversationId === conversationId
  // eslint-disable-next-line no-alert
  if (!window.confirm('이 대화를 삭제할까요? 삭제하면 되돌릴 수 없어요.')) return

  await coachStore.removeConversation(conversationId)

  if (!wasActive) return

  // 삭제한 대화방이 보고 있던 대화방이면, 남은 대화방 중 최신 것으로 전환하거나 새로 만듦
  if (coachStore.conversations.length > 0) {
    await coachStore.selectConversation(coachStore.conversations[0].conversationId)
  } else {
    await coachStore.createNewConversation(welcomeMessage.value)
  }
}

onMounted(async () => {
  try {
    await coachStore.fetchConversations()
  } catch (err) {
    console.error('대화방 목록 조회 실패:', err)
  }

  if (coachStore.conversations && coachStore.conversations.length > 0) {
    await coachStore.selectConversation(coachStore.conversations[0].conversationId)
  } else {
    await coachStore.createNewConversation(welcomeMessage.value)
  }

  scrollToBottom()
})
</script>

<style scoped>
/* 애플/ChatGPT 스타일 텍스트 그라데이션 시머 애니메이션 */
@keyframes textShimmerWave {
  0% {
    background-position: 220% 0;
  }
  100% {
    background-position: -220% 0;
  }
}

.text-shimmer {
  background: linear-gradient(
    90deg,
    #64748b 0%,
    #64748b 38%,
    #cbd5e1 50%,
    #64748b 62%,
    #64748b 100%
  );
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textShimmerWave 1.8s linear infinite;
  will-change: background-position;
}
</style>
