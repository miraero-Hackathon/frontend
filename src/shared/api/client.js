// axios 인스턴스 생성 및 인터셉터 등록
import axios from 'axios'
import { attachRequestInterceptor, attachResponseInterceptor } from '@/shared/api/interceptors'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Refresh Token을 HTTP-only 쿠키로 주고받기 위함
})

attachRequestInterceptor(client)
attachResponseInterceptor(client)
