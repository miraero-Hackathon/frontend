import { http, HttpResponse } from 'msw'

let profile = {
  memberId: 1,
  nickname: '김미래',
  email: 'miraero@gmail.com',
  birthDate: '2001-03-15',
  profileImageUrl: null,
  company: '미래로',
  monthlyIncome: 2850000,
  kbpayLinked: true,
}

let mydataConnections = [
  {
    connectionId: 1,
    institutionName: '연결 은행',
    agreedAt: '2026-07-15T10:30:00',
    expiresAt: '2027-07-15T10:30:00',
    lastSyncedAt: '2026-07-20T09:30:00',
  },
  {
    connectionId: 2,
    institutionName: '간편결제',
    agreedAt: '2026-07-16T14:00:00',
    expiresAt: '2027-07-16T14:00:00',
    lastSyncedAt: '2026-07-20T09:35:00',
  },
  {
    connectionId: 3,
    institutionName: '연결 증권사',
    agreedAt: '2025-07-10T11:00:00',
    expiresAt: '2026-07-10T11:00:00',
    lastSyncedAt: '2026-07-09T18:20:00',
  },
]

export const mypageHandlers = [
  http.get('*/api/users/profile', () => HttpResponse.json(profile)),

  http.patch('*/api/users/profileImage', async ({ request }) => {
    const formData = await request.formData()
    const profileImage = formData.get('profileImage')

    if (!(profileImage instanceof File)) {
      return HttpResponse.json({ message: '프로필 이미지를 선택해주세요.' }, { status: 400 })
    }

    const result = {
      profileImageUrl: 'https://cdn.example.com/profile/1.png',
      updatedAt: new Date().toISOString(),
    }
    profile = { ...profile, profileImageUrl: result.profileImageUrl }
    return HttpResponse.json(result)
  }),

  http.patch('*/api/users/me/password', async ({ request }) => {
    const payload = await request.json()
    if (!payload.currentPassword || !payload.newPassword) {
      return HttpResponse.json({ message: '비밀번호 입력값을 확인해주세요.' }, { status: 400 })
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/api/mydata/connections', () =>
    HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: '마이데이터 연결 기관 조회에 성공했습니다.',
      data: { connections: mydataConnections },
    })
  ),

  http.post('*/api/accounts/sync', () => {
    const syncedAt = new Date().toISOString()
    mydataConnections = mydataConnections.map((connection) => ({
      ...connection,
      lastSyncedAt: syncedAt,
    }))

    return HttpResponse.json({
      syncedCount: 4,
      syncedAt,
      message: '계좌 정보가 성공적으로 동기화되었습니다.',
    })
  }),
]
