import type { AppRouter } from '@/server/trpc/router'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = trpc.createClient({
	links: [
		httpBatchLink({
			url: '/trpc',
			headers() {
				const token = localStorage.getItem('token')
				if (token) {
					return {
						Authorization: `Bearer ${token}`,
					}
				}
				return {}
			},
		}),
	],
})
