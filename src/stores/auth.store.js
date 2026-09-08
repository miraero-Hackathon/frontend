// 인증 상태 store: accessToken, user, login/logout
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { resetUserStores } from '@/stores/reset-user-stores'

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} name
 * @property {string} email
 */

const STORAGE_KEY = 'miraero_auth'

// 새로고침·직접 URL 진입에도 로그인 상태가 유지되도록 localStorage에서 복원
function loadPersistedAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const persisted = loadPersistedAuth()

  /** @type {import('vue').Ref<string | null>} */
  const accessToken = ref(persisted?.accessToken ?? null)
  /** @type {import('vue').Ref<AuthUser | null>} */
  const user = ref(persisted?.user ?? null)

  /**
   * @param {{ accessToken: string, user: AuthUser }} payload
   */
  function login(payload) {
    accessToken.value = payload.accessToken
    user.value = payload.user
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // 저장소가 차단되어도 현재 탭의 로그인 상태는 유지한다.
    }
  }

  function logout() {
    // 아직 마운트된 화면이 초기화 직후 재조회를 걸어도 유효한 토큰으로 이전 사용자의 데이터를
    // 다시 채우지 못하도록, 인증 정보를 먼저 끊고 나서 Store를 정리한다.
    accessToken.value = null
    user.value = null
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 저장소 오류가 로그아웃과 401 복구 흐름을 막지 않도록 한다.
    }
    resetUserStores()
  }

  /**
   * @param {Partial<AuthUser>} payload
   */
  function updateUser(payload) {
    if (!user.value) return
    user.value = { ...user.value, ...payload }
  }

  return { accessToken, user, login, logout, updateUser }
})
