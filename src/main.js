// 앱 엔트리포인트: Pinia, Router, MSW 등록
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import { router } from '@/app/router'
import { enableMockServiceWorker } from '@/app/plugins/msw'
import '@/assets/styles/tailwind.css'
import '@/assets/styles/tokens.css'

async function bootstrap() {
  // 프로덕션 빌드(Vercel 등)에서도 이 값이 true면 MSW를 켠다.
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    await enableMockServiceWorker()
  }

  const app = createApp(App)
  app.use(createPinia())

  app.use(router)
  app.mount('#app')
}

bootstrap()
