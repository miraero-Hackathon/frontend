// 공통 API 응답 언랩: { success, data, error } 포맷이면 data를 꺼내고, 아니면 그대로 반환한다.
export function unwrapApiData(responseBody) {
  if (
    responseBody &&
    typeof responseBody === 'object' &&
    Object.hasOwn(responseBody, 'success') &&
    Object.hasOwn(responseBody, 'data')
  ) {
    if (!responseBody.success) {
      throw new Error(responseBody.error?.message ?? 'API 요청에 실패했습니다.')
    }
    return responseBody.data
  }

  return responseBody
}
