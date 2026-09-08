import { client } from '@/shared/api/client'

/**
 * @typedef {Object} Profile
 * @property {number} memberId
 * @property {string} nickname
 * @property {string} email
 * @property {string} birthDate
 * @property {string | null} profileImageUrl
 * @property {string | null} company
 * @property {number | null} monthlyIncome
 * @property {boolean} kbpayLinked
 */

/**
 * @returns {Promise<Profile>}
 */
export async function getProfile() {
  const { data: responseBody } = await client.get('/users/profile')
  return responseBody?.data ?? responseBody
}

/**
 * @typedef {Object} ProfileImageResponse
 * @property {string} profileImageUrl
 * @property {string} updatedAt
 */

/**
 * @param {File} file
 * @returns {Promise<ProfileImageResponse>}
 */
export async function updateProfileImage(file) {
  const formData = new FormData()
  formData.append('profileImage', file)

  const { data } = await client.patch('/users/profileImage', formData)
  return data
}

/**
 * @param {{ currentPassword: string, newPassword: string }} payload
 * @returns {Promise<void>}
 */
export async function changePassword(payload) {
  await client.patch('/users/me/password', payload)
}

/**
 * @typedef {Object} MydataConnection
 * @property {number} connectionId
 * @property {string} institutionName
 * @property {string} agreedAt
 * @property {string} expiresAt
 * @property {string | null} lastSyncedAt
 */

/**
 * @returns {Promise<MydataConnection[]>}
 */
export async function getMydataConnections() {
  const { data: responseBody } = await client.get('/mydata/connections')
  const connections = responseBody?.data?.connections ?? responseBody?.connections

  if (!Array.isArray(connections)) {
    throw new TypeError('마이데이터 연결 기관 응답 형식이 올바르지 않습니다.')
  }

  return connections
}

/**
 * @typedef {Object} AccountSyncResponse
 * @property {number} syncedCount
 * @property {string} syncedAt
 * @property {string} message
 */

/**
 * @returns {Promise<AccountSyncResponse>}
 */
export async function syncAccounts() {
  const { data } = await client.post('/accounts/sync')
  return data
}
