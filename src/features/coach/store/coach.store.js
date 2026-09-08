// coach 도메인 상태 store: 대화방 목록 + 현재 대화방의 메시지
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as coachApi from '@/features/coach/api/coach.api'
import { CHAT_ROLES } from '@/features/coach/constants/coach.constants'
import { useAuthStore } from '@/stores/auth.store'

/**
 * @typedef {Object} ChatMessage
 * @property {number | string} id
 * @property {'assistant' | 'user'} role
 * @property {string} content
 * @property {string} createdAt
 */

export const useCoachStore = defineStore('feature-coach', () => {
  /** @type {import('vue').Ref<import('@/features/coach/api/coach.api').Conversation[]>} */
  const conversations = ref([])
  /** @type {import('vue').Ref<number | null>} */
  const currentConversationId = ref(null)
  /** @type {import('vue').Ref<ChatMessage[]>} */
  const messages = ref([])
  const draftInput = ref('')
  const isSending = ref(false)
  const sendError = ref(null)
  const isLoadingConversations = ref(false)
  const isLoadingMessages = ref(false)
  const isSidebarOpen = ref(false)
  let activeRequestController = null
  let stopActiveTyping = null

  function toggleSidebar(val) {
    isSidebarOpen.value = typeof val === 'boolean' ? val : !isSidebarOpen.value
  }

  function $reset() {
    activeRequestController?.abort()
    stopActiveTyping?.()
    activeRequestController = null
    stopActiveTyping = null
    conversations.value = []
    currentConversationId.value = null
    messages.value = []
    draftInput.value = ''
    isSending.value = false
    sendError.value = null
    isLoadingConversations.value = false
    isLoadingMessages.value = false
    isSidebarOpen.value = false
  }

  /**
   * @param {'assistant' | 'user'} role
   * @param {string} content
   * @returns {ChatMessage}
   */
  function createLocalMessage(role, content) {
    return {
      id: crypto.randomUUID(),
      role,
      content,
      createdAt: new Date().toISOString(),
    }
  }

  /**
   * @param {string | null | undefined} senderType
   */
  function mapSenderType(senderType) {
    if (!senderType) return CHAT_ROLES.ASSISTANT
    const upper = String(senderType).toUpperCase()
    return upper === 'USER' ? CHAT_ROLES.USER : CHAT_ROLES.ASSISTANT
  }

  async function fetchConversations() {
    isLoadingConversations.value = true
    try {
      const res = await coachApi.getConversations()
      const rawList = Array.isArray(res) ? res : []
      conversations.value = rawList.map((c) => ({
        conversationId: c.aiCoachConversationId ?? c.conversationId ?? c.id,
        title: c.title ?? '새 대화',
        createdAt: c.createdAt,
        lastMessageAt: c.lastMessageAt ?? null,
        ...c,
      }))
    } catch (err) {
      conversations.value = []
      throw err
    } finally {
      isLoadingConversations.value = false
    }
  }

  /**
   * @param {number} conversationId
   */
  async function selectConversation(conversationId) {
    if (currentConversationId.value === conversationId) return
    currentConversationId.value = conversationId
    draftInput.value = ''
    sendError.value = null
    isLoadingMessages.value = true
    try {
      const result = await coachApi.getConversationMessages(conversationId)
      const rawMessages = Array.isArray(result) ? result : (result?.messages ?? [])
      messages.value = rawMessages.map((item) => ({
        id: item.aiCoachMessageId ?? item.messageId ?? item.id ?? crypto.randomUUID(),
        role: mapSenderType(item.senderType ?? item.role),
        content: item.content ?? item.message ?? '',
        createdAt: item.createdAt ?? new Date().toISOString(),
      }))
    } catch (err) {
      messages.value = []
      throw err
    } finally {
      isLoadingMessages.value = false
    }
  }

  /**
   * @param {string} [welcomeContent] 새 대화방 진입 시 보여줄 인사말 — 서버엔 저장되지 않는 클라이언트 전용 표시
   */
  async function createNewConversation(welcomeContent) {
    const res = await coachApi.createConversation()
    const newConvId = res?.aiCoachConversationId ?? res?.conversationId ?? res?.id ?? Date.now()
    const conversation = {
      conversationId: newConvId,
      title: res?.title ?? '새 대화',
      createdAt: res?.createdAt ?? new Date().toISOString(),
      lastMessageAt: res?.lastMessageAt ?? null,
      ...res,
    }
    conversations.value = [conversation, ...conversations.value]
    currentConversationId.value = newConvId
    draftInput.value = ''
    sendError.value = null
    messages.value = welcomeContent
      ? [createLocalMessage(CHAT_ROLES.ASSISTANT, welcomeContent)]
      : []
  }

  /**
   * @param {number} conversationId
   */
  async function removeConversation(conversationId) {
    await coachApi.deleteConversation(conversationId)
    conversations.value = conversations.value.filter(
      (c) => (c.aiCoachConversationId ?? c.conversationId) !== conversationId
    )

    if (currentConversationId.value === conversationId) {
      currentConversationId.value = null
      messages.value = []
    }
  }

  /**
   * @param {string} value
   */
  function setDraftInput(value) {
    draftInput.value = value
  }

  function clearSendError() {
    sendError.value = null
  }

  /**
   * @param {string} [content] 생략 시 draftInput을 사용
   * @param {{ appendUser?: boolean }} [options]
   */
  async function sendMessage(content, options = {}) {
    const text = (content ?? draftInput.value).trim()
    if (!text || isSending.value || !currentConversationId.value) return

    if (options.appendUser !== false) {
      messages.value.push(createLocalMessage(CHAT_ROLES.USER, text))
    }
    messages.value.push(createLocalMessage(CHAT_ROLES.ASSISTANT, ''))
    const assistantMessage = messages.value[messages.value.length - 1]
    draftInput.value = ''
    sendError.value = null
    isSending.value = true

    const pendingCharacters = []
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let typingTimer = null
    let streamFinished = false
    let wasStopped = false
    let receivedText = ''
    let resolveTyping
    const typingFinished = new Promise((resolve) => {
      resolveTyping = resolve
    })

    function finishTypingIfReady() {
      if (streamFinished && pendingCharacters.length === 0 && typingTimer === null) {
        resolveTyping()
      }
    }

    function scheduleTyping() {
      if (typingTimer !== null) return

      if (prefersReducedMotion) {
        assistantMessage.content += pendingCharacters.splice(0).join('')
        finishTypingIfReady()
        return
      }

      const backlog = pendingCharacters.length
      const batchSize = backlog > 120 ? 4 : backlog > 50 ? 3 : backlog > 20 ? 2 : 1
      const nextChunk = pendingCharacters.splice(0, batchSize).join('')
      const delay = /[.!?。！？\n]$/.test(nextChunk) ? 55 : 24

      typingTimer = window.setTimeout(() => {
        typingTimer = null
        assistantMessage.content += nextChunk
        if (pendingCharacters.length > 0) scheduleTyping()
        else finishTypingIfReady()
      }, delay)
    }

    function enqueueText(value) {
      if (!value) return
      pendingCharacters.push(...Array.from(value))
      scheduleTyping()
    }

    function stopTyping() {
      wasStopped = true
      if (typingTimer !== null) {
        window.clearTimeout(typingTimer)
        typingTimer = null
      }
      assistantMessage.content += pendingCharacters.splice(0).join('')
      streamFinished = true
      resolveTyping()
    }

    const requestController = new AbortController()
    activeRequestController = requestController
    stopActiveTyping = stopTyping

    try {
      const completedMessage = await coachApi.sendMessageStream(
        {
          conversationId: currentConversationId.value,
          message: text,
        },
        useAuthStore().accessToken,
        {
          onDelta: (delta) => {
            receivedText += delta
            enqueueText(delta)
          },
          signal: requestController.signal,
        }
      )

      const completedContent = completedMessage.content ?? ''
      if (!wasStopped && completedContent.startsWith(receivedText)) {
        enqueueText(completedContent.slice(receivedText.length))
      }
      streamFinished = true
      finishTypingIfReady()
      await typingFinished

      assistantMessage.id = completedMessage.aiCoachMessageId ?? assistantMessage.id
      assistantMessage.content = completedContent || assistantMessage.content
      assistantMessage.createdAt = completedMessage.createdAt ?? assistantMessage.createdAt
    } catch (err) {
      if (typingTimer !== null) window.clearTimeout(typingTimer)
      if (err?.name === 'AbortError') {
        assistantMessage.content += pendingCharacters.splice(0).join('')
        if (!assistantMessage.content.trim()) {
          messages.value = messages.value.filter((message) => message.id !== assistantMessage.id)
        }
      } else {
        messages.value = messages.value.filter((message) => message.id !== assistantMessage.id)
        sendError.value = {
          content: text,
          message: err instanceof Error ? err.message : 'AI 답변을 불러오지 못했어요.',
        }
      }
    } finally {
      if (activeRequestController === requestController) activeRequestController = null
      if (stopActiveTyping === stopTyping) stopActiveTyping = null
      isSending.value = false
    }
  }

  function stopGenerating() {
    if (!isSending.value) return
    stopActiveTyping?.()
    activeRequestController?.abort()
  }

  async function retryLastMessage() {
    const failedContent = sendError.value?.content
    if (!failedContent) return
    await sendMessage(failedContent, { appendUser: false })
  }

  return {
    conversations,
    currentConversationId,
    messages,
    draftInput,
    isSending,
    sendError,
    isLoadingConversations,
    isLoadingMessages,
    isSidebarOpen,
    toggleSidebar,
    fetchConversations,
    selectConversation,
    createNewConversation,
    removeConversation,
    setDraftInput,
    clearSendError,
    sendMessage,
    stopGenerating,
    retryLastMessage,
    $reset,
  }
})
