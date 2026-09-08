// auth 관련 MSW 핸들러
import { http, HttpResponse } from 'msw'

// TODO: 실제 API 연동 전까지 사용하는 mock 회원 정보
const MOCK_AUTH_USER = { userId: 1, name: '홍길동', email: 'test@example.com' }
const MOCK_TOKEN = {
  accessToken: 'mock-access-token',
  tokenType: 'Bearer',
  accessTokenExpiresIn: 1800,
}

export const authHandlers = [
  http.post('*/api/auth/login', async () => {
    return HttpResponse.json({
      token: MOCK_TOKEN,
      autoLogin: true,
      user: MOCK_AUTH_USER,
    })
  }),

  http.post('*/api/auth/signup', async ({ request }) => {
    const payload = await request.json()
    return HttpResponse.json({ userId: 1, name: '', email: payload.email }, { status: 201 })
  }),

  http.post('*/api/auth/refresh', async () => {
    return HttpResponse.json({
      token: MOCK_TOKEN,
      user: MOCK_AUTH_USER,
    })
  }),

  http.post('*/api/auth/logout', async () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('*/api/mydata/connect', async () => {
    return HttpResponse.json({
      success: true,
      data: { connectionId: 1 },
    })
  }),

  http.post('*/api/mydata/sync', async () => {
    return HttpResponse.json({ success: true, data: null })
  }),
]
