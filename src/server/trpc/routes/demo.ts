// src/worker/trpc/routes/demo.ts
import { publicProcedure, router } from '@/server/trpc/trpc-instance'

export const demoRouter = router({
	hello: publicProcedure.query(() => {
		return {
			name: 'Cloudflare (with tRPC)',
		}
	}),
})
