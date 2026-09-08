// coach 도메인 API 함수: AI 목표 코치 대화방 CRUD + 메시지
// 이 도메인 API만 응답이 { success, data, error } 형태로 감싸져 있어서
// (다른 feature들은 평평한 JSON을 바로 반환), 여기서 data만 꺼내 반환한다.
import { client } from '@/shared/api/client'

/**
 * @typedef {Object} Conversation
 * @property {number} conversationId
 * @property {string} title
 * @property {string | null} lastMessageAt
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * 새 대화방 생성 (백엔드는 Request Body/Params 없이 인증 토큰으로 생성)
 * @returns {Promise<Conversation>}
 */
export async function createConversation() {
  const { data } = await client.post('/ai-coach/conversations')
  return data?.data ?? data
}

/**
 * 대화방 목록 조회
 * @returns {Promise<Conversation[]>}
 */
export async function getConversations() {
  const { data } = await client.get('/ai-coach/conversations')
  const res = data?.data ?? data
  return res?.conversations ?? (Array.isArray(res) ? res : [])
}

/**
 * @typedef {Object} ChatMessageDto
 * @property {number} [aiCoachMessageId]
 * @property {number} [messageId]
 * @property {'USER' | 'ASSISTANT'} senderType
 * @property {string} content
 * @property {string} createdAt
 */

/**
 * 특정 대화방의 메시지 목록 조회
 * @param {number} conversationId
 * @returns {Promise<ChatMessageDto[]>}
 */
export async function getConversationMessages(conversationId) {
  const { data } = await client.get(`/ai-coach/conversations/${conversationId}/messages`)
  return data?.data ?? data
}

/**
 * 대화방 삭제
 * @param {number} conversationId
 * @returns {Promise<void>}
 */
export async function deleteConversation(conversationId) {
  const { data } = await client.delete(`/ai-coach/conversations/${conversationId}`)
  return data?.data ?? data
}

/**
 * @typedef {Object} SendChatMessagePayload
 * @property {number} conversationId
 * @property {string} message
 */

/**
 * @typedef {Object} SendChatMessageResult
 * @property {string} message
 */

/**
 * AI 코치에게 질문 전송
 * @param {SendChatMessagePayload} payload
 * @returns {Promise<SendChatMessageResult>}
 */
export async function sendMessage(payload) {
  const { data } = await client.post(
    `/ai-coach/conversations/${payload.conversationId}/messages`,
    {
      content: payload.message,
    },
    {
      timeout: 60000, // LLM 응답 생성 대기 (60초)
    }
  )
  const resData = data?.data ?? data
  const assistantText =
    resData?.content ??
    resData?.assistantMessage?.content ??
    resData?.message ??
    (typeof resData === 'string' ? resData : '')

  return {
    message: assistantText,
  }
}

/**
 * AI 코치 답변을 SSE로 수신한다.
 * @param {SendChatMessagePayload} payload
 * @param {string} accessToken
 * @param {{ onDelta?: (content: string) => void, signal?: AbortSignal }} [handlers]
 * @returns {Promise<ChatMessageDto>}
 */
export async function sendMessageStream(payload, accessToken, handlers = {}) {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  const response = await fetch(
    `${baseUrl}/ai-coach/conversations/${payload.conversationId}/messages/stream`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ content: payload.message }),
      signal: handlers.signal,
    }
  )

  if (!response.ok || !response.body) {
    throw new Error('AI 응답 스트림을 시작하지 못했습니다.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let completedMessage = null

  function processEvent(block) {
    const lines = block.split('\n')
    const eventName = lines
      .find((line) => line.startsWith('event:'))
      ?.slice(6)
      .trim()
    const data = lines
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('\n')
    if (!eventName || !data) return

    const payloadData = JSON.parse(data)
    if (eventName === 'delta') handlers.onDelta?.(payloadData.content ?? '')
    if (eventName === 'completed') completedMessage = payloadData.message ?? null
    if (eventName === 'error')
      throw new Error(payloadData.message ?? 'AI 응답을 생성하지 못했습니다.')
  }

  let isStreamDone = false
  while (!isStreamDone) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done }).replace(/\r/g, '')

    let separatorIndex = buffer.indexOf('\n\n')
    while (separatorIndex >= 0) {
      processEvent(buffer.slice(0, separatorIndex))
      buffer = buffer.slice(separatorIndex + 2)
      separatorIndex = buffer.indexOf('\n\n')
    }
    isStreamDone = done
  }

  if (!completedMessage) throw new Error('AI 응답이 완료되지 않았습니다.')
  return completedMessage
}
