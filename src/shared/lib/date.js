// 날짜 포맷 유틸
/**
 * Date를 "YYYY.MM.DD" 형태로 변환한다.
 * @param {Date | string} date
 * @returns {string}
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}

/**
 * Date를 "YYYY.MM.DD HH:mm" 형태로 변환한다.
 * @param {Date | string} date
 * @returns {string}
 */
export function formatDateTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return '-'

  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd} ${hours}:${minutes}`
}

/**
 * Date를 로컬 타임존 기준 "YYYY-MM-DD" 키로 변환한다.
 * API 날짜 문자열 비교, localStorage 키 등 UTC와 어긋나면 안 되는 곳에 사용한다.
 * (Date.toISOString()은 UTC 기준이라 자정 근처 KST 사용자에게 하루 밀린 날짜를 준다)
 * @param {Date} date
 * @returns {string}
 */
export function getLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 오늘 기준 목표일까지 남은 개월 수를 계산한다.
 * @param {Date | string} targetDate
 * @returns {number}
 */
export function diffInMonths(targetDate) {
  const target = targetDate instanceof Date ? targetDate : new Date(targetDate)
  const now = new Date()
  return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
}

/**
 * 생년월일로 만 나이를 계산한다.
 * @param {string | null | undefined} birthDate yyyy-MM-dd
 * @returns {number | null}
 */
export function calculateAge(birthDate) {
  // new Date(birthDate)는 "yyyy-MM-dd"를 UTC 자정으로 해석하는데, 아래 getMonth/getDate는 로컬 시간대 기준이라
  // UTC보다 느린 시간대(미국 등)에서는 생일 하루 전부터 날짜가 하루 당겨져 나이가 잘못 계산된다.
  // 문자열을 직접 파싱해 시간대 변환을 아예 거치지 않는다.
  const match = typeof birthDate === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate) : null
  if (!match) return null

  const birthYear = Number(match[1])
  const birthMonth = Number(match[2])
  const birthDay = Number(match[3])

  const today = new Date()
  let age = today.getFullYear() - birthYear
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > birthMonth ||
    (today.getMonth() + 1 === birthMonth && today.getDate() >= birthDay)
  if (!hasHadBirthdayThisYear) age -= 1

  return age
}
