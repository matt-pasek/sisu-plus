import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from '@/app/components/dashboard/Dashboard'
import { ErrorBoundary } from '@/app/components/ui/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

export function mountApp(container: HTMLElement) {
  createRoot(container).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Dashboard />
        </ErrorBoundary>
      </QueryClientProvider>
    </StrictMode>,
  )
}
