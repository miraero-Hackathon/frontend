// auth 도메인 API 함수 골격 (AUTH-01~03)
import { client } from '@/shared/api/client'
import { unwrapApiData } from '@/shared/api/unwrapApiData'

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} SignupPayload
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} AuthToken
 * @property {string} accessToken
 * @property {string} tokenType Bearer 고정
 * @property {number} accessTokenExpiresIn 초 단위
 */

/**
 * @typedef {Object} AuthUser
 * @property {number} userId
 * @property {string} name
 * @property {string} email
 */

/**
 * @typedef {Object} LoginResponse
 * @property {AuthToken} token
 * @property {boolean} autoLogin
 * @property {AuthUser} user
 */

/**
 * @param {LoginCredentials} credentials
 * @returns {Promise<LoginResponse>}
 */
export async function login(credentials) {
  const { data } = await client.post('/auth/login', credentials)
  return unwrapApiData(data)
}

/**
 * @typedef {Object} SignupResponse
 * @property {number} userId
 * @property {string} name
 * @property {string} email
 */

/**
 * @param {SignupPayload} payload
 * @returns {Promise<SignupResponse>}
 */
export async function signup(payload) {
  const { data } = await client.post('/auth/signup', payload)
  return unwrapApiData(data)
}

/**
 * 로그인 사용자의 마이데이터 연결을 생성하거나 갱신한다.
 */
export async function connectMydata() {
  const { data } = await client.post('/mydata/connect')
  return unwrapApiData(data)
}

/**
 * 연결된 마이데이터의 자산 정보를 동기화한다.
 */
export async function syncMydata() {
  const { data } = await client.post('/mydata/sync')
  return unwrapApiData(data)
}

/**
 * @typedef {Object} RefreshResponse
 * @property {AuthToken} token
 * @property {AuthUser} user
 */

/**
 * 자동로그인/Access Token 재발급. Refresh Token은 HTTP-only 쿠키로 서버에 자동 전달된다.
 * @returns {Promise<RefreshResponse>}
 */
export async function refreshAuth() {
  // TODO: 정확한 엔드포인트 경로는 백엔드팀 확인 필요
  const { data } = await client.post('/auth/refresh')
  return data
}

/**
 * 현재 브라우저의 refresh token을 서버에서 폐기하고 쿠키를 삭제한다.
 * @returns {Promise<void>}
 */
export async function logout() {
  await client.post('/auth/logout')
}

/**
 * @returns {Promise<AuthUser>}
 */
export async function getMe() {
  // TODO: 실제 API 연동 시 client.get('/auth/me')로 교체
  return { userId: 0, name: '', email: '' }
}
