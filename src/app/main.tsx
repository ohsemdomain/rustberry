import { AuthProvider } from '@/app/AuthProvider'
import { trpc, trpcClient } from '@/app/trpc'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles.css'

import { routeTree } from '@/app/routeTree.gen'

const router = createRouter({ routeTree })

const queryClient = new QueryClient()

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<RouterProvider router={router} />
				</AuthProvider>
			</QueryClientProvider>
		</trpc.Provider>
	</StrictMode>,
)
