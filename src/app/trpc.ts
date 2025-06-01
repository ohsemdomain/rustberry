import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '~/trpc/router'

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
