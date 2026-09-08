// dev 환경에서만 MSW worker를 시작
export async function enableMockServiceWorker() {
  const { worker } = await import('@/mocks/browser')
  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}
