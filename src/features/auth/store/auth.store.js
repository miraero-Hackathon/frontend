// auth 도메인 UI 상태 store (전역 인증 정보는 @/stores/auth.store 참고)
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  connectMydata as connectMydataApi,
  login as loginApi,
  signup as signupApi,
  logout as logoutApi,
  syncMydata as syncMydataApi,
} from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'

const MYDATA_SYNC_STORAGE_PREFIX = 'miraero_mydata_sync'
const MYDATA_PHASE_CONNECTING = 'connecting'
const MYDATA_PHASE_CONNECTED = 'connected'
const MYDATA_PHASE_SYNCING = 'syncing'
const MYDATA_PHASE_SYNCED = 'synced'
const MYDATA_SYNC_ERROR_MESSAGE = '마이데이터 연동에 실패했어요. 잠시 후 다시 시도해 주세요.'
const MYDATA_INTERRUPTED_ERROR_MESSAGE =
  '새로고침으로 이전 요청의 처리 상태를 확인할 수 없어요. 다시 시도해 주세요.'
const DUPLICATE_EMAIL_ERROR_MESSAGE = '이미 가입된 이메일이에요'
const SIGNUP_ERROR_MESSAGE = '회원가입에 실패했어요. 잠시 후 다시 시도해 주세요.'

// 컴포넌트가 재마운트되어도 같은 사용자의 진행 중 요청을 공유한다.
const mydataSyncRequests = new Map()
// sessionStorage를 사용할 수 없는 환경에서도 현재 런타임의 중복 요청은 방지한다.
const mydataSyncPhases = new Map()

function getMydataSyncStorageKey(userId) {
  return `${MYDATA_SYNC_STORAGE_PREFIX}:${userId}`
}

function readMydataSyncPhase(userId) {
  const normalizedUserId = String(userId)

  try {
    return (
      window.sessionStorage.getItem(getMydataSyncStorageKey(normalizedUserId)) ??
      mydataSyncPhases.get(normalizedUserId)
    )
  } catch {
    return mydataSyncPhases.get(normalizedUserId)
  }
}

function writeMydataSyncPhase(userId, phase) {
  const normalizedUserId = String(userId)
  mydataSyncPhases.set(normalizedUserId, phase)

  try {
    window.sessionStorage.setItem(getMydataSyncStorageKey(normalizedUserId), phase)
  } catch {
    // 저장소가 차단되어도 API 흐름은 메모리 상태로 계속 진행한다.
  }
}

function clearMydataSyncPhase(userId) {
  const normalizedUserId = String(userId)
  mydataSyncPhases.delete(normalizedUserId)

  try {
    window.sessionStorage.removeItem(getMydataSyncStorageKey(normalizedUserId))
  } catch {
    // 저장소 삭제 실패가 로그인 성공을 실패로 바꾸지 않도록 한다.
  }
}

export const useAuthFeatureStore = defineStore('feature-auth', () => {
  // 담을 상태: loginError, signupStep, isMydataLoading, signupError, isSubmittingSignup
  const loginError = ref(null)
  const isSubmittingLogin = ref(false)
  const signupStep = ref(1)
  const isMydataLoading = ref(false)
  const signupError = ref(null)
  const isSubmittingSignup = ref(false)
  const mydataSyncError = ref(null)
  const isSubmittingLogout = ref(false)
  let loginRequest = null

  function resetLoginError() {
    loginError.value = null
  }

  function resetSignupError() {
    signupError.value = null
  }

  async function submitLogin(credentials) {
    if (loginRequest) return loginRequest

    loginError.value = null
    isSubmittingLogin.value = true

    loginRequest = (async () => {
      try {
        const response = await loginApi(credentials)
        clearMydataSyncPhase(response.user.userId)
        useAuthStore().login({
          accessToken: response.token.accessToken,
          user: {
            id: String(response.user.userId),
            name: response.user.name,
            email: response.user.email,
          },
        })
        return response
      } catch (error) {
        loginError.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
        throw error
      }
    })()

    try {
      return await loginRequest
    } finally {
      isSubmittingLogin.value = false
      loginRequest = null
    }
  }

  async function initializeMydata() {
    const userId = useAuthStore().user?.id

    if (!userId) {
      const error = new Error('로그인 정보를 확인할 수 없습니다.')
      mydataSyncError.value = error.message
      throw error
    }

    const existingRequest = mydataSyncRequests.get(userId)
    if (existingRequest) {
      isMydataLoading.value = true
      mydataSyncError.value = null

      try {
        return await existingRequest
      } catch (error) {
        mydataSyncError.value = MYDATA_SYNC_ERROR_MESSAGE
        throw error
      } finally {
        isMydataLoading.value = false
      }
    }

    const savedPhase = readMydataSyncPhase(userId)

    if (savedPhase === MYDATA_PHASE_SYNCED) {
      isMydataLoading.value = false
      mydataSyncError.value = null
      return
    }

    if (savedPhase === MYDATA_PHASE_CONNECTING || savedPhase === MYDATA_PHASE_SYNCING) {
      isMydataLoading.value = false
      mydataSyncError.value = MYDATA_INTERRUPTED_ERROR_MESSAGE
      throw new Error(MYDATA_INTERRUPTED_ERROR_MESSAGE)
    }

    const request = (async () => {
      isMydataLoading.value = true
      mydataSyncError.value = null

      try {
        let phase = readMydataSyncPhase(userId)

        if (phase !== MYDATA_PHASE_CONNECTED) {
          writeMydataSyncPhase(userId, MYDATA_PHASE_CONNECTING)
          await connectMydataApi()
          writeMydataSyncPhase(userId, MYDATA_PHASE_CONNECTED)
          phase = MYDATA_PHASE_CONNECTED
        }

        if (phase === MYDATA_PHASE_CONNECTED) {
          writeMydataSyncPhase(userId, MYDATA_PHASE_SYNCING)
          await syncMydataApi()
          writeMydataSyncPhase(userId, MYDATA_PHASE_SYNCED)
        }
      } catch (error) {
        mydataSyncError.value = MYDATA_SYNC_ERROR_MESSAGE
        throw error
      } finally {
        isMydataLoading.value = false
        mydataSyncRequests.delete(userId)
      }
    })()

    mydataSyncRequests.set(userId, request)
    return request
  }

  async function retryMydataInitialization() {
    const userId = useAuthStore().user?.id

    if (!userId) return initializeMydata()

    const phase = readMydataSyncPhase(userId)
    if (phase === MYDATA_PHASE_CONNECTING) {
      clearMydataSyncPhase(userId)
    } else if (phase === MYDATA_PHASE_SYNCING) {
      writeMydataSyncPhase(userId, MYDATA_PHASE_CONNECTED)
    }

    return initializeMydata()
  }

  /**
   * @param {import('@/features/auth/api/auth.api').SignupPayload} payload
   */
  async function submitSignup(payload) {
    isSubmittingSignup.value = true
    signupError.value = null
    try {
      return await signupApi(payload)
    } catch (error) {
      signupError.value =
        error?.status === 409 ? DUPLICATE_EMAIL_ERROR_MESSAGE : SIGNUP_ERROR_MESSAGE
      throw error
    } finally {
      isSubmittingSignup.value = false
    }
  }

  /**
   * 서버에 refresh token 폐기를 요청한 뒤, 서버 요청 성공 여부와 무관하게
   * 이 기기의 로그인 상태(accessToken/user)는 항상 정리한다.
   */
  async function submitLogout() {
    if (isSubmittingLogout.value) return

    isSubmittingLogout.value = true
    try {
      await logoutApi()
    } catch (error) {
      // 서버 로그아웃이 실패해도 이 기기에서는 로그아웃된 것으로 처리한다.
      console.error('로그아웃 요청 실패:', error)
    } finally {
      useAuthStore().logout()
      isSubmittingLogout.value = false
    }
  }

  return {
    submitLogin,
    resetLoginError,
    loginError,
    isSubmittingLogin,
    signupStep,
    isMydataLoading,
    mydataSyncError,
    initializeMydata,
    retryMydataInitialization,
    resetSignupError,
    signupError,
    isSubmittingSignup,
    submitSignup,
    submitLogout,
    isSubmittingLogout,
  }
})
